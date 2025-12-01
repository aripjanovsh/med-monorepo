import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { StatsService } from "./stats.service";
import { PatientStatsService } from "./patient-stats.service";
import { InvoiceStatsService } from "./invoice-stats.service";
import { EmployeeStatsService } from "./employee-stats.service";
import { PatientDashboardStatsService } from "./patient-dashboard-stats.service";
import { StatsQueryDto } from "./dto/stats-query.dto";
import { StatsResponseDto } from "./dto/stat-response.dto";
import { PatientStatsQueryDto } from "./dto/patient-stats-query.dto";
import { PatientStatsResponseDto } from "./dto/patient-stats-response.dto";
import { InvoiceStatsQueryDto } from "./dto/invoice-stats-query.dto";
import { InvoiceStatsResponseDto } from "./dto/invoice-stats-response.dto";
import { EmployeeStatsQueryDto } from "./dto/employee-stats-query.dto";
import { EmployeeStatsResponseDto } from "./dto/employee-stats-response.dto";
import { PatientDashboardStatsQueryDto } from "./dto/patient-dashboard-stats-query.dto";
import { PatientDashboardStatsResponseDto } from "./dto/patient-dashboard-stats-response.dto";
import { EmployeeQuickStatsService } from "./employee-quick-stats.service";
import { EmployeeQuickStatsQueryDto } from "./dto/employee-quick-stats-query.dto";
import { EmployeeQuickStatsResponseDto } from "./dto/employee-quick-stats-response.dto";
import {
  RequirePermission,
  PermissionGuard,
} from "@/common/guards/permission.guard";

@ApiTags("Statistics")
@Controller("stats")
@UseGuards(AuthGuard("jwt"), PermissionGuard)
@ApiBearerAuth()
export class StatsController {
  constructor(
    private readonly statsService: StatsService,
    private readonly patientStatsService: PatientStatsService,
    private readonly invoiceStatsService: InvoiceStatsService,
    private readonly employeeStatsService: EmployeeStatsService,
    private readonly employeeQuickStatsService: EmployeeQuickStatsService,
    private readonly patientDashboardStatsService: PatientDashboardStatsService
  ) {}

  @Get()
  @RequirePermission({ resource: "stats", action: "READ" })
  @ApiOperation({ summary: "Get all statistics for date range" })
  @ApiResponse({
    status: 200,
    description: "All statistics data",
    type: StatsResponseDto,
  })
  getStats(@Query() query: StatsQueryDto): Promise<StatsResponseDto> {
    return this.statsService.getStats(query);
  }

  @Get("patients")
  @RequirePermission({ resource: "stats", action: "READ" })
  @ApiOperation({ summary: "Get patient statistics" })
  @ApiResponse({
    status: 200,
    description: "Patient statistics data",
    type: PatientStatsResponseDto,
  })
  getPatientStats(
    @Query() query: PatientStatsQueryDto
  ): Promise<PatientStatsResponseDto> {
    return this.patientStatsService.getPatientStats(query);
  }

  @Get("invoices")
  @RequirePermission({ resource: "stats", action: "READ" })
  @ApiOperation({ summary: "Get invoice statistics" })
  @ApiResponse({
    status: 200,
    description: "Invoice statistics data",
    type: InvoiceStatsResponseDto,
  })
  getInvoiceStats(
    @Query() query: InvoiceStatsQueryDto
  ): Promise<InvoiceStatsResponseDto> {
    return this.invoiceStatsService.getInvoiceStats(query);
  }

  @Get("employees")
  @RequirePermission({ resource: "stats", action: "READ" })
  @ApiOperation({ summary: "Get employee dashboard statistics" })
  @ApiResponse({
    status: 200,
    description: "Employee dashboard statistics data",
    type: EmployeeStatsResponseDto,
  })
  @ApiResponse({ status: 404, description: "Employee not found" })
  getEmployeeStats(
    @Query() query: EmployeeStatsQueryDto
  ): Promise<EmployeeStatsResponseDto> {
    return this.employeeStatsService.getDashboardStats(query);
  }

  @Get("employees/quick")
  @RequirePermission({ resource: "stats", action: "READ" })
  @ApiOperation({ summary: "Get employee quick statistics for list page" })
  @ApiResponse({
    status: 200,
    description: "Employee quick statistics data",
    type: EmployeeQuickStatsResponseDto,
  })
  getEmployeeQuickStats(
    @Query() query: EmployeeQuickStatsQueryDto
  ): Promise<EmployeeQuickStatsResponseDto> {
    return this.employeeQuickStatsService.getEmployeeQuickStats(query);
  }

  @Get("patients/dashboard")
  @RequirePermission({ resource: "stats", action: "READ" })
  @ApiOperation({ summary: "Get patient dashboard statistics" })
  @ApiResponse({
    status: 200,
    description: "Patient dashboard statistics data",
    type: PatientDashboardStatsResponseDto,
  })
  @ApiResponse({ status: 404, description: "Patient not found" })
  getPatientDashboardStats(
    @Query() query: PatientDashboardStatsQueryDto
  ): Promise<PatientDashboardStatsResponseDto> {
    return this.patientDashboardStatsService.getDashboardStats(query);
  }
}
