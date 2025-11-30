import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import {
  Prisma,
  VisitStatus,
  AppointmentStatus,
  VisitType,
} from "@prisma/client";
import { PrismaService } from "@/common/prisma/prisma.service";
import { CreateVisitDto } from "./dto/create-visit.dto";
import { UpdateVisitDto } from "./dto/update-visit.dto";
import { StartVisitDto } from "./dto/start-visit.dto";
import { CompleteVisitDto } from "./dto/complete-visit.dto";
import { CancelVisitDto } from "./dto/cancel-visit.dto";
import {
  FindAllVisitDto,
  VisitIncludeRelation,
} from "./dto/find-all-visit.dto";
import { PaginatedResponseDto } from "@/common/dto/pagination.dto";
import { VisitResponseDto } from "./dto/visit-response.dto";
import { DoctorQueueResponseDto } from "./dto/doctor-queue-response.dto";
import { plainToInstance } from "class-transformer";
import { differenceInMinutes, startOfDay, endOfDay } from "date-fns";

const VISIT_INCLUDE_RELATIONS = {
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
} as const;

/**
 * Builds include object based on requested relations
 */
function buildIncludeObject(
  relations?: VisitIncludeRelation[]
): Prisma.VisitInclude | undefined {
  if (!relations || relations.length === 0) {
    return undefined;
  }

  const include: Prisma.VisitInclude = {};

  for (const relation of relations) {
    switch (relation) {
      case VisitIncludeRelation.PATIENT:
        include.patient = VISIT_INCLUDE_RELATIONS.patient;
        break;
      case VisitIncludeRelation.EMPLOYEE:
        include.employee = VISIT_INCLUDE_RELATIONS.employee;
        break;
      case VisitIncludeRelation.APPOINTMENT:
        include.appointment = VISIT_INCLUDE_RELATIONS.appointment;
        break;
      case VisitIncludeRelation.PROTOCOL:
        include.protocol = VISIT_INCLUDE_RELATIONS.protocol;
        break;
      case VisitIncludeRelation.ORGANIZATION:
        include.organization = VISIT_INCLUDE_RELATIONS.organization;
        break;
      case VisitIncludeRelation.PRESCRIPTIONS:
        include.prescriptions = VISIT_INCLUDE_RELATIONS.prescriptions;
        break;
      case VisitIncludeRelation.SERVICE_ORDERS:
        include.serviceOrders = {
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
        };
        break;
    }
  }

  return include;
}

@Injectable()
export class VisitService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createVisitDto: CreateVisitDto): Promise<VisitResponseDto> {
    const {
      appointmentId,
      organizationId,
      serviceId,
      roomNumber,
      type,
      ...visitData
    } = createVisitDto;

    return await this.prisma.$transaction(async (tx) => {
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
        where: { id: visitData.employeeId, organizationId, status: "ACTIVE" },
      });

      if (!employee) {
        throw new NotFoundException(
          `Employee (Doctor) with ID ${visitData.employeeId} not found or inactive`
        );
      }

      // Validate service if provided
      if (serviceId) {
        const service = await tx.service.findUnique({
          where: { id: serviceId, organizationId, isActive: true },
        });

        if (!service) {
          throw new NotFoundException("Service not found or inactive");
        }
      }

      tx.patientDoctor.upsert({
        where: {
          patientId_employeeId: {
            patientId: visitData.patientId,
            employeeId: visitData.employeeId,
          },
        },
        create: {
          patientId: visitData.patientId,
          employeeId: visitData.employeeId,
          isActive: true,
        },
        update: {
          isActive: true,
        },
      });

      // Create visit with WAITING status - doctor will start it manually
      const created = await tx.visit.create({
        data: {
          ...visitData,
          appointmentId: appointmentId || null,
          organizationId,
          visitDate: visitData.visitDate || new Date(),
          status: VisitStatus.WAITING,
          type: type || VisitType.STANDARD,
          queuedAt: new Date(),
        },
      });

      // Update patient's lastVisitedAt
      await tx.patient.update({
        where: { id: visitData.patientId },
        data: { lastVisitedAt: created.visitDate },
      });

      // Fetch with relations
      const visit = await tx.visit.findUnique({
        where: { id: created.id },
      });

      return plainToInstance(VisitResponseDto, visit);
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
      include,
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

    const includeObject = buildIncludeObject(include);

