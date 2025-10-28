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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { PatientParameterService } from "./patient-parameter.service";
import { CreatePatientParameterDto } from "./dto/create-patient-parameter.dto";
import { UpdatePatientParameterDto } from "./dto/update-patient-parameter.dto";
import { FindAllPatientParameterDto } from "./dto/find-all-patient-parameter.dto";
import { PatientParameterResponseDto } from "./dto/patient-parameter-response.dto";
import { PaginatedResponseDto } from "@/common/dto/pagination.dto";
import { PermissionGuard } from "@/common/guards/permission.guard";

@ApiTags("Patient Parameters")
@ApiBearerAuth()
@UseGuards(AuthGuard("jwt"), PermissionGuard)
@Controller("patient-parameters")
export class PatientParameterController {
  constructor(private readonly service: PatientParameterService) {}

  @Post()
  @ApiOperation({ summary: "Create patient parameter" })
  @ApiResponse({ status: 201, type: PatientParameterResponseDto })
  create(
    @Body() dto: CreatePatientParameterDto
  ): Promise<PatientParameterResponseDto> {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: "Get all patient parameters" })
  @ApiResponse({ status: 200, type: PaginatedResponseDto })
  findAll(
    @Query() query: FindAllPatientParameterDto
  ): Promise<PaginatedResponseDto<PatientParameterResponseDto>> {
    return this.service.findAll(query);
  }

  @Get("patient/:patientId/latest")
  @ApiOperation({ summary: "Get latest parameters by patient" })
  @ApiResponse({ status: 200, type: [PatientParameterResponseDto] })
  getLatestByPatient(
    @Param("patientId") patientId: string
  ): Promise<PatientParameterResponseDto[]> {
    return this.service.getLatestByPatient(patientId);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get patient parameter by ID" })
  @ApiResponse({ status: 200, type: PatientParameterResponseDto })
  findOne(@Param("id") id: string): Promise<PatientParameterResponseDto> {
    return this.service.findOne(id);
  }

  @Put(":id")
  @ApiOperation({ summary: "Update patient parameter" })
  @ApiResponse({ status: 200, type: PatientParameterResponseDto })
  update(
    @Param("id") id: string,
    @Body() dto: UpdatePatientParameterDto
  ): Promise<PatientParameterResponseDto> {
    return this.service.update(id, dto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete patient parameter" })
  @ApiResponse({ status: 200 })
  remove(@Param("id") id: string): Promise<void> {
    return this.service.remove(id);
  }
}
