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
    @Query() query: DashboardStatsDto
  ): Promise<DashboardStatsResponseDto> {
    return this.receptionService.getDashboardStats(query);
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
    @Query("departmentId") departmentId?: string
  ): Promise<DoctorScheduleResponseDto[]> {
    return this.receptionService.getDoctorSchedule(
      user.organizationId,
      date,
      departmentId
    );
  }

  @Get("dashboard/queue-board")
  @RequirePermission({ resource: "reception", action: "READ" })
  @ApiOperation({
    summary: "Get queue dashboard with active doctors and their queues",
  })
  @ApiResponse({
    status: 200,
    description: "Queue dashboard with doctors and stats",
    type: QueueDashboardResponseDto,
  })
  getQueueDashboard(
    @CurrentUser() user: CurrentUserData,
    @Query("date") date?: string
  ): Promise<QueueDashboardResponseDto> {
    return this.receptionService.getQueueDashboard(user.organizationId, date);
  }
}
