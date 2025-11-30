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
import { StatsQueryDto } from "./dto/stats-query.dto";
import { StatsResponseDto } from "./dto/stat-response.dto";
import { PatientStatsQueryDto } from "./dto/patient-stats-query.dto";
import { PatientStatsResponseDto } from "./dto/patient-stats-response.dto";
import { InvoiceStatsQueryDto } from "./dto/invoice-stats-query.dto";
import { InvoiceStatsResponseDto } from "./dto/invoice-stats-response.dto";
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
    private readonly invoiceStatsService: InvoiceStatsService
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
}
