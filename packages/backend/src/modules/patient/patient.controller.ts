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
import { PatientService } from "./patient.service";
import { CreatePatientDto } from "./dto/create-patient.dto";
import { UpdatePatientDto } from "./dto/update-patient.dto";
import { FindAllPatientDto } from "./dto/find-all-patient.dto";
import { PatientByIdDto } from "./dto/patient-by-id.dto";
import { UpdatePatientStatusDto } from "./dto/update-patient-status.dto";
import {
  RequirePermission,
  PermissionGuard,
} from "../../common/guards/permission.guard";
import {
  CurrentUser,
  CurrentUserData,
} from "../../common/decorators/current-user.decorator";

@ApiTags("Patients")
@Controller("patients")
@UseGuards(AuthGuard("jwt"), PermissionGuard)
@ApiBearerAuth()
export class PatientController {
  constructor(private readonly patientService: PatientService) {}

  @Post()
  @RequirePermission({ resource: "patients", action: "CREATE" })
  @ApiOperation({ summary: "Create new patient" })
  @ApiResponse({ status: 201, description: "Patient created successfully" })
  create(@Body() createPatientDto: CreatePatientDto) {
    return this.patientService.create(createPatientDto);
  }

  @Get()
  @RequirePermission({ resource: "patients", action: "READ" })
  @ApiOperation({ summary: "Get all patients with pagination" })
  @ApiResponse({ status: 200, description: "Patients retrieved successfully" })
  findAll(@Query() query: FindAllPatientDto) {
    return this.patientService.findAll(query);
  }

  @Get("stats")
  @ApiOperation({ summary: "Get patient statistics" })
  @ApiResponse({
    status: 200,
    description: "Patient statistics retrieved successfully",
  })
  getStats(@Query() query: FindAllPatientDto) {
    return this.patientService.getPatientStats(query.organizationId);
  }

  @Get(":id")
  @RequirePermission({ resource: "patients", action: "READ" })
  @ApiOperation({ summary: "Get patient by ID" })
  @ApiResponse({ status: 200, description: "Patient found" })
  @ApiResponse({ status: 404, description: "Patient not found" })
  findOne(@Param("id") id: string, @Query() query: PatientByIdDto) {
    return this.patientService.findById(id, query.organizationId);
  }

  @Patch(":id")
  @RequirePermission({ resource: "patients", action: "UPDATE" })
  @ApiOperation({ summary: "Update patient" })
  @ApiResponse({ status: 200, description: "Patient updated successfully" })
  @ApiResponse({ status: 404, description: "Patient not found" })
  @ApiResponse({ status: 409, description: "Patient ID already exists" })
  update(@Param("id") id: string, @Body() updatePatientDto: UpdatePatientDto) {
    // Populate exclusion field for uniqueness validators on update
    updatePatientDto.excludePatientId = id;
    return this.patientService.update(id, updatePatientDto);
  }

  @Patch(":id/status")
  @RequirePermission({ resource: "patients", action: "UPDATE" })
  @ApiOperation({ summary: "Update patient status" })
  @ApiResponse({
    status: 200,
    description: "Patient status updated successfully",
  })
  @ApiResponse({ status: 404, description: "Patient not found" })
  updateStatus(
    @Param("id") id: string,
    @Body() updateStatusDto: UpdatePatientStatusDto,
  ) {
    return this.patientService.updateStatus(
      id,
      updateStatusDto.status as any,
      updateStatusDto.organizationId,
    );
  }

  @Delete(":id")
  @RequirePermission({ resource: "patients", action: "DELETE" })
  @ApiOperation({ summary: "Delete patient" })
  @ApiResponse({ status: 200, description: "Patient deleted successfully" })
  @ApiResponse({ status: 404, description: "Patient not found" })
  remove(@Param("id") id: string, @Query() query: PatientByIdDto) {
    return this.patientService.remove(id, query.organizationId);
  }
}
