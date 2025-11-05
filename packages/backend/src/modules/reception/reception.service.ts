import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { plainToInstance } from "class-transformer";
import { PrismaService } from "@/common/prisma/prisma.service";

// Default work schedule (until workSchedule JSON field is implemented)
const DEFAULT_WORK_SCHEDULE = {
  startTime: "09:00",
  endTime: "17:00",
} as const;
import { DashboardStatsDto } from "./dto/dashboard-stats.dto";
import { QuickCreateVisitDto } from "./dto/quick-create-visit.dto";
import { CheckInVisitDto } from "./dto/check-in-visit.dto";
import { DashboardStatsResponseDto } from "./dto/dashboard-stats-response.dto";
import { QueueItemResponseDto } from "./dto/queue-item-response.dto";
import { DoctorScheduleResponseDto } from "./dto/doctor-schedule-response.dto";
import {
  QueueDashboardResponseDto,
  DoctorQueueDto,
  QueueVisitDto,
} from "./dto/queue-dashboard-response.dto";
import {
  AppointmentStatus,
  VisitStatus,
  PaymentStatus,
  AppointmentType,
} from "@prisma/client";

@Injectable()
export class ReceptionService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardStats(dto: DashboardStatsDto) {
    const { organizationId, date: dateStr } = dto;
    const targetDate = dateStr ? new Date(dateStr) : new Date();
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

    const [
      totalAppointmentsToday,
      patientsInQueue,
      completedVisits,
      canceledAppointments,
      noShowAppointments,
      totalRevenueToday,
      unpaidInvoicesCount,
    ] = await Promise.all([
      // Total appointments
      this.prisma.appointment.count({
        where: {
          organizationId,
          scheduledAt: { gte: startOfDay, lte: endOfDay },
        },
      }),

      // Patients in queue (checked in but not completed)
      this.prisma.appointment.count({
        where: {
          organizationId,
          scheduledAt: { gte: startOfDay, lte: endOfDay },
          status: AppointmentStatus.IN_QUEUE,
          checkInAt: { not: null },
        },
      }),

      // Completed visits
      this.prisma.visit.count({
        where: {
          organizationId,
          visitDate: { gte: startOfDay, lte: endOfDay },
          status: VisitStatus.COMPLETED,
        },
      }),

      // Canceled appointments
      this.prisma.appointment.count({
        where: {
          organizationId,
          scheduledAt: { gte: startOfDay, lte: endOfDay },
          status: AppointmentStatus.CANCELLED,
        },
      }),

      // No-show appointments
      this.prisma.appointment.count({
        where: {
          organizationId,
          scheduledAt: { gte: startOfDay, lte: endOfDay },
          status: AppointmentStatus.NO_SHOW,
        },
      }),

      // Total revenue today (sum of paidAmount from invoices)
      this.prisma.invoice
        .aggregate({
          where: {
            organizationId,
            createdAt: { gte: startOfDay, lte: endOfDay },
          },
          _sum: { paidAmount: true },
        })
        .then((result) => result._sum.paidAmount?.toNumber() ?? 0),

      // Unpaid invoices count
      this.prisma.invoice.count({
        where: {
          organizationId,
          createdAt: { gte: startOfDay, lte: endOfDay },
          status: {
            in: [PaymentStatus.UNPAID, PaymentStatus.PARTIALLY_PAID],
          },
        },
      }),
    ]);

    const stats = {
      date: targetDate.toISOString(),
      totalPatientsToday: totalAppointmentsToday,
      totalAppointmentsToday,
      patientsInQueue,
      completedVisits,
      canceledAppointments,
      noShowAppointments,
      totalRevenueToday,
      unpaidInvoicesCount,
    };

