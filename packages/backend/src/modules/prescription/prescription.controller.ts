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
import { PrescriptionService } from "./prescription.service";
import { CreatePrescriptionDto } from "./dto/create-prescription.dto";
import { UpdatePrescriptionDto } from "./dto/update-prescription.dto";
import { FindAllPrescriptionDto } from "./dto/find-all-prescription.dto";
import {
  RequirePermission,
  PermissionGuard,
} from "@/common/guards/permission.guard";

@ApiTags("Prescriptions")
@Controller("prescriptions")
@UseGuards(AuthGuard("jwt"), PermissionGuard)
@ApiBearerAuth()
export class PrescriptionController {
  constructor(private readonly prescriptionService: PrescriptionService) {}

  @Post()
  @RequirePermission({ resource: "prescriptions", action: "CREATE" })
  @ApiOperation({ summary: "Add prescription to visit" })
  @ApiResponse({
    status: 201,
    description: "Prescription created successfully",
  })
  @ApiResponse({ status: 404, description: "Visit or Employee not found" })
  @ApiResponse({ status: 400, description: "Cannot add to completed visit" })
  create(@Body() createPrescriptionDto: CreatePrescriptionDto) {
    return this.prescriptionService.create(createPrescriptionDto);
  }

  @Get()
  @RequirePermission({ resource: "prescriptions", action: "READ" })
  @ApiOperation({
    summary: "Get all prescriptions with filters and pagination",
  })
  @ApiResponse({ status: 200, description: "List of prescriptions" })
  findAll(@Query() query: FindAllPrescriptionDto) {
    return this.prescriptionService.findAll(query);
  }

  @Get("visit/:visitId")
  @RequirePermission({ resource: "prescriptions", action: "READ" })
  @ApiOperation({ summary: "Get all prescriptions for a specific visit" })
  @ApiResponse({
    status: 200,
    description: "List of prescriptions for the visit",
  })
  findByVisit(@Param("visitId") visitId: string) {
    return this.prescriptionService.findByVisit(visitId);
  }

  @Get(":id")
  @RequirePermission({ resource: "prescriptions", action: "READ" })
  @ApiOperation({ summary: "Get prescription by ID" })
  @ApiResponse({ status: 200, description: "Prescription details" })
  @ApiResponse({ status: 404, description: "Prescription not found" })
  findOne(@Param("id") id: string) {
    return this.prescriptionService.findOne(id);
  }

  @Patch(":id")
  @RequirePermission({ resource: "prescriptions", action: "UPDATE" })
  @ApiOperation({ summary: "Update prescription" })
  @ApiResponse({
    status: 200,
    description: "Prescription updated successfully",
  })
  @ApiResponse({ status: 404, description: "Prescription not found" })
  @ApiResponse({
    status: 400,
    description: "Cannot update prescription of completed visit",
  })
  update(
    @Param("id") id: string,
    @Body() updatePrescriptionDto: UpdatePrescriptionDto,
  ) {
    return this.prescriptionService.update(id, updatePrescriptionDto);
  }

  @Delete(":id")
  @RequirePermission({ resource: "prescriptions", action: "DELETE" })
  @ApiOperation({ summary: "Delete prescription" })
  @ApiResponse({
    status: 200,
    description: "Prescription deleted successfully",
  })
  @ApiResponse({ status: 404, description: "Prescription not found" })
  @ApiResponse({
    status: 400,
    description: "Cannot delete prescription of completed visit",
  })
  remove(@Param("id") id: string) {
    return this.prescriptionService.remove(id);
  }
}
