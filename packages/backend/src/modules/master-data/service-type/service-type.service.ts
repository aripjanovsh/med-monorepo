import {
  Injectable,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { PrismaService } from "../../../common/prisma/prisma.service";
import { CreateServiceTypeDto } from "./dto/create-service-type.dto";
import { UpdateServiceTypeDto } from "./dto/update-service-type.dto";
import { FindAllServiceTypesDto } from "./dto/find-all-service-types.dto";
import { ServiceTypeResponseDto } from "./dto/service-type-response.dto";
import { Prisma } from "@prisma/client";
import { plainToInstance } from "class-transformer";
import { PaginatedResponseDto } from "@/common/dto/pagination.dto";

@Injectable()
export class ServiceTypeService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Создать новый тип услуги
   */
  async create(
    createServiceTypeDto: CreateServiceTypeDto,
  ): Promise<ServiceTypeResponseDto> {
    try {
      const serviceType = await this.prisma.serviceType.create({
        data: {
          ...createServiceTypeDto,
        },
      });

      return plainToInstance(ServiceTypeResponseDto, serviceType);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          const target = error.meta?.target as string[];
          if (target?.includes("name")) {
            throw new ConflictException(
              "Тип услуги с таким названием уже существует в организации",
            );
          }
          if (target?.includes("code")) {
            throw new ConflictException(
              "Тип услуги с таким кодом уже существует в организации",
            );
          }
        }
      }
      throw error;
    }
  }

  /**
   * Получить все типы услуг с фильтрацией и пагинацией
   */
  async findAll(
    findAllDto: FindAllServiceTypesDto,
  ): Promise<PaginatedResponseDto<ServiceTypeResponseDto>> {
    const {
      organizationId,
      search,
      isActive,
      page = 1,
      limit = 10,
    } = findAllDto;
    const skip = (page - 1) * limit;

    const where: Prisma.ServiceTypeWhereInput = {
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

    const [serviceTypes, total] = await Promise.all([
      this.prisma.serviceType.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.serviceType.count({ where }),
    ]);

    return {
      data: plainToInstance(ServiceTypeResponseDto, serviceTypes),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Получить тип услуги по ID
   */
  async findOne(id: string): Promise<ServiceTypeResponseDto> {
    const serviceType = await this.prisma.serviceType.findFirst({
      where: { id },
    });

    if (!serviceType) {
      throw new NotFoundException("Тип услуги не найден");
    }

    return plainToInstance(ServiceTypeResponseDto, serviceType);
  }

  /**
   * Обновить тип услуги
   */
  async update(
    id: string,
    updateServiceTypeDto: UpdateServiceTypeDto,
  ): Promise<ServiceTypeResponseDto> {
    await this.findOne(id);

    try {
      const serviceType = await this.prisma.serviceType.update({
        where: { id },
        data: updateServiceTypeDto,
      });

      return plainToInstance(ServiceTypeResponseDto, serviceType);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          const target = error.meta?.target as string[];
          if (target?.includes("name")) {
            throw new ConflictException(
              "Тип услуги с таким названием уже существует в организации",
            );
          }
          if (target?.includes("code")) {
            throw new ConflictException(
              "Тип услуги с таким кодом уже существует в организации",
            );
          }
        }
      }
      throw error;
    }
  }

  /**
   * Удалить тип услуги
   */
  async remove(id: string): Promise<void> {
    await this.findOne(id);

    await this.prisma.serviceType.delete({
      where: { id },
    });
  }

  /**
   * Изменить статус типа услуги
   */
  async toggleStatus(id: string): Promise<ServiceTypeResponseDto> {
    const existingType = await this.findOne(id);

    const serviceType = await this.prisma.serviceType.update({
      where: { id },
      data: { isActive: !existingType.isActive },
    });

    return plainToInstance(ServiceTypeResponseDto, serviceType);
  }
}
