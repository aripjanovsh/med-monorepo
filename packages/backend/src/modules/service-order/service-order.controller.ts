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
  Res,
  StreamableFile,
} from "@nestjs/common";
import { Response } from "express";
import { AuthGuard } from "@nestjs/passport";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { ServiceOrderService } from "./service-order.service";
import { ServiceOrderQueueService } from "./service-order-queue.service";
import { CreateServiceOrderDto } from "./dto/create-service-order.dto";
import { UpdateServiceOrderDto } from "./dto/update-service-order.dto";
import { FindAllServiceOrderDto } from "./dto/find-all-service-order.dto";
import { DepartmentQueueResponseDto } from "./dto/department-queue-response.dto";
import { StartServiceDto } from "./dto/start-service.dto";
import { CompleteServiceDto } from "./dto/complete-service.dto";
import { QueueActionDto } from "./dto/queue-action.dto";
import { DepartmentQueueDto } from "./dto/department-queue.dto";
import { plainToInstance } from "class-transformer";
import {
  RequirePermission,
  PermissionGuard,
} from "@/common/guards/permission.guard";
import {
  CurrentUser,
  CurrentUserData,
} from "@/common/decorators/current-user.decorator";

@ApiTags("Service Orders")
@Controller("service-orders")
@UseGuards(AuthGuard("jwt"), PermissionGuard)
@ApiBearerAuth()
export class ServiceOrderController {
  constructor(
    private readonly serviceOrderService: ServiceOrderService,
    private readonly queueService: ServiceOrderQueueService
  ) {}

  @Post()
  @RequirePermission({ resource: "service-orders", action: "CREATE" })
  @ApiOperation({
    summary: "Create service orders (assign services to patient)",
  })
  @ApiResponse({
    status: 201,
    description: "Service orders created successfully",
  })
  @ApiResponse({
    status: 404,
    description: "Patient, Visit, or Service not found",
  })
  create(@Body() createDto: CreateServiceOrderDto) {
    return this.serviceOrderService.create(createDto);
  }

  @Get()
  @RequirePermission({ resource: "service-orders", action: "READ" })
  @ApiOperation({
    summary: "Get all service orders with filters and pagination",
  })
  @ApiResponse({ status: 200, description: "List of service orders" })
  findAll(@Query() query: FindAllServiceOrderDto) {
    return this.serviceOrderService.findAll(query);
  }

  @Get(":id")
  @RequirePermission({ resource: "service-orders", action: "READ" })
  @ApiOperation({ summary: "Get service order by ID" })
  @ApiResponse({ status: 200, description: "Service order details" })
  @ApiResponse({ status: 404, description: "Service order not found" })
  findOne(@Param("id") id: string, @CurrentUser() user: CurrentUserData) {
    return this.serviceOrderService.findOne(
      id,
      user.isSuperAdmin ? undefined : user.organizationId
    );
  }

  @Patch(":id")
  @RequirePermission({ resource: "service-orders", action: "UPDATE" })
  @ApiOperation({
    summary: "Update service order (change status, add results, etc.)",
  })
  @ApiResponse({
    status: 200,
    description: "Service order updated successfully",
  })
  @ApiResponse({ status: 404, description: "Service order not found" })
  @ApiResponse({ status: 400, description: "Cannot modify paid order" })
  update(@Param("id") id: string, @Body() updateDto: UpdateServiceOrderDto) {
    return this.serviceOrderService.update(id, updateDto);
  }

  @Delete(":id")
  @RequirePermission({ resource: "service-orders", action: "DELETE" })
  @ApiOperation({ summary: "Delete service order" })
  @ApiResponse({
    status: 200,
    description: "Service order deleted successfully",
  })
  @ApiResponse({ status: 404, description: "Service order not found" })
  @ApiResponse({ status: 400, description: "Cannot delete paid order" })
  remove(@Param("id") id: string, @CurrentUser() user: CurrentUserData) {
    return this.serviceOrderService.remove(
      id,
      user.isSuperAdmin ? undefined : user.organizationId
    );
  }

