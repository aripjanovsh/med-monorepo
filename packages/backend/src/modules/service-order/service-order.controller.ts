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
import { ServiceOrderService } from "./service-order.service";
import { CreateServiceOrderDto } from "./dto/create-service-order.dto";
import { UpdateServiceOrderDto } from "./dto/update-service-order.dto";
import { FindAllServiceOrderDto } from "./dto/find-all-service-order.dto";
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
  constructor(private readonly serviceOrderService: ServiceOrderService) {}

  @Post()
  @RequirePermission({ resource: "service-orders", action: "CREATE" })
  @ApiOperation({ summary: "Create service orders (assign services to patient)" })
  @ApiResponse({ status: 201, description: "Service orders created successfully" })
  @ApiResponse({ status: 404, description: "Patient, Visit, or Service not found" })
  create(@Body() createDto: CreateServiceOrderDto) {
    return this.serviceOrderService.create(createDto);
  }

  @Get()
  @RequirePermission({ resource: "service-orders", action: "READ" })
  @ApiOperation({ summary: "Get all service orders with filters and pagination" })
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
      user.role === "SUPER_ADMIN" ? undefined : user.organizationId,
    );
  }

  @Patch(":id")
  @RequirePermission({ resource: "service-orders", action: "UPDATE" })
  @ApiOperation({ summary: "Update service order (change status, add results, etc.)" })
  @ApiResponse({ status: 200, description: "Service order updated successfully" })
  @ApiResponse({ status: 404, description: "Service order not found" })
  @ApiResponse({ status: 400, description: "Cannot modify paid order" })
  update(@Param("id") id: string, @Body() updateDto: UpdateServiceOrderDto) {
    return this.serviceOrderService.update(id, updateDto);
  }

  @Delete(":id")
  @RequirePermission({ resource: "service-orders", action: "DELETE" })
  @ApiOperation({ summary: "Delete service order" })
  @ApiResponse({ status: 200, description: "Service order deleted successfully" })
  @ApiResponse({ status: 404, description: "Service order not found" })
  @ApiResponse({ status: 400, description: "Cannot delete paid order" })
  remove(@Param("id") id: string, @CurrentUser() user: CurrentUserData) {
    return this.serviceOrderService.remove(
      id,
      user.role === "SUPER_ADMIN" ? undefined : user.organizationId,
    );
  }
}
