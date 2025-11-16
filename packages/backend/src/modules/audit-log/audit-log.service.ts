import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "@/common/prisma/prisma.service";
import { CreateAuditLogDto } from "./dto/create-audit-log.dto";
import { FindAllAuditLogDto } from "./dto/find-all-audit-log.dto";
import { AuditLogResponseDto } from "./dto/audit-log-response.dto";
import { PaginatedResponseDto } from "@/common/dto/pagination.dto";
import { plainToInstance } from "class-transformer";

@Injectable()
export class AuditLogService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateAuditLogDto): Promise<AuditLogResponseDto> {
    const auditLog = await this.prisma.auditLog.create({
      data: {
        action: dto.action,
        resource: dto.resource,
        resourceId: dto.resourceId,
        userId: dto.userId,
        employeeId: dto.employeeId,
        organizationId: dto.organizationId,
        ipAddress: dto.ipAddress,
        userAgent: dto.userAgent,
        metadata: dto.metadata as Prisma.JsonValue,
        changes: dto.changes as Prisma.JsonValue,
      },
      include: {
        user: {
          select: {
            id: true,
            phone: true,
            role: true,
          },
        },
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return plainToInstance(AuditLogResponseDto, auditLog);
  }

  async createMany(dtos: CreateAuditLogDto[]): Promise<{ count: number }> {
    const result = await this.prisma.auditLog.createMany({
      data: dtos.map((dto) => ({
        action: dto.action,
        resource: dto.resource,
        resourceId: dto.resourceId,
        userId: dto.userId,
        employeeId: dto.employeeId,
        organizationId: dto.organizationId,
        ipAddress: dto.ipAddress,
        userAgent: dto.userAgent,
        metadata: dto.metadata as Prisma.JsonValue,
        changes: dto.changes as Prisma.JsonValue,
      })),
    });

    return result;
  }

  async findAll(
    query: FindAllAuditLogDto
  ): Promise<PaginatedResponseDto<AuditLogResponseDto>> {
    const {
      page,
      limit,
      sortBy,
      sortOrder,
      organizationId,
      action,
      resource,
      resourceId,
      userId,
      employeeId,
      dateFrom,
      dateTo,
      includeResource,
    } = query;

    const skip = (page - 1) * limit;

    const where: Prisma.AuditLogWhereInput = {};

    if (organizationId) {
      where.organizationId = organizationId;
    }

    if (action) {
      where.action = action;
    }

    if (resource) {
      where.resource = resource;
    }

    if (resourceId) {
      where.resourceId = resourceId;
    }

    if (userId) {
      where.userId = userId;
    }

    if (employeeId) {
      where.employeeId = employeeId;
    }

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) {
        where.createdAt.gte = dateFrom;
      }
      if (dateTo) {
        where.createdAt.lte = dateTo;
      }
    }

    const [data, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy ?? "createdAt"]: sortOrder },
        include: {
          user: {
            select: {
              id: true,
              phone: true,
              role: true,
            },
          },
          employee: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    let auditLogs = plainToInstance(AuditLogResponseDto, data);

    // Enrich with related resource data if requested
    if (includeResource) {
      auditLogs = await this.enrichWithResourceData(auditLogs);
    }

    return {
      data: auditLogs,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<AuditLogResponseDto> {
    const auditLog = await this.prisma.auditLog.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            phone: true,
            role: true,
          },
        },
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!auditLog) {
      throw new NotFoundException(`Audit log with ID ${id} not found`);
    }

