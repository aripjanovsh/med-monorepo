import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { plainToInstance } from "class-transformer";
import { PrismaService } from "../../common/prisma/prisma.service";
import { PaginatedResponseDto } from "@/common/dto/pagination.dto";
import { CreateEmployeeAvailabilityDto } from "./dto/create-employee-availability.dto";
import { UpdateEmployeeAvailabilityDto } from "./dto/update-employee-availability.dto";
import { FindAllEmployeeAvailabilityDto } from "./dto/find-all-employee-availability.dto";
import { EmployeeAvailabilityResponseDto } from "./dto/employee-availability-response.dto";

const EMPLOYEE_SELECT = {
  id: true,
  firstName: true,
  middleName: true,
  lastName: true,
};

@Injectable()
export class EmployeeAvailabilityService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    dto: CreateEmployeeAvailabilityDto
  ): Promise<EmployeeAvailabilityResponseDto> {
    const { startsOn, until, ...rest } = dto;

    if (until && new Date(until) < new Date(startsOn)) {
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

    const availability = await this.prisma.employeeAvailability.create({
      data: {
        ...rest,
        startsOn: new Date(startsOn),
        until: until ? new Date(until) : null,
      },
      include: { employee: { select: EMPLOYEE_SELECT } },
    });

    return plainToInstance(EmployeeAvailabilityResponseDto, availability);
  }

  async findAll(
    dto: FindAllEmployeeAvailabilityDto
  ): Promise<PaginatedResponseDto<EmployeeAvailabilityResponseDto>> {
    const {
      organizationId,
      employeeId,
      isActive,
      date,
      page = 1,
      limit = 10,
    } = dto;
    const skip = (page - 1) * limit;

    const where: Prisma.EmployeeAvailabilityWhereInput = {
      organizationId,
      ...(employeeId && { employeeId }),
      ...(isActive !== undefined && { isActive }),
      ...(date && {
        startsOn: { lte: new Date(date) },
        OR: [{ until: null }, { until: { gte: new Date(date) } }],
      }),
    };

    const [items, total] = await Promise.all([
      this.prisma.employeeAvailability.findMany({
        where,
        skip,
        take: limit,
        include: { employee: { select: EMPLOYEE_SELECT } },
        orderBy: [{ startsOn: "desc" }, { createdAt: "desc" }],
      }),
      this.prisma.employeeAvailability.count({ where }),
    ]);

    return {
      data: plainToInstance(EmployeeAvailabilityResponseDto, items),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<EmployeeAvailabilityResponseDto> {
    const availability = await this.prisma.employeeAvailability.findFirst({
      where: { id },
      include: { employee: { select: EMPLOYEE_SELECT } },
    });

    if (!availability) {
      throw new NotFoundException("Расписание доступности не найдено");
    }

    return plainToInstance(EmployeeAvailabilityResponseDto, availability);
  }

  async update(
    id: string,
    dto: UpdateEmployeeAvailabilityDto
  ): Promise<EmployeeAvailabilityResponseDto> {
    await this.findOne(id);

    const { startsOn, until, ...rest } = dto;

    if (startsOn && until && new Date(until) < new Date(startsOn)) {
      throw new BadRequestException(
        "Дата окончания не может быть раньше даты начала"
      );
    }

    const availability = await this.prisma.employeeAvailability.update({
      where: { id },
      data: {
        ...rest,
        ...(startsOn && { startsOn: new Date(startsOn) }),
        ...(until !== undefined && { until: until ? new Date(until) : null }),
      },
      include: { employee: { select: EMPLOYEE_SELECT } },
    });

    return plainToInstance(EmployeeAvailabilityResponseDto, availability);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);

    await this.prisma.employeeAvailability.delete({
      where: { id },
    });
  }

  async toggleStatus(id: string): Promise<EmployeeAvailabilityResponseDto> {
    const existing = await this.findOne(id);

    const availability = await this.prisma.employeeAvailability.update({
      where: { id },
      data: { isActive: !existing.isActive },
      include: { employee: { select: EMPLOYEE_SELECT } },
    });

    return plainToInstance(EmployeeAvailabilityResponseDto, availability);
  }

  /**
   * Get availability for a specific employee on a specific date
   */
  async getEmployeeAvailabilityForDate(
    employeeId: string,
    date: Date
  ): Promise<EmployeeAvailabilityResponseDto[]> {
    const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday

    const availabilities = await this.prisma.employeeAvailability.findMany({
      where: {
        employeeId,
        isActive: true,
        startsOn: { lte: date },
        OR: [{ until: null }, { until: { gte: date } }],
        repeatOn: { has: dayOfWeek },
      },
      include: { employee: { select: EMPLOYEE_SELECT } },
      orderBy: { startsOn: "desc" },
    });

    return plainToInstance(EmployeeAvailabilityResponseDto, availabilities);
  }
}
