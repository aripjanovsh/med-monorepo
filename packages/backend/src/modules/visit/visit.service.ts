import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { Prisma, VisitStatus, AppointmentStatus } from "@prisma/client";
import { PrismaService } from "@/common/prisma/prisma.service";
import { CreateVisitDto } from "./dto/create-visit.dto";
import { UpdateVisitDto } from "./dto/update-visit.dto";
import { UpdateVisitStatusDto } from "./dto/update-visit-status.dto";
import { FindAllVisitDto } from "./dto/find-all-visit.dto";
import { PaginatedResponseDto } from "@/common/dto/pagination.dto";
import { VisitResponseDto } from "./dto/visit-response.dto";
import { plainToInstance } from "class-transformer";

@Injectable()
export class VisitService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createVisitDto: CreateVisitDto): Promise<VisitResponseDto> {
    const { appointmentId, organizationId, ...visitData } = createVisitDto;

    return await this.prisma.$transaction(async (tx) => {
      // Validate appointment exists if provided
      if (appointmentId) {
        const appointment = await tx.appointment.findUnique({
          where: { id: appointmentId, organizationId },
        });

        if (!appointment) {
          throw new NotFoundException(
            `Appointment with ID ${appointmentId} not found`,
          );
        }

        // Update appointment status to IN_PROGRESS
        await tx.appointment.update({
          where: { id: appointmentId },
          data: { status: AppointmentStatus.IN_PROGRESS },
        });
      }

      // Validate patient exists
      const patient = await tx.patient.findUnique({
        where: { id: visitData.patientId, organizationId },
      });

      if (!patient) {
        throw new NotFoundException(
          `Patient with ID ${visitData.patientId} not found`,
        );
      }

      // Validate employee (doctor) exists
      const employee = await tx.employee.findUnique({
        where: { id: visitData.employeeId, organizationId },
      });

      if (!employee) {
        throw new NotFoundException(
          `Employee (Doctor) with ID ${visitData.employeeId} not found`,
        );
      }

      // Validate protocol template if provided
      if (visitData.protocolId) {
        const protocol = await tx.protocolTemplate.findUnique({
          where: { id: visitData.protocolId, organizationId },
        });

        if (!protocol) {
          throw new NotFoundException(
            `Protocol template with ID ${visitData.protocolId} not found`,
          );
        }
      }

      // Create or update patient-doctor relationship
      const existingRelation = await tx.patientDoctor.findUnique({
        where: {
          patientId_employeeId: {
            patientId: visitData.patientId,
            employeeId: visitData.employeeId,
          },
        },
      });

      if (!existingRelation) {
        await tx.patientDoctor.create({
          data: {
            patientId: visitData.patientId,
            employeeId: visitData.employeeId,
            isActive: true,
          },
        });
      } else if (!existingRelation.isActive) {
        await tx.patientDoctor.update({
          where: {
            patientId_employeeId: {
              patientId: visitData.patientId,
              employeeId: visitData.employeeId,
            },
          },
          data: {
            isActive: true,
          },
        });
      }

      // Create visit
      const created = await tx.visit.create({
        data: {
          ...visitData,
          appointmentId: appointmentId || null,
          organizationId,
          visitDate: visitData.visitDate || new Date(),
          status: VisitStatus.IN_PROGRESS,
        },
      });

      // Update patient's lastVisitedAt
      await tx.patient.update({
        where: { id: visitData.patientId },
        data: { lastVisitedAt: created.visitDate },
      });

      // Fetch with relations
      const visitWithRelations = await tx.visit.findUnique({
        where: { id: created.id },
        include: {
          patient: {
            select: {
              id: true,
              patientId: true,
              firstName: true,
              middleName: true,
              lastName: true,
              dateOfBirth: true,
              gender: true,
            },
          },
          employee: {
            select: {
              id: true,
              employeeId: true,
              firstName: true,
              middleName: true,
              lastName: true,
            },
          },
          appointment: {
            select: {
              id: true,
              scheduledAt: true,
              status: true,
              type: true,
            },
          },
          protocol: {
            select: {
              id: true,
              name: true,
              description: true,
            },
          },
          organization: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          medicalRecords: {
            select: {
              id: true,
              type: true,
              content: true,
              createdAt: true,
            },
          },
          prescriptions: {
            select: {
              id: true,
              name: true,
              dosage: true,
              frequency: true,
              duration: true,
              createdAt: true,
            },
          },
        },
      });

      return plainToInstance(VisitResponseDto, visitWithRelations);
    });
  }

  async findAll(
    query: FindAllVisitDto,
  ): Promise<PaginatedResponseDto<VisitResponseDto>> {
    const {
      page,
      limit,
      sortBy,
      sortOrder,
      organizationId,
      status,
      patientId,
      employeeId,
      dateFrom,
      dateTo,
    } = query;

    const pageNumber = page ?? 1;
    const pageSize = limit ?? 10;
    const skip = (pageNumber - 1) * pageSize;

    const where: Prisma.VisitWhereInput = {
      organizationId,
    };

    if (status) {
      where.status = status;
    }

    if (patientId) {
      where.patientId = patientId;
    }

    if (employeeId) {
      where.employeeId = employeeId;
    }

    if (dateFrom || dateTo) {
      where.visitDate = {};
      if (dateFrom) {
        where.visitDate.gte = dateFrom;
      }
      if (dateTo) {
        where.visitDate.lte = dateTo;
      }
    }

    const orderBy: Prisma.VisitOrderByWithRelationInput = sortBy
      ? { [sortBy]: sortOrder }
      : { visitDate: "desc" };

    const [data, total] = await Promise.all([
      this.prisma.visit.findMany({
        where,
        include: {
          patient: {
            select: {
              id: true,
              patientId: true,
              firstName: true,
              middleName: true,
              lastName: true,
              dateOfBirth: true,
              gender: true,
            },
          },
          employee: {
            select: {
              id: true,
              employeeId: true,
              firstName: true,
              middleName: true,
              lastName: true,
            },
          },
          appointment: {
            select: {
              id: true,
              scheduledAt: true,
              status: true,
              type: true,
            },
          },
          protocol: {
            select: {
              id: true,
              name: true,
              description: true,
            },
          },
          organization: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          medicalRecords: {
            select: {
              id: true,
              type: true,
              content: true,
              createdAt: true,
            },
          },
          prescriptions: {
            select: {
              id: true,
              name: true,
              dosage: true,
              frequency: true,
              duration: true,
              createdAt: true,
            },
          },
        },
        orderBy,
        skip,
        take: pageSize,
      }),
      this.prisma.visit.count({ where }),
    ]);

    return {
      data: plainToInstance(VisitResponseDto, data),
      meta: {
        page: pageNumber,
        limit: pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  async findOne(
    id: string,
    organizationId?: string,
  ): Promise<VisitResponseDto> {
    const where: Prisma.VisitWhereUniqueInput = { id };

    const visit = await this.prisma.visit.findUnique({
      where,
      include: {
        patient: {
          select: {
            id: true,
            patientId: true,
            firstName: true,
            middleName: true,
            lastName: true,
            dateOfBirth: true,
            gender: true,
          },
        },
        employee: {
          select: {
            id: true,
            employeeId: true,
            firstName: true,
            middleName: true,
            lastName: true,
          },
        },
        appointment: {
          select: {
            id: true,
            scheduledAt: true,
            status: true,
            type: true,
          },
        },
        protocol: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        medicalRecords: {
          select: {
            id: true,
            type: true,
            content: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        prescriptions: {
          select: {
            id: true,
            name: true,
            dosage: true,
            frequency: true,
            duration: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!visit) {
      throw new NotFoundException(`Visit with ID ${id} not found`);
    }

    // Validate organization if provided
    if (organizationId && visit.organizationId !== organizationId) {
      throw new NotFoundException(`Visit with ID ${id} not found`);
    }

    return plainToInstance(VisitResponseDto, visit);
  }

  async update(
    id: string,
    updateVisitDto: UpdateVisitDto,
  ): Promise<VisitResponseDto> {
    const { organizationId, ...updateData } = updateVisitDto;

    // Check if visit exists
    const existing = await this.prisma.visit.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Visit with ID ${id} not found`);
    }

    // Validate organization
    if (organizationId && existing.organizationId !== organizationId) {
      throw new NotFoundException(`Visit with ID ${id} not found`);
    }

    // Check if visit is completed
    if (existing.status === VisitStatus.COMPLETED) {
      throw new BadRequestException("Cannot update a completed visit");
    }

    return await this.prisma.$transaction(async (tx) => {
      const where: Prisma.VisitWhereUniqueInput = { id };

      if (organizationId) {
        where.organizationId = organizationId;
      }

      await tx.visit.update({
        where,
        data: updateData,
      });

      const updated = await tx.visit.findUnique({
        where: { id },
        include: {
          patient: {
            select: {
              id: true,
              patientId: true,
              firstName: true,
              middleName: true,
              lastName: true,
              dateOfBirth: true,
              gender: true,
            },
          },
          employee: {
            select: {
              id: true,
              employeeId: true,
              firstName: true,
              middleName: true,
              lastName: true,
            },
          },
          appointment: {
            select: {
              id: true,
              scheduledAt: true,
              status: true,
              type: true,
            },
          },
          protocol: {
            select: {
              id: true,
              name: true,
              description: true,
            },
          },
          organization: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          medicalRecords: {
            select: {
              id: true,
              type: true,
              content: true,
              createdAt: true,
            },
          },
          prescriptions: {
            select: {
              id: true,
              name: true,
              dosage: true,
              frequency: true,
              duration: true,
              createdAt: true,
            },
          },
        },
      });

      return plainToInstance(VisitResponseDto, updated);
    });
  }

  async updateStatus(
    id: string,
    updateStatusDto: UpdateVisitStatusDto,
  ): Promise<VisitResponseDto> {
    const { status, organizationId } = updateStatusDto;

    // Check if visit exists
    const existing = await this.prisma.visit.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Visit with ID ${id} not found`);
    }

    // Validate organization
    if (existing.organizationId !== organizationId) {
      throw new NotFoundException(`Visit with ID ${id} not found`);
    }

    return await this.prisma.$transaction(async (tx) => {
      // Update visit status
      await tx.visit.update({
        where: { id, organizationId },
        data: { status },
      });

      // If visit is completed and has appointment, update appointment status
      if (status === VisitStatus.COMPLETED && existing.appointmentId) {
        await tx.appointment.update({
          where: { id: existing.appointmentId },
          data: { status: AppointmentStatus.COMPLETED },
        });
      }

      // Fetch updated visit with relations
      const updated = await tx.visit.findUnique({
        where: { id },
        include: {
          patient: {
            select: {
              id: true,
              patientId: true,
              firstName: true,
              middleName: true,
              lastName: true,
              dateOfBirth: true,
              gender: true,
            },
          },
          employee: {
            select: {
              id: true,
              employeeId: true,
              firstName: true,
              middleName: true,
              lastName: true,
            },
          },
          appointment: {
            select: {
              id: true,
              scheduledAt: true,
              status: true,
              type: true,
            },
          },
          protocol: {
            select: {
              id: true,
              name: true,
              description: true,
            },
          },
          organization: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          medicalRecords: {
            select: {
              id: true,
              type: true,
              content: true,
              createdAt: true,
            },
          },
          prescriptions: {
            select: {
              id: true,
              name: true,
              dosage: true,
              frequency: true,
              duration: true,
              createdAt: true,
            },
          },
        },
      });

      return plainToInstance(VisitResponseDto, updated);
    });
  }

  async remove(
    id: string,
    organizationId?: string,
  ): Promise<{ message: string }> {
    try {
      const where: Prisma.VisitWhereUniqueInput = { id };

      // Check if visit exists
      const existing = await this.prisma.visit.findUnique({
        where: { id },
      });

      if (!existing) {
        throw new NotFoundException(`Visit with ID ${id} not found`);
      }

      // Validate organization
      if (organizationId && existing.organizationId !== organizationId) {
        throw new NotFoundException(`Visit with ID ${id} not found`);
      }

      await this.prisma.visit.delete({ where });

      return { message: "Visit deleted successfully" };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          throw new NotFoundException(`Visit with ID ${id} not found`);
        }
        throw new BadRequestException(`Cannot delete visit: ${error.message}`);
      }
      throw error;
    }
  }
}
