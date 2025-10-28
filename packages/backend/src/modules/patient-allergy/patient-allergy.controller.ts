import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger";
import { PatientAllergyService } from "./patient-allergy.service";
import { CreatePatientAllergyDto } from "./dto/create-patient-allergy.dto";
import { UpdatePatientAllergyDto } from "./dto/update-patient-allergy.dto";
import { FindAllPatientAllergyDto } from "./dto/find-all-patient-allergy.dto";
import { PatientAllergyResponseDto } from "./dto/patient-allergy-response.dto";
import { PaginatedResponseDto } from "@/common/dto/pagination.dto";
import { PermissionGuard } from "@/common/guards/permission.guard";

@ApiTags("Patient Allergies")
@ApiBearerAuth()
@UseGuards(AuthGuard("jwt"), PermissionGuard)
@Controller("patient-allergies")
export class PatientAllergyController {
  constructor(private readonly service: PatientAllergyService) {}

  @Post()
  @ApiOperation({ summary: "Create patient allergy record" })
  @ApiResponse({ status: 201, type: PatientAllergyResponseDto })
  create(@Body() dto: CreatePatientAllergyDto): Promise<PatientAllergyResponseDto> {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: "Get all patient allergies" })
  @ApiResponse({ status: 200, type: PaginatedResponseDto })
  findAll(@Query() query: FindAllPatientAllergyDto): Promise<PaginatedResponseDto<PatientAllergyResponseDto>> {
    return this.service.findAll(query);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get patient allergy by ID" })
  @ApiResponse({ status: 200, type: PatientAllergyResponseDto })
  findOne(@Param("id") id: string, @Req() req: any): Promise<PatientAllergyResponseDto> {
    return this.service.findOne(id, req.user.organizationId);
  }

  @Put(":id")
  @ApiOperation({ summary: "Update patient allergy" })
  @ApiResponse({ status: 200, type: PatientAllergyResponseDto })
  update(@Param("id") id: string, @Body() dto: UpdatePatientAllergyDto, @Req() req: any): Promise<PatientAllergyResponseDto> {
    return this.service.update(id, dto, req.user.organizationId);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete patient allergy" })
  @ApiResponse({ status: 200 })
  remove(@Param("id") id: string, @Req() req: any): Promise<void> {
    return this.service.remove(id, req.user.organizationId);
  }
}
