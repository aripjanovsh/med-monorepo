import { Injectable } from "@nestjs/common";
import { plainToInstance } from "class-transformer";
import { PrismaService } from "@/common/prisma/prisma.service";
import { EmployeeQuickStatsQueryDto } from "./dto/employee-quick-stats-query.dto";
import {
  EmployeeQuickStatsResponseDto,
  EmployeeStatusDistributionDto,
  EmployeeDepartmentStatsDto,
  EmployeeMonthlyTrendDto,
} from "./dto/employee-quick-stats-response.dto";
import { EmployeeStatus } from "@prisma/client";

const MONTHS_RU = [
  "Январь",
  "Февраль",
  "Март",
  "Апрель",
  "Май",
  "Июнь",
  "Июль",
  "Август",
  "Сентябрь",
  "Октябрь",
  "Ноябрь",
  "Декабрь",
];

const MONTHS_SHORT_RU = [
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

@Injectable()
export class EmployeeQuickStatsService {
  constructor(private readonly prisma: PrismaService) {}

  async getEmployeeQuickStats(
    dto: EmployeeQuickStatsQueryDto
  ): Promise<EmployeeQuickStatsResponseDto> {
    const { organizationId, departmentId } = dto;

    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const [
      total,
      activeCount,
      newEmployeesThisMonth,
      newEmployeesLastMonth,
      statusDistribution,
      byDepartment,
      monthlyTrends,
    ] = await Promise.all([
      this.getTotalEmployees(organizationId, departmentId),
      this.getActiveEmployees(organizationId, departmentId),
      this.getNewEmployees(organizationId, departmentId, startOfThisMonth, now),
      this.getNewEmployees(
        organizationId,
        departmentId,
        startOfLastMonth,
        endOfLastMonth
      ),
      this.getStatusDistribution(organizationId, departmentId),
      this.getByDepartment(organizationId),
      this.getMonthlyTrends(organizationId, departmentId),
    ]);

    const growthPercent =
      newEmployeesLastMonth > 0
        ? Math.round(
            ((newEmployeesThisMonth - newEmployeesLastMonth) /
              newEmployeesLastMonth) *
              100
          )
        : newEmployeesThisMonth > 0
          ? 100
          : 0;

    return plainToInstance(EmployeeQuickStatsResponseDto, {
      total,
      activeCount,
      newEmployeesThisMonth,
      newEmployeesLastMonth,
      growthPercent,
      statusDistribution,
      byDepartment,
      monthlyTrends,
    });
  }

  private async getTotalEmployees(
    organizationId: string,
    departmentId?: string
  ): Promise<number> {
    return this.prisma.employee.count({
      where: {
        organizationId,
        ...(departmentId && { departmentId }),
      },
    });
  }

  private async getActiveEmployees(
    organizationId: string,
    departmentId?: string
  ): Promise<number> {
    return this.prisma.employee.count({
      where: {
        organizationId,
        status: EmployeeStatus.ACTIVE,
        ...(departmentId && { departmentId }),
      },
    });
  }

  private async getNewEmployees(
    organizationId: string,
    departmentId: string | undefined,
    startDate: Date,
    endDate: Date
  ): Promise<number> {
    return this.prisma.employee.count({
      where: {
        organizationId,
        ...(departmentId && { departmentId }),
        hireDate: {
          gte: startDate,
          lte: endDate,
        },
      },
    });
  }

  private async getStatusDistribution(
    organizationId: string,
    departmentId?: string
  ): Promise<EmployeeStatusDistributionDto> {
    const baseWhere = {
      organizationId,
      ...(departmentId && { departmentId }),
    };

    const [active, inactive, onLeave, terminated] = await Promise.all([
      this.prisma.employee.count({
        where: { ...baseWhere, status: EmployeeStatus.ACTIVE },
      }),
      this.prisma.employee.count({
        where: { ...baseWhere, status: EmployeeStatus.INACTIVE },
      }),
      this.prisma.employee.count({
        where: { ...baseWhere, status: EmployeeStatus.ON_LEAVE },
      }),
      this.prisma.employee.count({
        where: { ...baseWhere, status: EmployeeStatus.TERMINATED },
      }),
    ]);

    return plainToInstance(EmployeeStatusDistributionDto, {
      active,
      inactive,
      onLeave,
      terminated,
    });
  }

  private async getByDepartment(
    organizationId: string
  ): Promise<EmployeeDepartmentStatsDto[]> {
    const departments = await this.prisma.department.findMany({
      where: {
        organizationId,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            staff: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return departments.map((dept) =>
      plainToInstance(EmployeeDepartmentStatsDto, {
        departmentId: dept.id,
        departmentName: dept.name,
        count: dept._count.staff,
      })
    );
  }

  private async getMonthlyTrends(
    organizationId: string,
    departmentId?: string
  ): Promise<EmployeeMonthlyTrendDto[]> {
    const now = new Date();
    const trends: EmployeeMonthlyTrendDto[] = [];

    for (let i = 0; i < 6; i++) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
      const monthStart = new Date(
        monthDate.getFullYear(),
        monthDate.getMonth(),
        1
      );
      const monthEnd = new Date(
        monthDate.getFullYear(),
        monthDate.getMonth() + 1,
        0,
        23,
        59,
        59,
        999
      );

      const baseWhere = {
        organizationId,
        ...(departmentId && { departmentId }),
      };

      const [newEmployees, terminatedEmployees] = await Promise.all([
        this.prisma.employee.count({
          where: {
            ...baseWhere,
            hireDate: {
              gte: monthStart,
              lte: monthEnd,
            },
          },
        }),
        this.prisma.employee.count({
          where: {
            ...baseWhere,
            terminationDate: {
              gte: monthStart,
              lte: monthEnd,
            },
          },
        }),
      ]);

      trends.push(
        plainToInstance(EmployeeMonthlyTrendDto, {
          month: MONTHS_RU[monthDate.getMonth()],
          monthShort: MONTHS_SHORT_RU[monthDate.getMonth()],
          year: monthDate.getFullYear(),
          newEmployees,
          terminatedEmployees,
        })
      );
    }

    return trends;
  }
}