    return plainToInstance(AuditLogResponseDto, auditLog);
  }

  async findByResource(
    resource: string,
    resourceId: string,
    organizationId: string
  ): Promise<AuditLogResponseDto[]> {
    const auditLogs = await this.prisma.auditLog.findMany({
      where: {
        resource,
        resourceId,
        organizationId,
      },
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            phone: true,
            role: true,
          },
        },
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return plainToInstance(AuditLogResponseDto, auditLogs);
  }

  async findByUser(userId: string): Promise<AuditLogResponseDto[]> {
    const auditLogs = await this.prisma.auditLog.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            phone: true,
            role: true,
          },
        },
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return plainToInstance(AuditLogResponseDto, auditLogs);
  }

  /**
   * Get related resource data for audit log
   * Dynamically loads the actual resource (Patient, Employee, etc.)
   */
  async getRelatedResourceData(
    resource: string,
    resourceId: string
  ): Promise<any> {
    if (!resourceId) {
      return null;
    }

    try {
      // Map resource names to Prisma model names
      const modelMap: Record<string, string> = {
        PATIENT: "patient",
        EMPLOYEE: "employee",
        USER: "user",
        VISIT: "visit",
        APPOINTMENT: "appointment",
        INVOICE: "invoice",
        INVOICE_ITEM: "invoiceItem",
        PAYMENT: "payment",
        SERVICE_ORDER: "serviceOrder",
        SERVICE: "service",
        DEPARTMENT: "department",
        ROLE: "role",
        ORGANIZATION: "organization",
        PROTOCOL_TEMPLATE: "protocolTemplate",
        ANALYSIS_TEMPLATE: "analysisTemplate",
        PRESCRIPTION: "prescription",
        PATIENT_PARAMETER: "patientParameter",
        PATIENT_ALLERGY: "patientAllergy",
        PARAMETER_DEFINITION: "parameterDefinition",
        TITLE: "title",
        SERVICE_TYPE: "serviceType",
        FILE: "file",
      };

      const modelName = modelMap[resource];
      if (!modelName) {
        return null;
      }

      // @ts-ignore - Dynamic model access
      const model = this.prisma[modelName];
      if (!model) {
        return null;
      }

      const data = await model.findUnique({
        where: { id: resourceId },
      });

      return data;
    } catch (error) {
      // Resource might be deleted, return null
      return null;
    }
  }

  /**
   * Enrich audit logs with related resource data (OPTIMIZED)
   * Groups by resource type and loads in batches to avoid N+1 queries
   */
  async enrichWithResourceData(
    auditLogs: AuditLogResponseDto[]
  ): Promise<AuditLogResponseDto[]> {
    if (!auditLogs.length) {
      return auditLogs;
    }

    // Group logs by resource type
    const groupedByResource = auditLogs.reduce(
      (acc, log) => {
        if (!log.resourceId) return acc;

        if (!acc[log.resource]) {
          acc[log.resource] = [];
        }
        acc[log.resource].push(log);
        return acc;
      },
      {} as Record<string, AuditLogResponseDto[]>
    );

    // Load all resources for each type in parallel
    const resourceDataByType = await Promise.all(
      Object.entries(groupedByResource).map(async ([resource, logs]) => {
        const resourceIds = logs
          .map((log) => log.resourceId)
          .filter(Boolean) as string[];

        const data = await this.batchLoadResources(resource, resourceIds);
        return { resource, data };
      })
    );

    // Create a map for quick lookup
    const resourceMap = new Map<string, any>();
    for (const { resource, data } of resourceDataByType) {
      for (const item of data) {
        resourceMap.set(`${resource}:${item.id}`, item);
      }
    }

    // Enrich logs with loaded data
    return auditLogs.map((log) => ({
      ...log,
      relatedResource: log.resourceId
        ? resourceMap.get(`${log.resource}:${log.resourceId}`) || null
        : null,
    }));
  }

  /**
   * Batch load multiple resources of the same type
   */
  private async batchLoadResources(
    resource: string,
    resourceIds: string[]
  ): Promise<any[]> {
    if (!resourceIds.length) {
      return [];
    }

    try {
      const modelMap: Record<string, string> = {
        PATIENT: "patient",
        EMPLOYEE: "employee",
        USER: "user",
        VISIT: "visit",
        APPOINTMENT: "appointment",
        INVOICE: "invoice",
        INVOICE_ITEM: "invoiceItem",
        PAYMENT: "payment",
        SERVICE_ORDER: "serviceOrder",
        SERVICE: "service",
        DEPARTMENT: "department",
        ROLE: "role",
        ORGANIZATION: "organization",
        PROTOCOL_TEMPLATE: "protocolTemplate",
        ANALYSIS_TEMPLATE: "analysisTemplate",
        PRESCRIPTION: "prescription",
        PATIENT_PARAMETER: "patientParameter",
        PATIENT_ALLERGY: "patientAllergy",
        PARAMETER_DEFINITION: "parameterDefinition",
        TITLE: "title",
        SERVICE_TYPE: "serviceType",
        FILE: "file",
      };

      const modelName = modelMap[resource];
      if (!modelName) {
        return [];
      }

      // @ts-ignore - Dynamic model access
      const model = this.prisma[modelName];
      if (!model) {
        return [];
      }

      // Load all resources in one query
      const data = await model.findMany({
        where: {
          id: {
            in: resourceIds,
          },
        },
      });

      return data;
    } catch (error) {
      return [];
    }
  }
}
