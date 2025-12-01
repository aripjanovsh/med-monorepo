import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma, OrderStatus } from "@prisma/client";
import { PrismaService } from "@/common/prisma/prisma.service";
import { PatientDashboardStatsQueryDto } from "./dto/patient-dashboard-stats-query.dto";
import { PatientDashboardStatsResponseDto } from "./dto/patient-dashboard-stats-response.dto";
import { plainToInstance } from "class-transformer";

@Injectable()
export class PatientDashboardStatsService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardStats(
    query: PatientDashboardStatsQueryDto
  ): Promise<PatientDashboardStatsResponseDto> {
    const { patientId, organizationId } = query;

    // Verify patient exists
    const patientWhere: Prisma.PatientWhereUniqueInput = { id: patientId };
    if (organizationId) {
      patientWhere.organizationId = organizationId;
    }

    const patient = await this.prisma.patient.findUnique({
      where: patientWhere,
      include: {
        doctors: {
          include: {
            employee: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                department: {
                  select: { name: true },
                },
              },
            },
          },
        },
      },
    });

    if (!patient) {
      throw new NotFoundException("Patient not found");
    }

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const visitWhere: Prisma.VisitWhereInput = {
      patientId,
      ...(organizationId && { organizationId }),
    };

    const orderWhere: Prisma.ServiceOrderWhereInput = {
      patientId,
      ...(organizationId && { organizationId }),
    };

    // Fetch all data in parallel
    const [
      totalVisits,
      visitsLastMonth,
      activeOrdersCount,
      recentVisitsData,
      activeOrdersData,
      allOrdersByStatus,
      visitsLast6Months,
    ] = await Promise.all([
      // Total visits
      this.prisma.visit.count({ where: visitWhere }),

      // Visits in last month
      this.prisma.visit.count({
        where: {
          ...visitWhere,
          visitDate: { gte: oneMonthAgo },
        },
      }),

      // Active orders count
      this.prisma.serviceOrder.count({
        where: {
          ...orderWhere,
          status: { in: [OrderStatus.ORDERED, OrderStatus.IN_PROGRESS] },
        },
      }),

      // Recent visits (last 5)
      this.prisma.visit.findMany({
        where: visitWhere,
        include: {
          employee: {
            select: {
              firstName: true,
              lastName: true,
              department: { select: { name: true } },
            },
          },
        },
        orderBy: { visitDate: "desc" },
        take: 5,
      }),

      // Active orders
      this.prisma.serviceOrder.findMany({
        where: {
          ...orderWhere,
          status: { in: [OrderStatus.ORDERED, OrderStatus.IN_PROGRESS] },
        },
        include: {
          service: { select: { name: true } },
          department: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),

      // Orders grouped by status
      this.prisma.serviceOrder.groupBy({
        by: ["status"],
        where: orderWhere,
        _count: { id: true },
      }),

      // Visits in last 6 months for chart
      this.prisma.visit.findMany({
        where: {
          ...visitWhere,
          visitDate: { gte: sixMonthsAgo },
        },
        select: { visitDate: true },
        orderBy: { visitDate: "asc" },
      }),
    ]);

    // Calculate visits by department
    const visitsByDepartmentRaw = await this.prisma.visit.groupBy({
      by: ["employeeId"],
      where: visitWhere,
      _count: { id: true },
    });

    // Get department names for visits
    const employeeIds = visitsByDepartmentRaw.map((v) => v.employeeId);
    const employeesWithDepts = await this.prisma.employee.findMany({
      where: { id: { in: employeeIds } },
      select: { id: true, department: { select: { name: true } } },
    });

    const deptMap = new Map(
      employeesWithDepts.map((e) => [e.id, e.department?.name ?? "Без отдела"])
    );

    // Aggregate visits by department
    const visitsByDeptMap = new Map<string, number>();
    for (const v of visitsByDepartmentRaw) {
      const deptName = deptMap.get(v.employeeId) ?? "Без отдела";
      visitsByDeptMap.set(
        deptName,
        (visitsByDeptMap.get(deptName) ?? 0) + v._count.id
      );
    }

    // Get last visit date
    const lastVisit = recentVisitsData[0];

    // Build visits by month (last 6 months)
    const monthNames = [
      "Янв",
      "Фев",
      "Мар",
      "Апр",
      "Май",
      "Июн",
      "Июл",
      "Авг",
      "Сен",
      "Окт",
      "Ноя",
      "Дек",
    ];
    const visitsByMonthMap = new Map<string, number>();

    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      visitsByMonthMap.set(key, 0);
    }

    // Count visits per month
    for (const visit of visitsLast6Months) {
      const date = new Date(visit.visitDate);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      if (visitsByMonthMap.has(key)) {
        visitsByMonthMap.set(key, (visitsByMonthMap.get(key) ?? 0) + 1);
      }
    }

    // Convert to array
    const visitsByMonth = Array.from(visitsByMonthMap.entries()).map(
      ([key, visits]) => {
        const [, monthIndex] = key.split("-");
        return {
          month: monthNames[Number.parseInt(monthIndex, 10)],
          visits,
        };
      }
    );

    // Map order statuses
    const statusMap: Record<string, string> = {
      ORDERED: "ordered",
      IN_PROGRESS: "inProgress",
      COMPLETED: "completed",
      CANCELLED: "cancelled",
    };

    const ordersByStatus = allOrdersByStatus.map((item) => ({
      status: statusMap[item.status] ?? item.status.toLowerCase(),
      count: item._count.id,
    }));

    // Map visit statuses
    const visitStatusMap: Record<string, string> = {
      WAITING: "waiting",
      IN_PROGRESS: "inProgress",
      COMPLETED: "completed",
      CANCELED: "cancelled",
    };

    // Build response
    const response: PatientDashboardStatsResponseDto = {
      metrics: {
        totalVisits,
        visitsLastMonth,
        activeOrders: activeOrdersCount,
        totalDoctors: patient.doctors.length,
        activeDoctors: patient.doctors.filter((d) => d.isActive).length,
        lastVisitDate: lastVisit?.visitDate,
      },
      visitsByMonth,
      ordersByStatus,
      visitsByDepartment: Array.from(visitsByDeptMap.entries()).map(
        ([department, visits]) => ({
          department,
          visits,
        })
      ),
      recentVisits: recentVisitsData.map((v) => ({
        id: v.id,
        date: v.visitDate,
        doctor: `${v.employee.firstName} ${v.employee.lastName}`,
        department: v.employee.department?.name ?? "—",
        status: visitStatusMap[v.status] ?? v.status.toLowerCase(),
      })),
      activeOrders: activeOrdersData.map((o) => ({
        id: o.id,
        name: o.service.name,
        department: o.department?.name ?? "—",
        status: statusMap[o.status] ?? o.status.toLowerCase(),
        date: o.createdAt,
      })),
      treatingDoctors: patient.doctors.map((pd) => ({
        id: pd.id,
        name: `${pd.employee.firstName} ${pd.employee.lastName}`,
        specialty: pd.employee.department?.name ?? "—",
        status: pd.isActive ? "active" : "inactive",
      })),
    };

    return plainToInstance(PatientDashboardStatsResponseDto, response);
  }
}
