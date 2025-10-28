import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "@/common/prisma/prisma.service";
import { CreatePatientAllergyDto } from "./dto/create-patient-allergy.dto";
import { UpdatePatientAllergyDto } from "./dto/update-patient-allergy.dto";
import { FindAllPatientAllergyDto } from "./dto/find-all-patient-allergy.dto";
import { PaginatedResponseDto } from "@/common/dto/pagination.dto";
import { PatientAllergyResponseDto } from "./dto/patient-allergy-response.dto";
import { plainToInstance } from "class-transformer";

@Injectable()
export class PatientAllergyService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreatePatientAllergyDto): Promise<PatientAllergyResponseDto> {
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

    const created = await this.prisma.patientAllergy.create({
      data: {
        ...data,
        patientId,
        recordedById,
        organizationId,
      },
    });

    return plainToInstance(PatientAllergyResponseDto, created);
  }

  async findAll(query: FindAllPatientAllergyDto): Promise<PaginatedResponseDto<PatientAllergyResponseDto>> {
    const { page = 1, limit = 10, sortBy, sortOrder, patientId, visitId } = query;

    const skip = (page - 1) * limit;

    const where: Prisma.PatientAllergyWhereInput = {};

    if (patientId) {
      where.patientId = patientId;
    }

    if (visitId) {
      where.visitId = visitId;
    }

    const orderBy: Prisma.PatientAllergyOrderByWithRelationInput = sortBy
      ? { [sortBy]: sortOrder }
      : { createdAt: "desc" };

    const [data, total] = await Promise.all([
      this.prisma.patientAllergy.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.patientAllergy.count({ where }),
    ]);

    return {
      data: plainToInstance(PatientAllergyResponseDto, data),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, organizationId: string): Promise<PatientAllergyResponseDto> {
    const allergy = await this.prisma.patientAllergy.findUnique({
      where: { id },
    });

    if (!allergy) {
      throw new NotFoundException(`Patient allergy with ID ${id} not found`);
    }

    return plainToInstance(PatientAllergyResponseDto, allergy);
  }

  async update(id: string, dto: UpdatePatientAllergyDto, organizationId: string): Promise<PatientAllergyResponseDto> {
    const allergy = await this.prisma.patientAllergy.findUnique({
      where: { id },
    });

    if (!allergy) {
      throw new NotFoundException(`Patient allergy with ID ${id} not found`);
    }

    const updated = await this.prisma.patientAllergy.update({
      where: { id, organizationId },
      data: dto,
    });

    return plainToInstance(PatientAllergyResponseDto, updated);
  }

  async remove(id: string, organizationId: string): Promise<void> {
    const allergy = await this.prisma.patientAllergy.findUnique({
      where: { id, organizationId },
    });

    if (!allergy) {
      throw new NotFoundException(`Patient allergy with ID ${id} not found`);
    }

    await this.prisma.patientAllergy.delete({
      where: { id },
    });
  }
}
