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
import { DashboardStatsResponseDto } from "./dto/dashboard-stats-response.dto";
import { QueueItemResponseDto } from "./dto/queue-item-response.dto";
import { DoctorScheduleResponseDto } from "./dto/doctor-schedule-response.dto";
import {
  QueueDashboardResponseDto,
  DoctorQueueDto,
  QueueVisitDto,
} from "./dto/queue-dashboard-response.dto";
import { AppointmentStatus, VisitStatus, PaymentStatus } from "@prisma/client";

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
          orderBy: { createdAt: "asc" },
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
