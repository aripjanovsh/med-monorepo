import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { plainToInstance } from "class-transformer";
import { PrismaService } from "../../../common/prisma/prisma.service";
import { PaginatedResponseDto } from "@/common/dto/pagination.dto";
import { CreateHolidayDto } from "./dto/create-holiday.dto";
import { UpdateHolidayDto } from "./dto/update-holiday.dto";
import { FindAllHolidaysDto } from "./dto/find-all-holidays.dto";
import { HolidayResponseDto } from "./dto/holiday-response.dto";

@Injectable()
export class HolidayService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    createHolidayDto: CreateHolidayDto
  ): Promise<HolidayResponseDto> {
    const { startsOn, until, ...rest } = createHolidayDto;

    if (new Date(until) < new Date(startsOn)) {
      throw new BadRequestException(
        "Дата окончания не может быть раньше даты начала"
      );
    }

    const holiday = await this.prisma.holiday.create({
      data: {
        ...rest,
        startsOn: new Date(startsOn),
        until: new Date(until),
      },
    });

    return plainToInstance(HolidayResponseDto, holiday);
  }

  async findAll(
    findAllDto: FindAllHolidaysDto
  ): Promise<PaginatedResponseDto<HolidayResponseDto>> {
    const {
      organizationId,
      search,
      isActive,
      from,
      to,
      page = 1,
      limit = 10,
    } = findAllDto;
    const skip = (page - 1) * limit;

    const where: Prisma.HolidayWhereInput = {
      organizationId,
      ...(isActive !== undefined && { isActive }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { note: { contains: search, mode: "insensitive" } },
        ],
      }),
      ...(from && { startsOn: { gte: new Date(from) } }),
      ...(to && { until: { lte: new Date(to) } }),
    };

    const [holidays, total] = await Promise.all([
      this.prisma.holiday.findMany({
        where,
        skip,
        take: limit,
        orderBy: { startsOn: "asc" },
      }),
      this.prisma.holiday.count({ where }),
    ]);

    return {
      data: plainToInstance(HolidayResponseDto, holidays),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<HolidayResponseDto> {
    const holiday = await this.prisma.holiday.findFirst({
      where: { id },
    });

    if (!holiday) {
      throw new NotFoundException("Праздник не найден");
    }

    return plainToInstance(HolidayResponseDto, holiday);
  }

  async update(
    id: string,
    updateHolidayDto: UpdateHolidayDto
  ): Promise<HolidayResponseDto> {
    await this.findOne(id);

    const { startsOn, until, ...rest } = updateHolidayDto;

    if (startsOn && until && new Date(until) < new Date(startsOn)) {
      throw new BadRequestException(
        "Дата окончания не может быть раньше даты начала"
      );
    }

    const holiday = await this.prisma.holiday.update({
      where: { id },
      data: {
        ...rest,
        ...(startsOn && { startsOn: new Date(startsOn) }),
        ...(until && { until: new Date(until) }),
      },
    });

    return plainToInstance(HolidayResponseDto, holiday);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);

    await this.prisma.holiday.delete({
      where: { id },
    });
  }

  async toggleStatus(id: string): Promise<HolidayResponseDto> {
    const existingHoliday = await this.findOne(id);

    const holiday = await this.prisma.holiday.update({
      where: { id },
      data: { isActive: !existingHoliday.isActive },
    });

    return plainToInstance(HolidayResponseDto, holiday);
  }
}
