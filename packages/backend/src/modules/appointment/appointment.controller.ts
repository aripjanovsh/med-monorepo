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
import { UpdateAppointmentStatusDto } from "./dto/update-appointment-status.dto";
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
  @ApiResponse({
    status: 201,
    description: "Appointment created successfully",
  })
  @ApiResponse({
    status: 404,
    description: "Patient, Employee, Service, or User not found",
  })
  @ApiResponse({
    status: 400,
    description: "Time slot conflicts with an existing appointment",
  })
  create(@Body() createAppointmentDto: CreateAppointmentDto) {
    return this.appointmentService.create(createAppointmentDto);
  }

  @Get()
  @RequirePermission({ resource: "appointments", action: "READ" })
  @ApiOperation({ summary: "Get all appointments with filters and pagination" })
  @ApiResponse({ status: 200, description: "List of appointments" })
  findAll(@Query() query: FindAllAppointmentDto) {
    return this.appointmentService.findAll(query);
  }

  @Get(":id")
  @RequirePermission({ resource: "appointments", action: "READ" })
  @ApiOperation({ summary: "Get appointment by ID" })
  @ApiResponse({ status: 200, description: "Appointment details" })
  @ApiResponse({ status: 404, description: "Appointment not found" })
  findOne(@Param("id") id: string, @CurrentUser() user: CurrentUserData) {
    return this.appointmentService.findOne(
      id,
      user.role === "SUPER_ADMIN" ? undefined : user.organizationId,
    );
  }

  @Patch(":id")
  @RequirePermission({ resource: "appointments", action: "UPDATE" })
  @ApiOperation({ summary: "Update appointment information" })
  @ApiResponse({
    status: 200,
    description: "Appointment updated successfully",
  })
  @ApiResponse({ status: 404, description: "Appointment not found" })
  @ApiResponse({
    status: 400,
    description: "Time slot conflicts with an existing appointment",
  })
  update(
    @Param("id") id: string,
    @Body() updateAppointmentDto: UpdateAppointmentDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.appointmentService.update(
      id,
      user.role === "SUPER_ADMIN" ? undefined : user.organizationId,
      updateAppointmentDto,
    );
  }

  @Patch(":id/status")
  @RequirePermission({ resource: "appointments", action: "UPDATE" })
  @ApiOperation({ summary: "Update appointment status" })
  @ApiResponse({
    status: 200,
    description: "Appointment status updated successfully",
  })
  @ApiResponse({ status: 404, description: "Appointment not found" })
  @ApiResponse({
    status: 400,
    description: "Invalid status transition",
  })
  updateStatus(
    @Param("id") id: string,
    @Body() updateStatusDto: UpdateAppointmentStatusDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.appointmentService.updateStatus(
      id,
      user.role === "SUPER_ADMIN" ? undefined : user.organizationId,
      updateStatusDto,
    );
  }

  @Post(":id/check-in")
  @RequirePermission({ resource: "appointments", action: "UPDATE" })
  @ApiOperation({ summary: "Check-in patient for appointment" })
  @ApiResponse({
    status: 200,
    description: "Patient checked in successfully",
  })
  @ApiResponse({ status: 404, description: "Appointment not found" })
  checkIn(@Param("id") id: string, @CurrentUser() user: CurrentUserData) {
    return this.appointmentService.checkIn(
      id,
      user.role === "SUPER_ADMIN" ? undefined : user.organizationId,
    );
  }

  @Post(":id/confirm")
  @RequirePermission({ resource: "appointments", action: "UPDATE" })
  @ApiOperation({ summary: "Confirm appointment" })
  @ApiResponse({
    status: 200,
    description: "Appointment confirmed successfully",
  })
  @ApiResponse({ status: 404, description: "Appointment not found" })
  confirm(@Param("id") id: string, @CurrentUser() user: CurrentUserData) {
    return this.appointmentService.confirm(
      id,
      user.role === "SUPER_ADMIN" ? undefined : user.organizationId,
      user.id,
    );
  }

  @Post(":id/cancel")
  @RequirePermission({ resource: "appointments", action: "UPDATE" })
  @ApiOperation({ summary: "Cancel appointment" })
  @ApiResponse({
    status: 200,
    description: "Appointment cancelled successfully",
  })
  @ApiResponse({ status: 404, description: "Appointment not found" })
  @ApiResponse({
    status: 400,
    description: "Cancel reason is required",
  })
  cancel(
    @Param("id") id: string,
    @Body("cancelReason") cancelReason: string,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.appointmentService.cancel(
      id,
      user.role === "SUPER_ADMIN" ? undefined : user.organizationId,
      user.id,
      cancelReason,
    );
  }

  @Post(":id/no-show")
  @RequirePermission({ resource: "appointments", action: "UPDATE" })
  @ApiOperation({ summary: "Mark appointment as no-show" })
  @ApiResponse({
    status: 200,
    description: "Appointment marked as no-show",
  })
  @ApiResponse({ status: 404, description: "Appointment not found" })
  markNoShow(@Param("id") id: string, @CurrentUser() user: CurrentUserData) {
    return this.appointmentService.markNoShow(
      id,
      user.role === "SUPER_ADMIN" ? undefined : user.organizationId,
    );
  }

  @Delete(":id")
  @RequirePermission({ resource: "appointments", action: "DELETE" })
  @ApiOperation({ summary: "Delete appointment" })
  @ApiResponse({
    status: 200,
    description: "Appointment deleted successfully",
  })
  @ApiResponse({ status: 404, description: "Appointment not found" })
  @ApiResponse({
    status: 400,
    description: "Cannot delete appointment with associated visits",
  })
  remove(@Param("id") id: string, @CurrentUser() user: CurrentUserData) {
    return this.appointmentService.remove(
      id,
      user.role === "SUPER_ADMIN" ? undefined : user.organizationId,
    );
  }
}
