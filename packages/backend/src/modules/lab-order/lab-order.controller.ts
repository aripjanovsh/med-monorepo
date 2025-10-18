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
import { LabOrderService } from "./lab-order.service";
import { CreateLabOrderDto } from "./dto/create-lab-order.dto";
import { UpdateLabOrderDto } from "./dto/update-lab-order.dto";
import { UpdateLabOrderStatusDto } from "./dto/update-lab-order-status.dto";
import { FindAllLabOrderDto } from "./dto/find-all-lab-order.dto";
import {
  RequirePermission,
  PermissionGuard,
} from "@/common/guards/permission.guard";

@ApiTags("Lab Orders")
@Controller("lab-orders")
@UseGuards(AuthGuard("jwt"), PermissionGuard)
@ApiBearerAuth()
export class LabOrderController {
  constructor(private readonly labOrderService: LabOrderService) {}

  @Post()
  @RequirePermission({ resource: "lab-orders", action: "CREATE" })
  @ApiOperation({ summary: "Add lab order to visit" })
  @ApiResponse({ status: 201, description: "Lab order created successfully" })
  @ApiResponse({ status: 404, description: "Visit or Employee not found" })
  @ApiResponse({ status: 400, description: "Cannot add to completed visit" })
  create(@Body() createLabOrderDto: CreateLabOrderDto) {
    return this.labOrderService.create(createLabOrderDto);
  }

  @Get()
  @RequirePermission({ resource: "lab-orders", action: "READ" })
  @ApiOperation({ summary: "Get all lab orders with filters and pagination" })
  @ApiResponse({ status: 200, description: "List of lab orders" })
  findAll(@Query() query: FindAllLabOrderDto) {
    return this.labOrderService.findAll(query);
  }

  @Get("visit/:visitId")
  @RequirePermission({ resource: "lab-orders", action: "READ" })
  @ApiOperation({ summary: "Get all lab orders for a specific visit" })
  @ApiResponse({ status: 200, description: "List of lab orders for the visit" })
  findByVisit(@Param("visitId") visitId: string) {
    return this.labOrderService.findByVisit(visitId);
  }

  @Get(":id")
  @RequirePermission({ resource: "lab-orders", action: "READ" })
  @ApiOperation({ summary: "Get lab order by ID" })
  @ApiResponse({ status: 200, description: "Lab order details" })
  @ApiResponse({ status: 404, description: "Lab order not found" })
  findOne(@Param("id") id: string) {
    return this.labOrderService.findOne(id);
  }

  @Patch(":id")
  @RequirePermission({ resource: "lab-orders", action: "UPDATE" })
  @ApiOperation({ summary: "Update lab order" })
  @ApiResponse({ status: 200, description: "Lab order updated successfully" })
  @ApiResponse({ status: 404, description: "Lab order not found" })
  @ApiResponse({
    status: 400,
    description: "Cannot update lab order of completed visit",
  })
  update(
    @Param("id") id: string,
    @Body() updateLabOrderDto: UpdateLabOrderDto,
  ) {
    return this.labOrderService.update(id, updateLabOrderDto);
  }

  @Patch(":id/status")
  @RequirePermission({ resource: "lab-orders", action: "UPDATE" })
  @ApiOperation({ summary: "Update lab order status" })
  @ApiResponse({
    status: 200,
    description: "Lab order status updated successfully",
  })
  @ApiResponse({ status: 404, description: "Lab order not found" })
  updateStatus(
    @Param("id") id: string,
    @Body() updateStatusDto: UpdateLabOrderStatusDto,
  ) {
    return this.labOrderService.updateStatus(id, updateStatusDto);
  }

  @Delete(":id")
  @RequirePermission({ resource: "lab-orders", action: "DELETE" })
  @ApiOperation({ summary: "Delete lab order" })
  @ApiResponse({ status: 200, description: "Lab order deleted successfully" })
  @ApiResponse({ status: 404, description: "Lab order not found" })
  @ApiResponse({
    status: 400,
    description: "Cannot delete lab order of completed visit",
  })
  remove(@Param("id") id: string) {
    return this.labOrderService.remove(id);
  }
}
