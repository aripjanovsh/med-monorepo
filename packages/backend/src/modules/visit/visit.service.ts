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
import { StartVisitDto } from "./dto/start-visit.dto";
import { CompleteVisitDto } from "./dto/complete-visit.dto";
import { FindAllVisitDto } from "./dto/find-all-visit.dto";
import { PaginatedResponseDto } from "@/common/dto/pagination.dto";
import { VisitResponseDto } from "./dto/visit-response.dto";
import {
  DoctorQueueResponseDto,
  DoctorQueueVisitDto,
} from "./dto/doctor-queue-response.dto";
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
            `Appointment with ID ${appointmentId} not found`
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
          `Patient with ID ${visitData.patientId} not found`
        );
      }

      // Validate employee (doctor) exists
      const employee = await tx.employee.findUnique({
        where: { id: visitData.employeeId, organizationId },
      });

      if (!employee) {
        throw new NotFoundException(
          `Employee (Doctor) with ID ${visitData.employeeId} not found`
        );
      }

      // Validate protocol template if provided
      if (visitData.protocolId) {
        const protocol = await tx.protocolTemplate.findUnique({
          where: { id: visitData.protocolId, organizationId },
        });

        if (!protocol) {
          throw new NotFoundException(
            `Protocol template with ID ${visitData.protocolId} not found`
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
    query: FindAllVisitDto
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
          serviceOrders: {
            select: {
              id: true,
              status: true,
              paymentStatus: true,
              service: {
                select: {
                  id: true,
                  name: true,
                  price: true,
                },
              },
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
    organizationId?: string
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
    updateVisitDto: UpdateVisitDto
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
    updateStatusDto: UpdateVisitStatusDto
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
    organizationId?: string
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

  async startVisit(id: string, dto: StartVisitDto): Promise<VisitResponseDto> {
    const { organizationId } = dto;

    const visit = await this.prisma.visit.findFirst({
      where: { id, organizationId },
      include: { appointment: true },
    });

    if (!visit) {
      throw new NotFoundException(`Visit with ID ${id} not found`);
    }

    if (visit.status !== VisitStatus.WAITING) {
      throw new BadRequestException(
        `Cannot start visit with status ${visit.status}`
      );
    }

    const startedAt = new Date();
    const waitingTimeMinutes = visit.queuedAt
      ? Math.floor((startedAt.getTime() - visit.queuedAt.getTime()) / 60000)
      : null;

    const updatedVisit = await this.prisma.visit.update({
      where: { id },
      data: {
        status: VisitStatus.IN_PROGRESS,
        startedAt,
        waitingTimeMinutes,
      },
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

    // Update appointment status
    if (visit.appointmentId) {
      await this.prisma.appointment.update({
        where: { id: visit.appointmentId },
        data: { status: AppointmentStatus.IN_PROGRESS },
      });
    }

    return plainToInstance(VisitResponseDto, updatedVisit, {
      excludeExtraneousValues: true,
    });
  }

  async completeVisit(
    id: string,
    dto: CompleteVisitDto
  ): Promise<VisitResponseDto> {
    const { organizationId, notes } = dto;

    const visit = await this.prisma.visit.findFirst({
      where: { id, organizationId },
      include: { appointment: true },
    });

    if (!visit) {
      throw new NotFoundException(`Visit with ID ${id} not found`);
    }

    if (visit.status !== VisitStatus.IN_PROGRESS) {
      throw new BadRequestException(
        `Cannot complete visit with status ${visit.status}`
      );
    }

    const completedAt = new Date();
    const serviceTimeMinutes = visit.startedAt
      ? Math.floor((completedAt.getTime() - visit.startedAt.getTime()) / 60000)
      : null;

    const updatedVisit = await this.prisma.visit.update({
      where: { id },
      data: {
        status: VisitStatus.COMPLETED,
        completedAt,
        serviceTimeMinutes,
        notes: notes ?? visit.notes,
      },
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

    // Update appointment status
    if (visit.appointmentId) {
      await this.prisma.appointment.update({
        where: { id: visit.appointmentId },
        data: { status: AppointmentStatus.COMPLETED },
      });
    }

    return plainToInstance(VisitResponseDto, updatedVisit, {
      excludeExtraneousValues: true,
    });
  }

  async getDoctorQueue(
    employeeId: string,
    organizationId: string,
    date?: string
  ): Promise<DoctorQueueResponseDto> {
    // Parse date
    let startOfDay: Date;
    let endOfDay: Date;

    if (date) {
      const [year, month, day] = date.split("-").map(Number);
      startOfDay = new Date(year, month - 1, day, 0, 0, 0, 0);
      endOfDay = new Date(year, month - 1, day, 23, 59, 59, 999);
    } else {
      const now = new Date();
      startOfDay = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        0,
        0,
        0,
        0
      );
      endOfDay = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        23,
        59,
        59,
        999
      );
    }

    console.log("employeeId", employeeId);
    console.log("organizationId", organizationId);
    console.log("date", date);

    // Get doctor
    const doctor = await this.prisma.employee.findFirst({
      where: { id: employeeId, organizationId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        middleName: true,
      },
    });

    if (!doctor) {
      throw new NotFoundException("Doctor not found");
    }

    const employeeName = [doctor.lastName, doctor.firstName, doctor.middleName]
      .filter(Boolean)
      .join(" ");

    // Get visits
    const visits = await this.prisma.visit.findMany({
      where: {
        employeeId,
        organizationId,
        visitDate: { gte: startOfDay, lte: endOfDay },
      },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            middleName: true,
          },
        },
      },
      orderBy: {
        queueNumber: "asc",
      },
    });

    const waiting = visits
      .filter((v) => v.status === VisitStatus.WAITING)
      .map((v) => {
        const waitingMinutes = v.queuedAt
          ? Math.floor((Date.now() - v.queuedAt.getTime()) / 60000)
          : 0;
        return plainToInstance(
          DoctorQueueVisitDto,
          {
            ...v,
            waitingMinutes,
          },
          { excludeExtraneousValues: true }
        );
      });

    const inProgress = visits.find((v) => v.status === VisitStatus.IN_PROGRESS);
    const completed = visits.filter((v) => v.status === VisitStatus.COMPLETED);

    // Calculate stats
    const avgWaitingTime =
      completed.length > 0
        ? completed.reduce((sum, v) => sum + (v.waitingTimeMinutes ?? 0), 0) /
          completed.length
        : 0;
    const avgServiceTime =
      completed.length > 0
        ? completed.reduce((sum, v) => sum + (v.serviceTimeMinutes ?? 0), 0) /
          completed.length
        : 0;

    return plainToInstance(
      DoctorQueueResponseDto,
      {
        employeeId,
        employeeName,
        waiting,
        inProgress: inProgress
          ? plainToInstance(
              DoctorQueueVisitDto,
              {
                ...inProgress,
                waitingMinutes: inProgress.waitingTimeMinutes ?? 0,
              },
              { excludeExtraneousValues: true }
            )
          : undefined,
        stats: {
          waiting: waiting.length,
          completed: completed.length,
          avgWaitingTime: Math.round(avgWaitingTime),
          avgServiceTime: Math.round(avgServiceTime),
        },
      },
      { excludeExtraneousValues: true }
    );
  }
}
