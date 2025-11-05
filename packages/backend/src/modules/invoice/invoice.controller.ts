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
import { InvoiceService } from "./invoice.service";
import { CreateInvoiceDto } from "./dto/create-invoice.dto";
import { CreateInvoiceFromVisitDto } from "./dto/create-invoice-from-visit.dto";
import { UpdateInvoiceDto } from "./dto/update-invoice.dto";
import { CreatePaymentDto } from "./dto/create-payment.dto";
import { FindAllInvoiceDto } from "./dto/find-all-invoice.dto";
import { AddInvoiceItemDto } from "./dto/add-invoice-item.dto";
import {
  RequirePermission,
  PermissionGuard,
} from "@/common/guards/permission.guard";
import {
  CurrentUser,
  CurrentUserData,
} from "@/common/decorators/current-user.decorator";

@ApiTags("Invoices")
@Controller("invoices")
@UseGuards(AuthGuard("jwt"), PermissionGuard)
@ApiBearerAuth()
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Post()
  @RequirePermission({ resource: "invoices", action: "CREATE" })
  @ApiOperation({ summary: "Create new invoice" })
  @ApiResponse({ status: 201, description: "Invoice created successfully" })
  @ApiResponse({ status: 404, description: "Patient or Visit not found" })
  @ApiResponse({ status: 400, description: "Validation error" })
  async create(
    @Body() createInvoiceDto: CreateInvoiceDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.invoiceService.create(createInvoiceDto, user.employeeId);
  }

  @Post("from-visit")
  @RequirePermission({ resource: "invoices", action: "CREATE" })
  @ApiOperation({ summary: "Create invoice from visit's unpaid service orders" })
  @ApiResponse({ status: 201, description: "Invoice created successfully" })
  @ApiResponse({ status: 404, description: "Visit not found" })
  @ApiResponse({ status: 400, description: "No unpaid services found" })
  async createFromVisit(
    @Body() dto: CreateInvoiceFromVisitDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.invoiceService.createFromVisit(dto, user.employeeId);
  }

  @Get()
  @RequirePermission({ resource: "invoices", action: "READ" })
  @ApiOperation({ summary: "Get all invoices with filters and pagination" })
  @ApiResponse({ status: 200, description: "List of invoices" })
  findAll(@Query() query: FindAllInvoiceDto) {
    return this.invoiceService.findAll(query);
  }

  @Get(":id")
  @RequirePermission({ resource: "invoices", action: "READ" })
  @ApiOperation({ summary: "Get invoice by ID" })
  @ApiResponse({ status: 200, description: "Invoice details" })
  @ApiResponse({ status: 404, description: "Invoice not found" })
  findOne(@Param("id") id: string, @CurrentUser() user: CurrentUserData) {
    return this.invoiceService.findOne(
      id,
      user.role === "SUPER_ADMIN" ? undefined : user.organizationId,
    );
  }

  @Patch(":id")
  @RequirePermission({ resource: "invoices", action: "UPDATE" })
  @ApiOperation({ summary: "Update invoice information" })
  @ApiResponse({ status: 200, description: "Invoice updated successfully" })
  @ApiResponse({ status: 404, description: "Invoice not found" })
  @ApiResponse({ status: 400, description: "Cannot update paid invoice" })
  update(
    @Param("id") id: string,
    @Body() updateInvoiceDto: UpdateInvoiceDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.invoiceService.update(
      id,
      updateInvoiceDto,
      user.organizationId,
    );
  }

  @Delete(":id")
  @RequirePermission({ resource: "invoices", action: "DELETE" })
  @ApiOperation({ summary: "Delete invoice" })
  @ApiResponse({ status: 200, description: "Invoice deleted successfully" })
  @ApiResponse({ status: 404, description: "Invoice not found" })
  @ApiResponse({
    status: 400,
    description: "Cannot delete invoice with payments",
  })
  remove(@Param("id") id: string, @CurrentUser() user: CurrentUserData) {
    return this.invoiceService.remove(id, user.organizationId);
  }

  @Post(":id/items")
  @RequirePermission({ resource: "invoices", action: "UPDATE" })
  @ApiOperation({ summary: "Add item to invoice" })
  @ApiResponse({ status: 201, description: "Item added successfully" })
  @ApiResponse({ status: 404, description: "Invoice or Service not found" })
  @ApiResponse({ status: 400, description: "Cannot add items to paid invoice" })
  addItem(
    @Param("id") id: string,
    @Body() addItemDto: AddInvoiceItemDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.invoiceService.addItem(id, addItemDto, user.organizationId);
  }

  @Delete(":id/items/:itemId")
  @RequirePermission({ resource: "invoices", action: "UPDATE" })
  @ApiOperation({ summary: "Remove item from invoice" })
  @ApiResponse({ status: 200, description: "Item removed successfully" })
  @ApiResponse({ status: 404, description: "Invoice or Item not found" })
  @ApiResponse({
    status: 400,
    description: "Cannot remove items from paid invoice",
  })
  removeItem(
    @Param("id") id: string,
    @Param("itemId") itemId: string,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.invoiceService.removeItem(id, itemId, user.organizationId);
  }

  @Post(":id/payments")
  @RequirePermission({ resource: "invoices", action: "UPDATE" })
  @ApiOperation({
    summary: "Add payment to invoice (supports split payments)",
  })
  @ApiResponse({ status: 201, description: "Payment added successfully" })
  @ApiResponse({ status: 404, description: "Invoice not found" })
  @ApiResponse({
    status: 400,
    description: "Payment amount exceeds remaining balance",
  })
  async addPayment(
    @Param("id") id: string,
    @Body() createPaymentDto: CreatePaymentDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.invoiceService.addPayment(id, createPaymentDto, user.employeeId);
  }

  @Get(":id/payments")
  @RequirePermission({ resource: "invoices", action: "READ" })
  @ApiOperation({ summary: "Get all payments for an invoice" })
  @ApiResponse({ status: 200, description: "List of payments" })
  @ApiResponse({ status: 404, description: "Invoice not found" })
  getPayments(@Param("id") id: string, @CurrentUser() user: CurrentUserData) {
    return this.invoiceService.getPayments(id, user.organizationId);
  }
}
