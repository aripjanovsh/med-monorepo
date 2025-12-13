import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { AppointmentService } from "./appointment.service";
import { CreateAppointmentDto } from "./dto/create-appointment.dto";
import { UpdateAppointmentDto } from "./dto/update-appointment.dto";

import { CheckInAppointmentDto } from "./dto/check-in-appointment.dto";
import { ConfirmAppointmentDto } from "./dto/confirm-appointment.dto";
import { CancelAppointmentDto } from "./dto/cancel-appointment.dto";
import { MarkNoShowAppointmentDto } from "./dto/mark-no-show-appointment.dto";
import { FindAllAppointmentDto } from "./dto/find-all-appointment.dto";
import {
  RequirePermission,
  PermissionGuard,
} from "@/common/guards/permission.guard";
import {
  CurrentUser,
  CurrentUserData,
} from "@/common/decorators/current-user.decorator";

@ApiTags("Appointments")
@Controller("appointments")
@UseGuards(AuthGuard("jwt"), PermissionGuard)
@ApiBearerAuth()
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}

  @Post()
  @RequirePermission({ resource: "appointments", action: "CREATE" })
  @ApiOperation({ summary: "Create new appointment" })
  create(@Body() createAppointmentDto: CreateAppointmentDto) {
    return this.appointmentService.create(createAppointmentDto);
  }

  @Get()
  @RequirePermission({ resource: "appointments", action: "READ" })
  @ApiOperation({ summary: "Get all appointments with filters and pagination" })
  findAll(@Query() query: FindAllAppointmentDto) {
    return this.appointmentService.findAll(query);
  }

  @Get(":id")
  @RequirePermission({ resource: "appointments", action: "READ" })
  @ApiOperation({ summary: "Get appointment by ID" })
  findOne(@Param("id") id: string, @CurrentUser() user: CurrentUserData) {
    return this.appointmentService.findOne(
      id,
      user.isSuperAdmin ? undefined : user.organizationId
    );
  }

  @Patch(":id")
  @RequirePermission({ resource: "appointments", action: "UPDATE" })
  @ApiOperation({ summary: "Update appointment information" })
  @ApiResponse({
    status: 400,
    description: "Time slot conflicts with an existing appointment",
  })
  update(
    @Param("id") id: string,
    @Body() updateAppointmentDto: UpdateAppointmentDto
  ) {
    return this.appointmentService.update(id, updateAppointmentDto);
  }

  @Post(":id/check-in")
  @RequirePermission({ resource: "appointments", action: "UPDATE" })
  @ApiOperation({ summary: "Check-in patient for appointment" })
  checkIn(@Body() dto: CheckInAppointmentDto, @Param("id") id: string) {
    return this.appointmentService.checkIn(id, dto);
  }

  @Post(":id/confirm")
  @RequirePermission({ resource: "appointments", action: "UPDATE" })
  @ApiOperation({ summary: "Confirm appointment" })
  confirm(
    @Param("id") id: string,
    @Body() dto: ConfirmAppointmentDto,
    @CurrentUser() user: CurrentUserData
  ) {
    return this.appointmentService.confirm(id, dto, user.id);
  }

  @Post(":id/cancel")
  @RequirePermission({ resource: "appointments", action: "UPDATE" })
  @ApiOperation({ summary: "Cancel appointment" })
  cancel(
    @Param("id") id: string,
    @Body() dto: CancelAppointmentDto,
    @CurrentUser() user: CurrentUserData
  ) {
    return this.appointmentService.cancel(id, dto, user.id);
  }

  @Post(":id/no-show")
  @RequirePermission({ resource: "appointments", action: "UPDATE" })
  @ApiOperation({ summary: "Mark appointment as no-show" })
  markNoShow(@Param("id") id: string, @Body() dto: MarkNoShowAppointmentDto) {
    return this.appointmentService.markNoShow(id, dto);
  }

  @Delete(":id")
  @RequirePermission({ resource: "appointments", action: "DELETE" })
  @ApiOperation({ summary: "Delete appointment" })
  remove(@Param("id") id: string, @CurrentUser() user: CurrentUserData) {
    return this.appointmentService.remove(
      id,
      user.isSuperAdmin ? undefined : user.organizationId
    );
  }
}
