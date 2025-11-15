import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { Prisma, AppointmentStatus } from "@prisma/client";
import { PrismaService } from "@/common/prisma/prisma.service";
import { CreateAppointmentDto } from "./dto/create-appointment.dto";
import { UpdateAppointmentDto } from "./dto/update-appointment.dto";
import { UpdateAppointmentStatusDto } from "./dto/update-appointment-status.dto";
import { FindAllAppointmentDto } from "./dto/find-all-appointment.dto";
import { PaginatedResponseDto } from "@/common/dto/pagination.dto";
import { AppointmentResponseDto } from "./dto/appointment-response.dto";
import { plainToInstance } from "class-transformer";

@Injectable()
export class AppointmentService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    createAppointmentDto: CreateAppointmentDto
  ): Promise<AppointmentResponseDto> {
    const { organizationId, ...appointmentData } = createAppointmentDto;

    // Validate patient exists
    const patient = await this.prisma.patient.findUnique({
      where: { id: appointmentData.patientId, organizationId },
    });

    if (!patient) {
      throw new NotFoundException(
        `Patient with ID ${appointmentData.patientId} not found`
      );
    }

    // Validate employee (doctor) exists
    const employee = await this.prisma.employee.findUnique({
      where: { id: appointmentData.employeeId, organizationId },
    });

    if (!employee) {
      throw new NotFoundException(
        `Employee (Doctor) with ID ${appointmentData.employeeId} not found`
      );
    }

    // Validate service if provided
    if (appointmentData.serviceId) {
      const service = await this.prisma.service.findUnique({
        where: { id: appointmentData.serviceId, organizationId },
      });

      if (!service) {
        throw new NotFoundException(
          `Service with ID ${appointmentData.serviceId} not found`
        );
      }
    }

    // Validate user who creates the appointment
    const user = await this.prisma.user.findUnique({
      where: { id: appointmentData.createdById },
    });

    if (!user) {
      throw new NotFoundException(
        `User with ID ${appointmentData.createdById} not found`
      );
    }

    // Check for scheduling conflicts
    const conflictingAppointment = await this.prisma.appointment.findFirst({
      where: {
        organizationId,
        employeeId: appointmentData.employeeId,
        status: {
          notIn: [AppointmentStatus.CANCELLED, AppointmentStatus.NO_SHOW],
        },
        AND: [
          {
            scheduledAt: {
              lt: new Date(
                appointmentData.scheduledAt.getTime() +
                  appointmentData.duration * 60000
              ),
            },
          },
          {
            scheduledAt: {
              gte: appointmentData.scheduledAt,
            },
          },
        ],
      },
    });

    if (conflictingAppointment) {
      throw new BadRequestException(
        "This time slot conflicts with an existing appointment"
      );
    }

    const appointment = await this.prisma.appointment.create({
      data: {
        ...appointmentData,
        organizationId,
      },
      include: {
        patient: true,
        employee: true,
        service: true,
        createdBy: true,
        organization: true,
      },
    });

    return plainToInstance(AppointmentResponseDto, appointment, {
      excludeExtraneousValues: true,
    });
  }

  async findAll(
    findAllDto: FindAllAppointmentDto
  ): Promise<PaginatedResponseDto<AppointmentResponseDto>> {
    const {
      page = 1,
      limit = 10,
      sortBy = "scheduledAt",
      sortOrder = "asc",
      organizationId,
      patientId,
      employeeId,
      serviceId,
      status,
      scheduledFrom,
      scheduledTo,
    } = findAllDto;

    const skip = (page - 1) * limit;

    const where: Prisma.AppointmentWhereInput = {
      organizationId,
      ...(patientId && { patientId }),
      ...(employeeId && { employeeId }),
      ...(serviceId && { serviceId }),
      ...(status && { status }),
      ...(scheduledFrom || scheduledTo
        ? {
            scheduledAt: {
              ...(scheduledFrom && { gte: scheduledFrom }),
              ...(scheduledTo && { lte: scheduledTo }),
            },
          }
        : {}),
    };

    const [appointments, total] = await Promise.all([
      this.prisma.appointment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          patient: true,
          employee: true,
          service: true,
          createdBy: true,
          confirmedBy: true,
          canceledBy: true,
          organization: true,
        },
      }),
      this.prisma.appointment.count({ where }),
    ]);

    const data = plainToInstance(AppointmentResponseDto, appointments, {
      excludeExtraneousValues: true,
    });

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(
    id: string,
    organizationId: string
  ): Promise<AppointmentResponseDto> {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id, organizationId },
      include: {
        patient: true,
        employee: true,
        service: true,
        createdBy: true,
        confirmedBy: true,
        canceledBy: true,
        organization: true,
        visits: true,
      },
    });

    if (!appointment) {
      throw new NotFoundException(`Appointment with ID ${id} not found`);
    }

    return plainToInstance(AppointmentResponseDto, appointment, {
      excludeExtraneousValues: true,
    });
  }

  async update(
    id: string,
    organizationId: string,
    updateAppointmentDto: UpdateAppointmentDto
  ): Promise<AppointmentResponseDto> {
    const existingAppointment = await this.prisma.appointment.findUnique({
      where: { id, organizationId },
    });

    if (!existingAppointment) {
      throw new NotFoundException(`Appointment with ID ${id} not found`);
    }

    // If updating scheduled time or duration, check for conflicts
    if (
      updateAppointmentDto.scheduledAt ||
      updateAppointmentDto.duration ||
      updateAppointmentDto.employeeId
    ) {
      const scheduledAt =
        updateAppointmentDto.scheduledAt || existingAppointment.scheduledAt;
      const duration =
        updateAppointmentDto.duration || existingAppointment.duration;
      const employeeId =
        updateAppointmentDto.employeeId || existingAppointment.employeeId;

      const conflictingAppointment = await this.prisma.appointment.findFirst({
        where: {
          id: { not: id },
          organizationId,
          employeeId,
          status: {
            notIn: [AppointmentStatus.CANCELLED, AppointmentStatus.NO_SHOW],
          },
          AND: [
            {
              scheduledAt: {
                lt: new Date(scheduledAt.getTime() + duration * 60000),
              },
            },
            {
              scheduledAt: {
                gte: scheduledAt,
              },
            },
          ],
        },
      });

      if (conflictingAppointment) {
        throw new BadRequestException(
          "This time slot conflicts with an existing appointment"
        );
      }
    }

    const appointment = await this.prisma.appointment.update({
      where: { id, organizationId },
      data: updateAppointmentDto,
      include: {
        patient: true,
        employee: true,
        service: true,
        createdBy: true,
        confirmedBy: true,
        canceledBy: true,
        organization: true,
      },
    });

    return plainToInstance(AppointmentResponseDto, appointment, {
      excludeExtraneousValues: true,
    });
  }

  async updateStatus(
    id: string,
    organizationId: string,
    updateStatusDto: UpdateAppointmentStatusDto
  ): Promise<AppointmentResponseDto> {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id, organizationId },
    });

    if (!appointment) {
      throw new NotFoundException(`Appointment with ID ${id} not found`);
    }

    const { status, userId, cancelReason } = updateStatusDto;

    // Validate status transitions
    if (
      appointment.status === AppointmentStatus.COMPLETED &&
      status !== AppointmentStatus.COMPLETED
    ) {
      throw new BadRequestException(
        "Cannot change status of a completed appointment"
      );
    }

    if (
      status === AppointmentStatus.CANCELLED &&
      !cancelReason &&
      !appointment.cancelReason
    ) {
      throw new BadRequestException(
        "Cancel reason is required when canceling an appointment"
      );
    }

    const updateData: Prisma.AppointmentUpdateInput = {
      status,
    };

    // Set timestamps based on status
    const now = new Date();
    switch (status) {
      case AppointmentStatus.CONFIRMED:
        updateData.confirmedAt = now;
        if (userId) {
          updateData.confirmedBy = { connect: { id: userId } };
        }
        break;
      case AppointmentStatus.CANCELLED:
        updateData.canceledAt = now;
        updateData.cancelReason = cancelReason;
        if (userId) {
          updateData.canceledBy = { connect: { id: userId } };
        }
        break;
      case AppointmentStatus.IN_QUEUE:
        updateData.checkInAt = now;
        break;
      case AppointmentStatus.IN_PROGRESS:
        if (!appointment.checkInAt) {
          updateData.checkInAt = now;
        }
        break;
      case AppointmentStatus.COMPLETED:
        updateData.checkOutAt = now;
        break;
    }

    const updatedAppointment = await this.prisma.appointment.update({
      where: { id, organizationId },
      data: updateData,
      include: {
        patient: true,
        employee: true,
        service: true,
        createdBy: true,
        confirmedBy: true,
        canceledBy: true,
        organization: true,
      },
    });

    return plainToInstance(AppointmentResponseDto, updatedAppointment, {
      excludeExtraneousValues: true,
    });
  }

  async remove(id: string, organizationId: string): Promise<void> {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id, organizationId },
      include: { visits: true },
    });

    if (!appointment) {
      throw new NotFoundException(`Appointment with ID ${id} not found`);
    }

    if (appointment.visits.length > 0) {
      throw new BadRequestException(
        "Cannot delete appointment with associated visits"
      );
    }

    await this.prisma.appointment.delete({
      where: { id, organizationId },
    });
  }

  async checkIn(
    id: string,
    organizationId: string
  ): Promise<AppointmentResponseDto> {
    return this.updateStatus(id, organizationId, {
      status: AppointmentStatus.IN_QUEUE,
    });
  }

  async confirm(
    id: string,
    organizationId: string,
    userId: string
  ): Promise<AppointmentResponseDto> {
    return this.updateStatus(id, organizationId, {
      status: AppointmentStatus.CONFIRMED,
      userId,
    });
  }

  async cancel(
    id: string,
    organizationId: string,
    userId: string,
    cancelReason: string
  ): Promise<AppointmentResponseDto> {
    return this.updateStatus(id, organizationId, {
      status: AppointmentStatus.CANCELLED,
      userId,
      cancelReason,
    });
  }

  async markNoShow(
    id: string,
    organizationId: string
  ): Promise<AppointmentResponseDto> {
    return this.updateStatus(id, organizationId, {
      status: AppointmentStatus.NO_SHOW,
    });
  }
}