    return plainToInstance(DashboardStatsResponseDto, stats);
  }

  async getQueue(organizationId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const appointments = await this.prisma.appointment.findMany({
      where: {
        organizationId,
        scheduledAt: { gte: today },
        status: {
          in: [AppointmentStatus.IN_QUEUE, AppointmentStatus.IN_PROGRESS],
        },
        checkInAt: { not: null },
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
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            middleName: true,
            title: { select: { name: true } },
            department: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
          },
        },
        visits: {
          where: { status: VisitStatus.IN_PROGRESS },
          select: { id: true, visitDate: true },
        },
      },
      orderBy: { checkInAt: "asc" },
    });

    const queueItems = appointments.map((apt, index) => {
      const waitTime = apt.checkInAt
        ? Math.floor((Date.now() - apt.checkInAt.getTime()) / 60000)
        : 0;

      const estimatedWaitTime = waitTime + index * 15; // Simple estimation: 15 min per patient

      return {
        position: index + 1,
        appointment: {
          id: apt.id,
          scheduledAt: apt.scheduledAt.toISOString(),
          checkInAt: apt.checkInAt?.toISOString(),
          status: apt.status,
          roomNumber: apt.roomNumber,
        },
        patient: apt.patient,
        employee: apt.employee,
        waitTime,
        estimatedWaitTime,
      };
    });

    return plainToInstance(QueueItemResponseDto, queueItems);
  }

  async getDoctorSchedule(
    organizationId: string,
    date?: string,
    departmentId?: string
  ) {
    const targetDate = date ? new Date(date) : new Date();
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

    const employees = await this.prisma.employee.findMany({
      where: {
        organizationId,
        status: "ACTIVE",
        ...(departmentId && { departmentId }),
      },
      include: {
        title: { select: { name: true } },
        department: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        appointments: {
          where: {
            scheduledAt: { gte: startOfDay, lte: endOfDay },
          },
          include: {
            visits: {
              where: { status: VisitStatus.IN_PROGRESS },
              include: {
                patient: {
                  select: {
                    firstName: true,
                    lastName: true,
                    middleName: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    const schedules = employees.map((employee) => {
      const completed = employee.appointments.filter(
        (a) => a.status === AppointmentStatus.COMPLETED
      ).length;
      const inProgress = employee.appointments.filter(
        (a) => a.status === AppointmentStatus.IN_PROGRESS
      ).length;
      const pending = employee.appointments.filter(
        (a) =>
          a.status === AppointmentStatus.SCHEDULED ||
          a.status === AppointmentStatus.IN_QUEUE
      ).length;
      const canceled = employee.appointments.filter(
        (a) => a.status === AppointmentStatus.CANCELLED
      ).length;

      const currentVisit = employee.appointments
        .flatMap((a) => a.visits)
        .find((v) => v.status === VisitStatus.IN_PROGRESS);

      let status: "FREE" | "BUSY" | "BREAK" | "FINISHED" = "FREE";
      if (currentVisit) {
        status = "BUSY";
      } else if (completed === employee.appointments.length && completed > 0) {
        status = "FINISHED";
      }

      return {
        employee: {
          id: employee.id,
          firstName: employee.firstName,
          lastName: employee.lastName,
          middleName: employee.middleName,
          title: employee.title,
        },
        department: employee.department,
        schedule: DEFAULT_WORK_SCHEDULE, // TODO: Parse from employee.workSchedule JSON field when implemented
        appointments: {
          total: employee.appointments.length,
          completed,
          inProgress,
          pending,
          canceled,
        },
        currentVisit: currentVisit
          ? {
              id: currentVisit.id,
              patient: currentVisit.patient,
              startedAt: currentVisit.visitDate.toISOString(),
            }
          : undefined,
        status,
      };
    });

    return plainToInstance(DoctorScheduleResponseDto, schedules);
  }

  async quickCreateVisit(dto: QuickCreateVisitDto, createdById: string) {
    // Use new checkIn flow
    const checkInDto: CheckInVisitDto = {
      organizationId: dto.organizationId,
      patientId: dto.patientId,
      employeeId: dto.employeeId,
      serviceId: dto.serviceId,
      type: dto.type ?? AppointmentType.STANDARD,
      roomNumber: dto.roomNumber,
      notes: dto.notes,
    };

    const result = await this.checkIn(checkInDto, createdById);

    // Create invoice if requested
    let invoice = null;
    if (dto.createInvoice) {
      const service = await this.prisma.service.findFirst({
        where: { id: dto.serviceId, organizationId: dto.organizationId },
      });

      if (service?.price) {
        invoice = await this.prisma.invoice.create({
          data: {
            invoiceNumber: await this.generateInvoiceNumber(dto.organizationId),
            patientId: dto.patientId,
            visitId: result.visit.id,
            totalAmount: service.price,
            paidAmount: 0,
            status: PaymentStatus.UNPAID,
            createdById,
            organizationId: dto.organizationId,
            items: {
              create: {
                serviceId: dto.serviceId,
                quantity: 1,
                unitPrice: service.price,
                totalPrice: service.price,
                discount: 0,
              },
            },
          },
          include: {
            items: {
              include: { service: true },
            },
          },
        });
      }
    }

    return {
      ...result,
      invoice,
    };
  }

  private async generateInvoiceNumber(organizationId: string): Promise<string> {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");

    const count = await this.prisma.invoice.count({
      where: {
        organizationId,
        createdAt: {
          gte: new Date(year, now.getMonth(), 1),
          lt: new Date(year, now.getMonth() + 1, 1),
        },
      },
    });

    const nextNumber = String(count + 1).padStart(4, "0");
    return `INV-${year}${month}-${nextNumber}`;
  }

  async checkIn(dto: CheckInVisitDto, createdById: string) {
    const {
      organizationId,
      patientId,
      employeeId,
      serviceId,
      type = AppointmentType.STANDARD,
      roomNumber,
      notes,
    } = dto;

    // Validate patient
    const patient = await this.prisma.patient.findFirst({
      where: { id: patientId, organizationId },
    });
    if (!patient) {
      throw new NotFoundException("Patient not found");
    }

    // Validate employee (doctor)
    const employee = await this.prisma.employee.findFirst({
      where: { id: employeeId, organizationId, status: "ACTIVE" },
    });
    if (!employee) {
      throw new NotFoundException("Employee not found or inactive");
    }

    // Validate service if provided
    let service = null;
    if (serviceId) {
      service = await this.prisma.service.findFirst({
        where: { id: serviceId, organizationId, isActive: true },
      });
      if (!service) {
        throw new NotFoundException("Service not found or inactive");
      }
    }

    const now = new Date();
    const startOfDay = new Date(now.setHours(0, 0, 0, 0));
    const endOfDay = new Date(now.setHours(23, 59, 59, 999));

    // Check if doctor has any IN_PROGRESS visit
    const currentVisit = await this.prisma.visit.findFirst({
      where: {
        organizationId,
        employeeId,
        visitDate: { gte: startOfDay, lte: endOfDay },
        status: VisitStatus.IN_PROGRESS,
      },
    });

    const doctorIsBusy = currentVisit != null;

    // Determine queue behavior
    let queueNumber: number;
    let visitStatus: VisitStatus;
    let appointmentStatus: AppointmentStatus;
    let queuedAt: Date | null = null;
    let startedAt: Date | null = null;

    if (type === AppointmentType.WITHOUT_QUEUE && !doctorIsBusy) {
      // Doctor is free, start immediately
      visitStatus = VisitStatus.IN_PROGRESS;
      appointmentStatus = AppointmentStatus.IN_PROGRESS;
      startedAt = new Date();
      queueNumber = 0; // No queue
    } else if (
      type === AppointmentType.EMERGENCY ||
      type === AppointmentType.WITHOUT_QUEUE
    ) {
      // Insert at head of queue (position 1), shift others
      await this.prisma.visit.updateMany({
        where: {
          organizationId,
          employeeId,
          visitDate: { gte: startOfDay, lte: endOfDay },
          status: VisitStatus.WAITING,
          queueNumber: { not: null },
        },
        data: {
          queueNumber: { increment: 1 },
        },
      });
      queueNumber = 1;
      visitStatus = VisitStatus.WAITING;
      appointmentStatus = AppointmentStatus.IN_QUEUE;
      queuedAt = new Date();
    } else {
      // STANDARD: append to end of queue
      const maxQueue = await this.prisma.visit.findFirst({
        where: {
          organizationId,
          employeeId,
          visitDate: { gte: startOfDay, lte: endOfDay },
          status: VisitStatus.WAITING,
          queueNumber: { not: null },
        },
        orderBy: { queueNumber: "desc" },
      });
      queueNumber = (maxQueue?.queueNumber ?? 0) + 1;
      visitStatus = VisitStatus.WAITING;
      appointmentStatus = AppointmentStatus.IN_QUEUE;
      queuedAt = new Date();
    }

    // Create appointment
    const appointment = await this.prisma.appointment.create({
      data: {
        patientId,
        employeeId,
        serviceId,
        scheduledAt: new Date(),
        duration: service?.durationMin ?? 30,
        type,
        status: appointmentStatus,
        roomNumber,
        notes,
        checkInAt: new Date(),
        createdById,
        organizationId,
      },
      include: {
        patient: true,
        employee: true,
        service: true,
      },
    });

    // Create visit
    const visit = await this.prisma.visit.create({
      data: {
        appointmentId: appointment.id,
        patientId,
        employeeId,
        status: visitStatus,
        queueNumber,
        queuedAt,
        startedAt,
        notes,
        organizationId,
      },
      include: {
        patient: true,
        employee: true,
        appointment: true,
      },
    });

    const result = {
      visit,
      appointment,
      queuePosition: queueNumber,
    };

    return result;
  }

  async getQueueDashboard(
    organizationId: string,
    date?: string
  ): Promise<QueueDashboardResponseDto> {
    // Handle timezone properly - if date provided, treat as local date
    let startOfDay: Date;
    let endOfDay: Date;

    if (date) {
      // Parse date as local (not UTC)
      const [year, month, day] = date.split("-").map(Number);
      startOfDay = new Date(year, month - 1, day, 0, 0, 0, 0);
      endOfDay = new Date(year, month - 1, day, 23, 59, 59, 999);
    } else {
      // Use current local day
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

    // Get all ACTIVE doctors
    const doctors = await this.prisma.employee.findMany({
      where: {
        organizationId,
        status: "ACTIVE",
      },
      include: {
        title: { select: { name: true } },
        visits: {
          where: {
            // visitDate: { gte: startOfDay, lte: endOfDay },
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
          orderBy: { queueNumber: "asc" },
        },
      },
    });

    const result = doctors.map((doctor) => {
      const waiting = doctor.visits.filter(
        (v) => v.status === VisitStatus.WAITING
      );
      const inProgress = doctor.visits.filter(
        (v) => v.status === VisitStatus.IN_PROGRESS
      );
      const completed = doctor.visits.filter(
        (v) => v.status === VisitStatus.COMPLETED
      );

      // Calculate average times
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

      // Determine doctor status
      let status: "FREE" | "BUSY" | "FINISHED" = "FREE";
      if (inProgress.length > 0) {
        status = "BUSY";
      } else if (completed.length > 0 && waiting.length === 0) {
        status = "FINISHED";
      }

      // Build queue with live waiting time
      const queue: QueueVisitDto[] = waiting.map((visit) => {
        const now = new Date();
        const waitingMinutes = visit.queuedAt
          ? Math.floor((now.getTime() - visit.queuedAt.getTime()) / 60000)
          : 0;

        return {
          id: visit.id,
          queueNumber: visit.queueNumber,
          queuedAt: visit.queuedAt,
          status: visit.status,
          patient: visit.patient,
          waitingMinutes,
        };
      });

      const doctorQueue: DoctorQueueDto = {
        id: doctor.id,
        firstName: doctor.firstName,
        lastName: doctor.lastName,
        middleName: doctor.middleName,
        status,
        queue,
        stats: {
          waiting: waiting.length,
          inProgress: inProgress.length,
          completed: completed.length,
          avgWaitingTime: Math.round(avgWaitingTime),
          avgServiceTime: Math.round(avgServiceTime),
        },
      };

      return doctorQueue;
    });

    return plainToInstance(QueueDashboardResponseDto, { doctors: result });
  }
}