  // ==========================================
  // QUEUE MANAGEMENT ENDPOINTS
  // ==========================================

  @Get("department/:departmentId/queue")
  @RequirePermission({ resource: "service-orders", action: "READ" })
  @ApiOperation({ summary: "Get department queue (lab/diagnostic/procedure)" })
  @ApiResponse({
    status: 200,
    description: "Department queue with waiting, in-progress, and stats",
  })
  async getDepartmentQueue(
    @Param("departmentId") departmentId: string,
    @Query() query: DepartmentQueueDto
  ): Promise<DepartmentQueueResponseDto> {
    const queue = await this.queueService.getDepartmentQueue(
      departmentId,
      query.organizationId
    );

    // Calculate waiting minutes for each item
    const now = new Date();
    const mapWithWaitingTime = (items: any[]) =>
      items.map((item) => ({
        ...item,
        waitingMinutes: item.queuedAt
          ? Math.floor((now.getTime() - item.queuedAt.getTime()) / 60000)
          : 0,
      }));

    return plainToInstance(
      DepartmentQueueResponseDto,
      {
        departmentId,
        waiting: mapWithWaitingTime(queue.waiting),
        inProgress: queue.inProgress
          ? {
              ...queue.inProgress,
              waitingMinutes: queue.inProgress.queuedAt
                ? Math.floor(
                    (now.getTime() - queue.inProgress.queuedAt.getTime()) /
                      60000
                  )
                : 0,
            }
          : undefined,
        skipped: mapWithWaitingTime(queue.skipped),
        stats: queue.stats,
      },
      { excludeExtraneousValues: true }
    );
  }

  @Post(":id/start")
  @RequirePermission({ resource: "service-orders", action: "UPDATE" })
  @ApiOperation({ summary: "Start service (begin serving patient)" })
  @ApiResponse({ status: 200, description: "Service started successfully" })
  @ApiResponse({
    status: 400,
    description: "Cannot start service with current status",
  })
  async startService(
    @Param("id") id: string,
    @Body() dto: StartServiceDto,
    @CurrentUser() user: CurrentUserData
  ) {
    await this.queueService.startService(
      id,
      dto.organizationId,
      dto.performedById || user.id
    );
    return { message: "Service started successfully" };
  }

  @Post(":id/complete")
  @RequirePermission({ resource: "service-orders", action: "UPDATE" })
  @ApiOperation({ summary: "Complete service and save results" })
  @ApiResponse({ status: 200, description: "Service completed successfully" })
  @ApiResponse({
    status: 400,
    description: "Cannot complete service with current status",
  })
  async completeService(
    @Param("id") id: string,
    @Body() dto: CompleteServiceDto
  ) {
    await this.queueService.completeService(id, dto.organizationId, {
      resultText: dto.resultText,
      resultData: dto.resultData,
      resultFileUrl: dto.resultFileUrl,
    });
    return { message: "Service completed successfully" };
  }

  @Post(":id/skip")
  @RequirePermission({ resource: "service-orders", action: "UPDATE" })
  @ApiOperation({
    summary: "Skip patient temporarily (remove from active queue)",
  })
  @ApiResponse({ status: 200, description: "Patient skipped successfully" })
  @ApiResponse({
    status: 400,
    description: "Cannot skip service with current status",
  })
  async skipPatient(@Param("id") id: string, @Body() dto: QueueActionDto) {
    await this.queueService.skipPatient(id, dto.organizationId);
    return { message: "Patient skipped successfully" };
  }

  @Post(":id/return-to-queue")
  @RequirePermission({ resource: "service-orders", action: "UPDATE" })
  @ApiOperation({ summary: "Return skipped patient back to queue" })
  @ApiResponse({
    status: 200,
    description: "Patient returned to queue successfully",
  })
  @ApiResponse({ status: 400, description: "Can only return SKIPPED orders" })
  async returnToQueue(@Param("id") id: string, @Body() dto: QueueActionDto) {
    await this.queueService.returnToQueue(id, dto.organizationId);
    return { message: "Patient returned to queue successfully" };
  }
}
