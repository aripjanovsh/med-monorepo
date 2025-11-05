import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Query,
  Param,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { ReceptionService } from "./reception.service";
import { DashboardStatsDto } from "./dto/dashboard-stats.dto";
import { QuickCreateVisitDto } from "./dto/quick-create-visit.dto";
import { CheckInVisitDto } from "./dto/check-in-visit.dto";
import { DashboardStatsResponseDto } from "./dto/dashboard-stats-response.dto";
import { QueueItemResponseDto } from "./dto/queue-item-response.dto";
import { DoctorScheduleResponseDto } from "./dto/doctor-schedule-response.dto";
import { QueueDashboardResponseDto } from "./dto/queue-dashboard-response.dto";
import {
  RequirePermission,
  PermissionGuard,
} from "@/common/guards/permission.guard";
import {
  CurrentUser,
  CurrentUserData,
} from "@/common/decorators/current-user.decorator";

@ApiTags("Reception Dashboard")
@Controller("reception")
@UseGuards(AuthGuard("jwt"), PermissionGuard)
@ApiBearerAuth()
export class ReceptionController {
  constructor(private readonly receptionService: ReceptionService) {}

  @Get("dashboard/stats")
  @RequirePermission({ resource: "reception", action: "READ" })
  @ApiOperation({ summary: "Get reception dashboard statistics" })
  @ApiResponse({
    status: 200,
    description: "Dashboard statistics",
    type: DashboardStatsResponseDto,
  })
  getDashboardStats(
    @Query() query: DashboardStatsDto,
  ): Promise<DashboardStatsResponseDto> {
    return this.receptionService.getDashboardStats(query);
  }

  @Get("dashboard/queue")
  @RequirePermission({ resource: "reception", action: "READ" })
  @ApiOperation({ summary: "Get waiting queue" })
  @ApiResponse({
    status: 200,
    description: "Queue with patients waiting",
    type: [QueueItemResponseDto],
  })
  getQueue(@CurrentUser() user: CurrentUserData): Promise<QueueItemResponseDto[]> {
    return this.receptionService.getQueue(user.organizationId);
  }

  @Get("dashboard/doctors")
  @RequirePermission({ resource: "reception", action: "READ" })
  @ApiOperation({ summary: "Get doctor schedules and status" })
  @ApiResponse({
    status: 200,
    description: "Doctor schedules",
    type: [DoctorScheduleResponseDto],
  })
  getDoctorSchedule(
    @CurrentUser() user: CurrentUserData,
    @Query("date") date?: string,
    @Query("departmentId") departmentId?: string,
  ): Promise<DoctorScheduleResponseDto[]> {
    return this.receptionService.getDoctorSchedule(
      user.organizationId,
      date,
      departmentId,
    );
  }

  @Post("visits/quick-create")
  @RequirePermission({ resource: "visits", action: "CREATE" })
  @ApiOperation({
    summary: "Quick create visit without appointment (walk-in patient)",
  })
  @ApiResponse({ status: 201, description: "Visit created successfully" })
  @ApiResponse({ status: 404, description: "Patient, Employee or Service not found" })
  quickCreateVisit(
    @Body() dto: QuickCreateVisitDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.receptionService.quickCreateVisit(dto, user.id);
  }

  @Post("visits/check-in")
  @RequirePermission({ resource: "visits", action: "CREATE" })
  @ApiOperation({
    summary: "Check-in patient to doctor queue (STANDARD/EMERGENCY/WITHOUT_QUEUE)",
  })
  @ApiResponse({ status: 201, description: "Visit checked in successfully" })
  @ApiResponse({ status: 404, description: "Patient or Employee not found" })
  checkIn(
    @Body() dto: CheckInVisitDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.receptionService.checkIn(dto, user.id);
  }

  @Get("dashboard/queue-board")
  @RequirePermission({ resource: "reception", action: "READ" })
  @ApiOperation({ summary: "Get queue dashboard with active doctors and their queues" })
  @ApiResponse({
    status: 200,
    description: "Queue dashboard with doctors and stats",
    type: QueueDashboardResponseDto,
  })
  getQueueDashboard(
    @CurrentUser() user: CurrentUserData,
    @Query("date") date?: string,
  ): Promise<QueueDashboardResponseDto> {
    return this.receptionService.getQueueDashboard(user.organizationId, date);
  }
}
