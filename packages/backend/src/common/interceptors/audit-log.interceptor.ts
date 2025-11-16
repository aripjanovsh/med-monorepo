import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Observable } from "rxjs";
import { tap, catchError } from "rxjs/operators";
import { AuditAction } from "@prisma/client";
import { AuditLogService } from "@/modules/audit-log/audit-log.service";
import { CurrentUserData } from "@/common/decorators/current-user.decorator";
import { SKIP_AUDIT_KEY } from "@/common/decorators/skip-audit.decorator";
import { calculateDiff, sanitizeForAudit } from "@/common/utils/diff.util";
import { PrismaService } from "@/common/prisma/prisma.service";

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditLogInterceptor.name);

  constructor(
    private readonly auditLogService: AuditLogService,
    private readonly prisma: PrismaService,
    private readonly reflector: Reflector
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler
  ): Promise<Observable<any>> {
    // Check if audit should be skipped for this handler
    const skipAudit = this.reflector.getAllAndOverride<boolean>(
      SKIP_AUDIT_KEY,
      [context.getHandler(), context.getClass()]
    );

    console.log("skipAudit", skipAudit);

    if (skipAudit) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const method = request.method;
    const path = request.route?.path || request.url;

    console.log("method", method);
    console.log("path", path);

    // Skip audit logs endpoints and health checks
    if (
      path.includes("/audit-logs") ||
      path.includes("/health") ||
      path.includes("/auth/login") ||
      method === "GET"
    ) {
      return next.handle();
    }

    const user: CurrentUserData = request.user;

    console.log("user", user);

    // Skip if no user (public endpoints)
    if (!user) {
      return next.handle();
    }

    // Determine action based on HTTP method
    let action: AuditAction | null = null;
    if (method === "POST") action = AuditAction.CREATE;
    if (method === "PATCH" || method === "PUT") action = AuditAction.UPDATE;
    if (method === "DELETE") action = AuditAction.DELETE;

    // Skip if not a tracked action
    if (!action) {
      return next.handle();
    }

    // Extract resource name from path
    const resource = this.extractResourceName(path);
    console.log("resource", resource);
    if (!resource) {
      return next.handle();
    }

    // Extract resource ID from path or body
    const resourceId = this.extractResourceId(request, path);

    // Get old data for UPDATE operations
    let oldData: any = null;
    if (action === AuditAction.UPDATE && resourceId) {
      oldData = await this.getOldData(resource, resourceId);
    }

    // Extract IP and User Agent
    const ipAddress =
      request.headers["x-forwarded-for"] || request.connection.remoteAddress;
    const userAgent = request.headers["user-agent"];

    return next.handle().pipe(
      tap(async (response) => {
        try {
          let changes: Record<string, any> | undefined;
          let metadata: Record<string, any> | undefined;

          // Calculate diff for UPDATE
          if (action === AuditAction.UPDATE && oldData && response) {
            const newData = response;
            changes = calculateDiff(oldData, newData);

            // Only log if there are actual changes
            if (Object.keys(changes).length === 0) {
              return;
            }
          }

          // Add metadata for CREATE/DELETE
          if (action === AuditAction.CREATE || action === AuditAction.DELETE) {
            metadata = sanitizeForAudit(
              action === AuditAction.CREATE ? request.body : oldData
            );
          }

          console.log("audit log", {
            action,
            resource,
            resourceId,
          });

          // Create audit log asynchronously
          await this.auditLogService.create({
            action,
            resource,
            resourceId: resourceId || response?.id,
            userId: user.id,
            employeeId: user.employeeId,
            organizationId: user.organizationId,
            ipAddress,
            userAgent,
            metadata,
            changes,
          });
        } catch (error) {
          // Log error but don't fail the request
          this.logger.error(`Failed to create audit log: ${error.message}`);
        }
      }),
      catchError((error) => {
        // Log failed operations as well
        this.auditLogService
          .create({
            action,
            resource,
            resourceId,
            userId: user.id,
            employeeId: user.employeeId,
            organizationId: user.organizationId,
            ipAddress,
            userAgent,
            metadata: {
              error: error.message,
              body: sanitizeForAudit(request.body),
            },
          })
          .catch((auditError) => {
            this.logger.error(
              `Failed to log error in audit: ${auditError.message}`
            );
          });

        throw error;
      })
    );
  }

  private extractResourceName(path: string): string | null {
    // Remove query params and leading/trailing slashes
    const cleanPath = path.split("?")[0].replace(/^\/|\/$/g, "");

    // Split path into segments
    const segments = cleanPath.split("/");

    // Filter out api/version prefixes and UUIDs
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const resourceSegments = segments.filter(
      (segment) =>
        segment &&
        segment !== "api" &&
        !segment.startsWith("v") &&
        !uuidRegex.test(segment)
    );

    // Map resource names to model names
    const resourceMap: Record<string, string> = {
      patients: "PATIENT",
      employees: "EMPLOYEE",
      users: "USER",
      visits: "VISIT",
      appointments: "APPOINTMENT",
      invoices: "INVOICE",
      payments: "PAYMENT",
      items: "INVOICE_ITEM",
      "service-orders": "SERVICE_ORDER",
      services: "SERVICE",
      departments: "DEPARTMENT",
      roles: "ROLE",
      organizations: "ORGANIZATION",
      "protocol-templates": "PROTOCOL_TEMPLATE",
      "analysis-templates": "ANALYSIS_TEMPLATE",
      prescriptions: "PRESCRIPTION",
      "patient-parameters": "PATIENT_PARAMETER",
      "patient-allergies": "PATIENT_ALLERGY",
      "parameter-definitions": "PARAMETER_DEFINITION",
      titles: "TITLE",
      "service-types": "SERVICE_TYPE",
      files: "FILE",
    };

    // For nested resources (e.g., /invoices/:id/payments),
    // prioritize the last segment if it's a known resource
    for (let i = resourceSegments.length - 1; i >= 0; i--) {
      const segment = resourceSegments[i];
      if (resourceMap[segment]) {
        return resourceMap[segment];
      }
    }

    return null;
  }

  private extractResourceId(request: any, path: string): string | null {
    // Try to get ID from path params
    if (request.params?.id) {
      return request.params.id;
    }

    // Try to extract from path (e.g., /patients/123 -> 123)
    const segments = path.split("/");
    const lastSegment = segments[segments.length - 1];

    // Check if last segment is a UUID
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (lastSegment && uuidRegex.test(lastSegment)) {
      return lastSegment;
    }

    return null;
  }

  private async getOldData(resource: string, resourceId: string): Promise<any> {
    try {
      // Map resource names to Prisma model names
      const modelName = resource.charAt(0).toLowerCase() + resource.slice(1);

      // @ts-ignore - Dynamic model access
      const model = this.prisma[modelName];
      if (!model) {
        return null;
      }

      return await model.findUnique({
        where: { id: resourceId },
      });
    } catch (error) {
      this.logger.warn(
        `Failed to get old data for ${resource}:${resourceId}: ${error.message}`
      );
      return null;
    }
  }
}
