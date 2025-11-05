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
import { VisitService } from "./visit.service";
import { CreateVisitDto } from "./dto/create-visit.dto";
import { UpdateVisitDto } from "./dto/update-visit.dto";
import { UpdateVisitStatusDto } from "./dto/update-visit-status.dto";
import { StartVisitDto } from "./dto/start-visit.dto";
import { CompleteVisitDto } from "./dto/complete-visit.dto";
import { FindAllVisitDto } from "./dto/find-all-visit.dto";
import { DoctorQueueResponseDto } from "./dto/doctor-queue-response.dto";
import {
  RequirePermission,
  PermissionGuard,
} from "@/common/guards/permission.guard";
import {
  CurrentUser,
  CurrentUserData,
} from "@/common/decorators/current-user.decorator";

@ApiTags("Visits")
@Controller("visits")
@UseGuards(AuthGuard("jwt"), PermissionGuard)
@ApiBearerAuth()
export class VisitController {
  constructor(private readonly visitService: VisitService) {}

  @Post()
  @RequirePermission({ resource: "visits", action: "CREATE" })
  @ApiOperation({ summary: "Create new visit (start medical appointment)" })
  @ApiResponse({ status: 201, description: "Visit created successfully" })
  @ApiResponse({
    status: 404,
    description: "Patient, Employee, or Appointment not found",
  })
  create(@Body() createVisitDto: CreateVisitDto) {
    return this.visitService.create(createVisitDto);
  }

  @Get()
  @RequirePermission({ resource: "visits", action: "READ" })
  @ApiOperation({ summary: "Get all visits with filters and pagination" })
  @ApiResponse({ status: 200, description: "List of visits" })
  findAll(@Query() query: FindAllVisitDto) {
    return this.visitService.findAll(query);
  }

  @Get(":id")
  @RequirePermission({ resource: "visits", action: "READ" })
  @ApiOperation({
    summary: "Get visit by ID with all records and prescriptions",
  })
  @ApiResponse({ status: 200, description: "Visit details" })
  @ApiResponse({ status: 404, description: "Visit not found" })
  findOne(@Param("id") id: string, @CurrentUser() user: CurrentUserData) {
    return this.visitService.findOne(
      id,
      user.role === "SUPER_ADMIN" ? undefined : user.organizationId,
    );
  }

  @Patch(":id")
  @RequirePermission({ resource: "visits", action: "UPDATE" })
  @ApiOperation({ summary: "Update visit information" })
  @ApiResponse({ status: 200, description: "Visit updated successfully" })
  @ApiResponse({ status: 404, description: "Visit not found" })
  @ApiResponse({ status: 400, description: "Cannot update completed visit" })
  update(@Param("id") id: string, @Body() updateVisitDto: UpdateVisitDto) {
    return this.visitService.update(id, updateVisitDto);
  }

  @Patch(":id/status")
  @RequirePermission({ resource: "visits", action: "UPDATE" })
  @ApiOperation({ summary: "Update visit status (complete or cancel visit)" })
  @ApiResponse({
    status: 200,
    description: "Visit status updated successfully",
  })
  @ApiResponse({ status: 404, description: "Visit not found" })
  updateStatus(
    @Param("id") id: string,
    @Body() updateStatusDto: UpdateVisitStatusDto,
  ) {
    return this.visitService.updateStatus(id, updateStatusDto);
  }

  @Post(":id/start")
  @RequirePermission({ resource: "visits", action: "UPDATE" })
  @ApiOperation({ summary: "Start visit (change from WAITING to IN_PROGRESS)" })
  @ApiResponse({ status: 200, description: "Visit started successfully" })
  @ApiResponse({ status: 404, description: "Visit not found" })
  @ApiResponse({ status: 400, description: "Cannot start visit with current status" })
  startVisit(@Param("id") id: string, @Body() dto: StartVisitDto) {
    return this.visitService.startVisit(id, dto);
  }

  @Post(":id/complete")
  @RequirePermission({ resource: "visits", action: "UPDATE" })
  @ApiOperation({ summary: "Complete visit (change from IN_PROGRESS to COMPLETED)" })
  @ApiResponse({ status: 200, description: "Visit completed successfully" })
  @ApiResponse({ status: 404, description: "Visit not found" })
  @ApiResponse({ status: 400, description: "Cannot complete visit with current status" })
  async completeVisit(
    @Param("id") id: string,
    @Body() dto: CompleteVisitDto,
  ) {
    return this.visitService.completeVisit(id, dto);
  }

  @Get("doctor/:employeeId/queue")
  async getDoctorQueue(
    @Param("employeeId") employeeId: string,
    @Query("organizationId") organizationId: string,
    @Query("date") date?: string,
  ): Promise<DoctorQueueResponseDto> {
    return this.visitService.getDoctorQueue(employeeId, organizationId, date);
  }

  @Delete(":id")
  @RequirePermission({ resource: "visits", action: "DELETE" })
  @ApiOperation({ summary: "Delete visit" })
  @ApiResponse({ status: 200, description: "Visit deleted successfully" })
  @ApiResponse({ status: 404, description: "Visit not found" })
  remove(@Param("id") id: string, @CurrentUser() user: CurrentUserData) {
    return this.visitService.remove(
      id,
      user.role === "SUPER_ADMIN" ? undefined : user.organizationId,
    );
  }
}
