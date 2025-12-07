import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { plainToInstance } from "class-transformer";
import { PrismaService } from "../../common/prisma/prisma.service";
import { PaginatedResponseDto } from "@/common/dto/pagination.dto";
import { CreateEmployeeLeaveDaysDto } from "./dto/create-employee-leave-days.dto";
import { UpdateEmployeeLeaveDaysDto } from "./dto/update-employee-leave-days.dto";
import { FindAllEmployeeLeaveDaysDto } from "./dto/find-all-employee-leave-days.dto";
import { EmployeeLeaveDaysResponseDto } from "./dto/employee-leave-days-response.dto";

const EMPLOYEE_SELECT = {
  id: true,
  firstName: true,
  middleName: true,
  lastName: true,
};

const LEAVE_TYPE_SELECT = {
  id: true,
  name: true,
  code: true,
  color: true,
  isPaid: true,
};

@Injectable()
export class EmployeeLeaveDaysService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    dto: CreateEmployeeLeaveDaysDto
  ): Promise<EmployeeLeaveDaysResponseDto> {
    const { startsOn, until, ...rest } = dto;

    if (new Date(until) < new Date(startsOn)) {
      throw new BadRequestException(
        "Дата окончания не может быть раньше даты начала"
      );
    }

    // Verify employee exists
    const employee = await this.prisma.employee.findFirst({
      where: { id: dto.employeeId, organizationId: dto.organizationId },
    });

    if (!employee) {
      throw new NotFoundException("Сотрудник не найден");
    }

    // Verify leave type exists
    const leaveType = await this.prisma.leaveType.findFirst({
      where: { id: dto.leaveTypeId, organizationId: dto.organizationId },
    });

    if (!leaveType) {
      throw new NotFoundException("Тип отпуска не найден");
    }

    const leaveDays = await this.prisma.employeeLeaveDays.create({
      data: {
        ...rest,
        startsOn: new Date(startsOn),
        until: new Date(until),
      },
      include: {
        employee: { select: EMPLOYEE_SELECT },
        leaveType: { select: LEAVE_TYPE_SELECT },
      },
    });

    return plainToInstance(EmployeeLeaveDaysResponseDto, leaveDays);
  }

  async findAll(
    dto: FindAllEmployeeLeaveDaysDto
  ): Promise<PaginatedResponseDto<EmployeeLeaveDaysResponseDto>> {
    const {
      organizationId,
      employeeId,
      leaveTypeId,
      from,
      to,
      page = 1,
      limit = 10,
    } = dto;
    const skip = (page - 1) * limit;

    const where: Prisma.EmployeeLeaveDaysWhereInput = {
      organizationId,
      ...(employeeId && { employeeId }),
      ...(leaveTypeId && { leaveTypeId }),
      ...(from && { startsOn: { gte: new Date(from) } }),
      ...(to && { until: { lte: new Date(to) } }),
    };

    const [items, total] = await Promise.all([
      this.prisma.employeeLeaveDays.findMany({
        where,
        skip,
        take: limit,
        include: {
          employee: { select: EMPLOYEE_SELECT },
          leaveType: { select: LEAVE_TYPE_SELECT },
        },
        orderBy: [{ startsOn: "desc" }, { createdAt: "desc" }],
      }),
      this.prisma.employeeLeaveDays.count({ where }),
    ]);

    return {
      data: plainToInstance(EmployeeLeaveDaysResponseDto, items),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<EmployeeLeaveDaysResponseDto> {
    const leaveDays = await this.prisma.employeeLeaveDays.findFirst({
      where: { id },
      include: {
        employee: { select: EMPLOYEE_SELECT },
        leaveType: { select: LEAVE_TYPE_SELECT },
      },
    });

    if (!leaveDays) {
      throw new NotFoundException("Запись об отпуске не найдена");
    }

    return plainToInstance(EmployeeLeaveDaysResponseDto, leaveDays);
  }

  async update(
    id: string,
    dto: UpdateEmployeeLeaveDaysDto
  ): Promise<EmployeeLeaveDaysResponseDto> {
    await this.findOne(id);

    const { startsOn, until, leaveTypeId, ...rest } = dto;

    if (startsOn && until && new Date(until) < new Date(startsOn)) {
      throw new BadRequestException(
        "Дата окончания не может быть раньше даты начала"
      );
    }

    // Verify leave type exists if changing
    if (leaveTypeId && dto.organizationId) {
      const leaveType = await this.prisma.leaveType.findFirst({
        where: { id: leaveTypeId, organizationId: dto.organizationId },
      });

      if (!leaveType) {
        throw new NotFoundException("Тип отпуска не найден");
      }
    }

    const leaveDays = await this.prisma.employeeLeaveDays.update({
      where: { id },
      data: {
        ...rest,
        ...(leaveTypeId && { leaveTypeId }),
        ...(startsOn && { startsOn: new Date(startsOn) }),
        ...(until && { until: new Date(until) }),
      },
      include: {
        employee: { select: EMPLOYEE_SELECT },
        leaveType: { select: LEAVE_TYPE_SELECT },
      },
    });

    return plainToInstance(EmployeeLeaveDaysResponseDto, leaveDays);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);

    await this.prisma.employeeLeaveDays.delete({
      where: { id },
    });
  }

  /**
   * Check if employee is on leave on a specific date
   */
  async isEmployeeOnLeave(employeeId: string, date: Date): Promise<boolean> {
    const count = await this.prisma.employeeLeaveDays.count({
      where: {
        employeeId,
        startsOn: { lte: date },
        until: { gte: date },
      },
    });

    return count > 0;
  }

  /**
   * Get all leave days for an employee in a date range
   */
  async getEmployeeLeavesInRange(
    employeeId: string,
    from: Date,
    to: Date
  ): Promise<EmployeeLeaveDaysResponseDto[]> {
    const leaveDays = await this.prisma.employeeLeaveDays.findMany({
      where: {
        employeeId,
        OR: [
          {
            startsOn: { gte: from, lte: to },
          },
          {
            until: { gte: from, lte: to },
          },
          {
            startsOn: { lte: from },
            until: { gte: to },
          },
        ],
      },
      include: {
        employee: { select: EMPLOYEE_SELECT },
        leaveType: { select: LEAVE_TYPE_SELECT },
      },
      orderBy: { startsOn: "asc" },
    });

    return plainToInstance(EmployeeLeaveDaysResponseDto, leaveDays);
  }
}
