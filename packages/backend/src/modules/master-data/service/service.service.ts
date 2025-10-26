import {
  Injectable,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { PrismaService } from "../../../common/prisma/prisma.service";
import { CreateServiceDto } from "./dto/create-service.dto";
import { UpdateServiceDto } from "./dto/update-service.dto";
import { FindAllServicesDto } from "./dto/find-all-services.dto";
import { ServiceResponseDto } from "./dto/service-response.dto";
import { Prisma } from "@prisma/client";
import { plainToInstance } from "class-transformer";
import { PaginatedResponseDto } from "@/common/dto/pagination.dto";

@Injectable()
export class ServiceService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Создать новую услугу
   */
  async create(createServiceDto: CreateServiceDto): Promise<ServiceResponseDto> {
    try {
      const service = await this.prisma.service.create({
        data: {
          ...createServiceDto,
        },
        include: {
          department: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
        },
      });

      return plainToInstance(ServiceResponseDto, service);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          const target = (error.meta?.target as string[]) || [];
          if (target.includes("code")) {
            throw new ConflictException(
              "Услуга с таким кодом уже существует в организации",
            );
          }
        }
      }
      throw error;
    }
  }

  /**
   * Получить все услуги с фильтрацией и пагинацией
   */
  async findAll(
    findAllDto: FindAllServicesDto,
  ): Promise<PaginatedResponseDto<ServiceResponseDto>> {
    const {
      organizationId,
      search,
      isActive,
      type,
      departmentId,
      page = 1,
      limit = 10,
    } = findAllDto;
    const skip = (page - 1) * limit;

    const where: Prisma.ServiceWhereInput = {
      organizationId,
      ...(isActive !== undefined && { isActive }),
      ...(type && { type }),
      ...(departmentId && { departmentId }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { code: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ],
      }),
    };

    const [services, total] = await Promise.all([
      this.prisma.service.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ createdAt: "desc" }],
        include: {
          department: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
        },
      }),
      this.prisma.service.count({ where }),
    ]);

    return {
      data: plainToInstance(ServiceResponseDto, services),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Получить услугу по ID
   */
  async findOne(id: string): Promise<ServiceResponseDto> {
    const service = await this.prisma.service.findFirst({
      where: { id },
      include: {
        department: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    if (!service) {
      throw new NotFoundException("Услуга не найдена");
    }

    return plainToInstance(ServiceResponseDto, service);
  }

  /**
   * Обновить услугу
   */
  async update(
    id: string,
    updateServiceDto: UpdateServiceDto,
  ): Promise<ServiceResponseDto> {
    await this.findOne(id);

    try {
      const service = await this.prisma.service.update({
        where: { id },
        data: updateServiceDto,
        include: {
          department: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
        },
      });

      return plainToInstance(ServiceResponseDto, service);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          const target = (error.meta?.target as string[]) || [];
          if (target.includes("code")) {
            throw new ConflictException(
              "Услуга с таким кодом уже существует в организации",
            );
          }
        }
      }
      throw error;
    }
  }

  /**
   * Удалить услугу
   */
  async remove(id: string): Promise<void> {
    await this.findOne(id);

    await this.prisma.service.delete({
      where: { id },
    });
  }

  /**
   * Изменить статус услуги
   */
  async toggleStatus(id: string): Promise<ServiceResponseDto> {
    const existingService = await this.findOne(id);

    const service = await this.prisma.service.update({
      where: { id },
      data: { isActive: !existingService.isActive },
      include: {
        department: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    return plainToInstance(ServiceResponseDto, service);
  }
}
