import {
  Injectable,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { PrismaService } from "../../../common/prisma/prisma.service";
import { CreateAppointmentCancelTypeDto } from "./dto/create-appointment-cancel-type.dto";
import { UpdateAppointmentCancelTypeDto } from "./dto/update-appointment-cancel-type.dto";
import { FindAllAppointmentCancelTypesDto } from "./dto/find-all-appointment-cancel-types.dto";
import { AppointmentCancelTypeResponseDto } from "./dto/appointment-cancel-type-response.dto";
import { Prisma } from "@prisma/client";
import { plainToInstance } from "class-transformer";
import { PaginatedResponseDto } from "@/common/dto/pagination.dto";

@Injectable()
export class AppointmentCancelTypeService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Создать новую причину отмены
   */
  async create(
    createDto: CreateAppointmentCancelTypeDto
  ): Promise<AppointmentCancelTypeResponseDto> {
    try {
      const appointmentCancelType =
        await this.prisma.appointmentCancelType.create({
          data: {
            ...createDto,
          },
        });

      return plainToInstance(
        AppointmentCancelTypeResponseDto,
        appointmentCancelType
      );
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          throw new ConflictException(
            "Причина отмены с таким названием или кодом уже существует в организации"
          );
        }
      }
      throw error;
    }
  }

  /**
   * Получить все причины отмены с фильтрацией и пагинацией
   */
  async findAll(
    findAllDto: FindAllAppointmentCancelTypesDto
  ): Promise<PaginatedResponseDto<AppointmentCancelTypeResponseDto>> {
    const {
      organizationId,
      search,
      isActive,
      page = 1,
      limit = 10,
    } = findAllDto;
    const skip = (page - 1) * limit;

    const where: Prisma.AppointmentCancelTypeWhereInput = {
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

    const [appointmentCancelTypes, total] = await Promise.all([
      this.prisma.appointmentCancelType.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      }),
      this.prisma.appointmentCancelType.count({ where }),
    ]);

    return {
      data: plainToInstance(
        AppointmentCancelTypeResponseDto,
        appointmentCancelTypes
      ),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Получить причину отмены по ID
   */
  async findOne(id: string): Promise<AppointmentCancelTypeResponseDto> {
    const appointmentCancelType =
      await this.prisma.appointmentCancelType.findFirst({
        where: { id },
      });

    if (!appointmentCancelType) {
      throw new NotFoundException("Причина отмены не найдена");
    }

    return plainToInstance(
      AppointmentCancelTypeResponseDto,
      appointmentCancelType
    );
  }

  /**
   * Обновить причину отмены
   */
  async update(
    id: string,
    updateDto: UpdateAppointmentCancelTypeDto
  ): Promise<AppointmentCancelTypeResponseDto> {
    await this.findOne(id);

    try {
      const appointmentCancelType =
        await this.prisma.appointmentCancelType.update({
          where: { id },
          data: updateDto,
        });

      return plainToInstance(
        AppointmentCancelTypeResponseDto,
        appointmentCancelType
      );
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          throw new ConflictException(
            "Причина отмены с таким названием или кодом уже существует в организации"
          );
        }
      }
      throw error;
    }
  }

  /**
   * Удалить причину отмены
   */
  async remove(id: string): Promise<void> {
    await this.findOne(id);

    await this.prisma.appointmentCancelType.delete({
      where: { id },
    });
  }

  /**
   * Изменить статус причины отмены
   */
  async toggleStatus(id: string): Promise<AppointmentCancelTypeResponseDto> {
    const existing = await this.findOne(id);

    const appointmentCancelType =
      await this.prisma.appointmentCancelType.update({
        where: { id },
        data: { isActive: !existing.isActive },
      });

    return plainToInstance(
      AppointmentCancelTypeResponseDto,
      appointmentCancelType
    );
  }
}
