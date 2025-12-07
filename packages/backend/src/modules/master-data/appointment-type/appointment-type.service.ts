import {
  Injectable,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { PrismaService } from "../../../common/prisma/prisma.service";
import { CreateAppointmentTypeDto } from "./dto/create-appointment-type.dto";
import { UpdateAppointmentTypeDto } from "./dto/update-appointment-type.dto";
import { FindAllAppointmentTypesDto } from "./dto/find-all-appointment-types.dto";
import { AppointmentTypeResponseDto } from "./dto/appointment-type-response.dto";
import { Prisma } from "@prisma/client";
import { plainToInstance } from "class-transformer";
import { PaginatedResponseDto } from "@/common/dto/pagination.dto";

@Injectable()
export class AppointmentTypeService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Создать новый тип приёма
   */
  async create(
    createDto: CreateAppointmentTypeDto
  ): Promise<AppointmentTypeResponseDto> {
    try {
      const appointmentType = await this.prisma.appointmentType.create({
        data: {
          ...createDto,
        },
      });

      return plainToInstance(AppointmentTypeResponseDto, appointmentType);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          throw new ConflictException(
            "Тип приёма с таким названием или кодом уже существует в организации"
          );
        }
      }
      throw error;
    }
  }

  /**
   * Получить все типы приёма с фильтрацией и пагинацией
   */
  async findAll(
    findAllDto: FindAllAppointmentTypesDto
  ): Promise<PaginatedResponseDto<AppointmentTypeResponseDto>> {
    const {
      organizationId,
      search,
      isActive,
      page = 1,
      limit = 10,
    } = findAllDto;
    const skip = (page - 1) * limit;

    const where: Prisma.AppointmentTypeWhereInput = {
      organizationId,
      ...(isActive !== undefined && { isActive }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { code: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ],
      }),
    };

    const [appointmentTypes, total] = await Promise.all([
      this.prisma.appointmentType.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      }),
      this.prisma.appointmentType.count({ where }),
    ]);

    return {
      data: plainToInstance(AppointmentTypeResponseDto, appointmentTypes),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Получить тип приёма по ID
   */
  async findOne(id: string): Promise<AppointmentTypeResponseDto> {
    const appointmentType = await this.prisma.appointmentType.findFirst({
      where: { id },
    });

    if (!appointmentType) {
      throw new NotFoundException("Тип приёма не найден");
    }

    return plainToInstance(AppointmentTypeResponseDto, appointmentType);
  }

  /**
   * Обновить тип приёма
   */
  async update(
    id: string,
    updateDto: UpdateAppointmentTypeDto
  ): Promise<AppointmentTypeResponseDto> {
    await this.findOne(id);

    try {
      const appointmentType = await this.prisma.appointmentType.update({
        where: { id },
        data: updateDto,
      });

      return plainToInstance(AppointmentTypeResponseDto, appointmentType);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          throw new ConflictException(
            "Тип приёма с таким названием или кодом уже существует в организации"
          );
        }
      }
      throw error;
    }
  }

  /**
   * Удалить тип приёма
   */
  async remove(id: string): Promise<void> {
    await this.findOne(id);

    await this.prisma.appointmentType.delete({
      where: { id },
    });
  }

  /**
   * Изменить статус типа приёма
   */
  async toggleStatus(id: string): Promise<AppointmentTypeResponseDto> {
    const existing = await this.findOne(id);

    const appointmentType = await this.prisma.appointmentType.update({
      where: { id },
      data: { isActive: !existing.isActive },
    });

    return plainToInstance(AppointmentTypeResponseDto, appointmentType);
  }
}
