import { Controller, Get, Param, Query, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { AuditLogService } from "./audit-log.service";
import { FindAllAuditLogDto } from "./dto/find-all-audit-log.dto";
import { AuditLogResponseDto } from "./dto/audit-log-response.dto";
import {
  RequirePermission,
  PermissionGuard,
} from "@/common/guards/permission.guard";

@ApiTags("Audit Logs")
@Controller("audit-logs")
@UseGuards(AuthGuard("jwt"), PermissionGuard)
@ApiBearerAuth()
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Get()
  @RequirePermission({ resource: "audit-logs", action: "READ" })
  @ApiOperation({ summary: "Get all audit logs with pagination and filters" })
  @ApiResponse({
    status: 200,
    description: "Audit logs retrieved successfully",
    type: [AuditLogResponseDto],
  })
  findAll(@Query() query: FindAllAuditLogDto) {
    return this.auditLogService.findAll(query);
  }

  @Get(":id")
  @RequirePermission({ resource: "audit-logs", action: "READ" })
  @ApiOperation({ summary: "Get audit log by ID" })
  @ApiResponse({
    status: 200,
    description: "Audit log found",
    type: AuditLogResponseDto,
  })
  @ApiResponse({ status: 404, description: "Audit log not found" })
  findOne(@Param("id") id: string) {
    return this.auditLogService.findOne(id);
  }

  @Get("resource/:resource/:resourceId")
  @RequirePermission({ resource: "audit-logs", action: "READ" })
  @ApiOperation({ summary: "Get audit logs for a specific resource" })
  @ApiResponse({
    status: 200,
    description: "Resource audit logs retrieved successfully",
    type: [AuditLogResponseDto],
  })
  findByResource(
    @Param("resource") resource: string,
    @Param("resourceId") resourceId: string,
    @Query() query: FindAllAuditLogDto
  ) {
    return this.auditLogService.findByResource(
      resource,
      resourceId,
      query.organizationId
    );
  }

  @Get("user/:userId")
  @RequirePermission({ resource: "audit-logs", action: "READ" })
  @ApiOperation({ summary: "Get audit logs for a specific user" })
  @ApiResponse({
    status: 200,
    description: "User audit logs retrieved successfully",
    type: [AuditLogResponseDto],
  })
  findByUser(@Param("userId") userId: string) {
    return this.auditLogService.findByUser(userId);
  }
}
