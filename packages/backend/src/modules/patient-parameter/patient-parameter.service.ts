import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma, ParameterSource } from "@prisma/client";
import { PrismaService } from "@/common/prisma/prisma.service";
import { CreatePatientParameterDto } from "./dto/create-patient-parameter.dto";
import { UpdatePatientParameterDto } from "./dto/update-patient-parameter.dto";
import { FindAllPatientParameterDto } from "./dto/find-all-patient-parameter.dto";
import { PaginatedResponseDto } from "@/common/dto/pagination.dto";
import { PatientParameterResponseDto } from "./dto/patient-parameter-response.dto";
import { plainToInstance } from "class-transformer";

@Injectable()
export class PatientParameterService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    dto: CreatePatientParameterDto
  ): Promise<PatientParameterResponseDto> {
    const { organizationId, patientId, recordedById, ...data } = dto;

    const patient = await this.prisma.patient.findUnique({
      where: { id: patientId, organizationId },
    });

    if (!patient) {
      throw new NotFoundException(`Patient with ID ${patientId} not found`);
    }

    const employee = await this.prisma.employee.findUnique({
      where: { id: recordedById, organizationId },
    });

    if (!employee) {
      throw new NotFoundException(`Employee with ID ${recordedById} not found`);
    }

    const created = await this.prisma.patientParameter.create({
      data: {
        ...data,
        patientId,
        recordedById,
        organizationId,
        source: dto.source ?? ParameterSource.MANUAL,
        measuredAt: dto.measuredAt ?? new Date(),
      },
    });

    return plainToInstance(PatientParameterResponseDto, created);
  }

  async findAll(
    query: FindAllPatientParameterDto
  ): Promise<PaginatedResponseDto<PatientParameterResponseDto>> {
    const {
      page,
      limit,
      sortBy,
      sortOrder,
      patientId,
      parameterCode,
      visitId,
      from,
      to,
    } = query;

    const skip = (page - 1) * limit;

    const where: Prisma.PatientParameterWhereInput = {};

    if (patientId) {
      where.patientId = patientId;
    }

    if (parameterCode) {
      where.parameterCode = parameterCode;
    }

    if (visitId) {
      where.visitId = visitId;
    }

    if (from || to) {
      where.measuredAt = {};
      if (from) {
        where.measuredAt.gte = new Date(from);
      }
      if (to) {
        where.measuredAt.lte = new Date(to);
      }
    }

    const orderBy: Prisma.PatientParameterOrderByWithRelationInput = sortBy
      ? { [sortBy]: sortOrder }
      : { measuredAt: "desc" };

    const [data, total] = await Promise.all([
      this.prisma.patientParameter.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.patientParameter.count({ where }),
    ]);

    return {
      data: plainToInstance(PatientParameterResponseDto, data),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<PatientParameterResponseDto> {
    const parameter = await this.prisma.patientParameter.findUnique({
      where: { id },
    });

    if (!parameter) {
      throw new NotFoundException(`Patient parameter with ID ${id} not found`);
    }

    return plainToInstance(PatientParameterResponseDto, parameter);
  }

  async update(
    id: string,
    dto: UpdatePatientParameterDto
  ): Promise<PatientParameterResponseDto> {
    const parameter = await this.prisma.patientParameter.findUnique({
      where: { id },
    });

    if (!parameter) {
      throw new NotFoundException(`Patient parameter with ID ${id} not found`);
    }

    const updated = await this.prisma.patientParameter.update({
      where: { id, organizationId: dto.organizationId },
      data: dto,
    });

    return plainToInstance(PatientParameterResponseDto, updated);
  }

  async remove(id: string): Promise<void> {
    const parameter = await this.prisma.patientParameter.findUnique({
      where: { id },
    });

    if (!parameter) {
      throw new NotFoundException(`Patient parameter with ID ${id} not found`);
    }

    await this.prisma.patientParameter.delete({
      where: { id },
    });
  }

  async getLatestByPatient(
    patientId: string
  ): Promise<PatientParameterResponseDto[]> {
    const parameters = await this.prisma.patientParameter.findMany({
      where: { patientId },
      orderBy: { measuredAt: "desc" },
      distinct: ["parameterCode"],
    });

    return plainToInstance(PatientParameterResponseDto, parameters);
  }
}