    const [data, total] = await Promise.all([
      this.prisma.visit.findMany({
        where,
        include: includeObject,
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
        ...VISIT_INCLUDE_RELATIONS,
        prescriptions: {
          ...VISIT_INCLUDE_RELATIONS.prescriptions,
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
      ? differenceInMinutes(startedAt, visit.queuedAt)
      : null;

    const updatedVisit = await this.prisma.visit.update({
      where: { id },
      data: {
        status: VisitStatus.IN_PROGRESS,
        startedAt,
        waitingTimeMinutes,
      },
    });

    // Update appointment status
    if (visit.appointmentId) {
      await this.prisma.appointment.update({
        where: { id: visit.appointmentId },
        data: { status: AppointmentStatus.IN_PROGRESS },
      });
    }

    return plainToInstance(VisitResponseDto, updatedVisit);
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
      ? differenceInMinutes(completedAt, visit.startedAt)
      : null;

    const updatedVisit = await this.prisma.visit.update({
      where: { id },
      data: {
        status: VisitStatus.COMPLETED,
        completedAt,
        serviceTimeMinutes,
        notes: notes ?? visit.notes,
      },
    });

    // Update appointment status
    if (visit.appointmentId) {
      await this.prisma.appointment.update({
        where: { id: visit.appointmentId },
        data: { status: AppointmentStatus.COMPLETED },
      });
    }

    return plainToInstance(VisitResponseDto, updatedVisit);
  }

  async cancelVisit(
    id: string,
    dto: CancelVisitDto
  ): Promise<VisitResponseDto> {
    const { organizationId, cancelReason } = dto;

    const visit = await this.prisma.visit.findFirst({
      where: { id, organizationId },
      include: { appointment: true },
    });

    if (!visit) {
      throw new NotFoundException(`Visit with ID ${id} not found`);
    }

    if (visit.status === VisitStatus.COMPLETED) {
      throw new BadRequestException("Cannot cancel a completed visit");
    }

    if (visit.status === VisitStatus.CANCELED) {
      throw new BadRequestException("Visit is already canceled");
    }

    const updatedVisit = await this.prisma.visit.update({
      where: { id },
      data: {
        status: VisitStatus.CANCELED,
        notes: cancelReason
          ? `${visit.notes ? visit.notes + "\n\n" : ""}Причина отмены: ${cancelReason}`
          : visit.notes,
      },
    });

    // Update appointment status if exists
    if (visit.appointmentId) {
      await this.prisma.appointment.update({
        where: { id: visit.appointmentId },
        data: { status: AppointmentStatus.CANCELLED },
      });
    }

    return plainToInstance(VisitResponseDto, updatedVisit);
  }

  async getDoctorQueue(
    employeeId: string,
    organizationId: string,
    date?: string
  ): Promise<DoctorQueueResponseDto> {
    // Validate employee exists
    const employee = await this.prisma.employee.findFirst({
      where: { id: employeeId, organizationId, status: "ACTIVE" },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        middleName: true,
      },
    });

    if (!employee) {
      throw new NotFoundException(
        `Employee with ID ${employeeId} not found or inactive`
      );
    }

    // Parse date or use today
    const targetDate = date ? new Date(date) : new Date();
    const dayStart = startOfDay(targetDate);
    const dayEnd = endOfDay(targetDate);

    // Fetch all visits for the day
    const visits = await this.prisma.visit.findMany({
      where: {
        employeeId,
        organizationId,
        visitDate: {
          gte: dayStart,
          lte: dayEnd,
        },
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
        appointment: {
          select: {
            id: true,
          },
        },
      },
      orderBy: { queuedAt: "asc" },
    });

    const now = new Date();

    // Separate visits by status
    const waitingVisits = visits.filter(
      (v) => v.status === VisitStatus.WAITING
    );
    const inProgressVisit = visits.find(
      (v) => v.status === VisitStatus.IN_PROGRESS
    );
    const completedVisits = visits.filter(
      (v) => v.status === VisitStatus.COMPLETED
    );
    const canceledVisits = visits.filter(
      (v) => v.status === VisitStatus.CANCELED
    );

    // Calculate statistics
    const completedWithTimes = completedVisits.filter(
      (v) => v.waitingTimeMinutes !== null && v.serviceTimeMinutes !== null
    );

    const avgWaitingTime =
      completedWithTimes.length > 0
        ? Math.round(
            completedWithTimes.reduce(
              (sum, v) => sum + (v.waitingTimeMinutes ?? 0),
              0
            ) / completedWithTimes.length
          )
        : 0;

    const avgServiceTime =
      completedWithTimes.length > 0
        ? Math.round(
            completedWithTimes.reduce(
              (sum, v) => sum + (v.serviceTimeMinutes ?? 0),
              0
            ) / completedWithTimes.length
          )
        : 0;

    // Transform visits to DTOs
    const mapVisit = (v: (typeof visits)[0], index: number) => ({
      id: v.id,
      queueNumber: index + 1,
      queuedAt: v.queuedAt ?? v.createdAt,
      status: v.status,
      patient: {
        id: v.patient.id,
        firstName: v.patient.firstName,
        lastName: v.patient.lastName,
        middleName: v.patient.middleName ?? undefined,
      },
      waitingMinutes: v.queuedAt ? differenceInMinutes(now, v.queuedAt) : 0,
      notes: v.notes ?? undefined,
      appointmentType: v.type ?? undefined,
      appointmentId: v.appointmentId ?? undefined,
    });

    // Transform completed visits
    const mapCompletedVisit = (v: (typeof visits)[0]) => ({
      id: v.id,
      patient: {
        id: v.patient.id,
        firstName: v.patient.firstName,
        lastName: v.patient.lastName,
        middleName: v.patient.middleName ?? undefined,
      },
      completedAt: v.completedAt ?? v.updatedAt,
      waitingTimeMinutes: v.waitingTimeMinutes ?? 0,
      serviceTimeMinutes: v.serviceTimeMinutes ?? 0,
      notes: v.notes ?? undefined,
    });

    const result = {
      employeeId: employee.id,
      employeeName: [employee.lastName, employee.firstName, employee.middleName]
        .filter(Boolean)
        .join(" "),
      waiting: waitingVisits.map((v, i) => mapVisit(v, i)),
      inProgress: inProgressVisit ? mapVisit(inProgressVisit, 0) : undefined,
      completed: completedVisits.map(mapCompletedVisit),
      stats: {
        waiting: waitingVisits.length,
        inProgress: inProgressVisit ? 1 : 0,
        completed: completedVisits.length,
        canceled: canceledVisits.length,
        totalPatients: visits.length,
        avgWaitingTime,
        avgServiceTime,
      },
    };

    return plainToInstance(DoctorQueueResponseDto, result);
  }
}
