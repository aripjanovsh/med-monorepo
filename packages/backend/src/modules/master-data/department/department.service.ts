import {
  Injectable,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { PrismaService } from "../../../common/prisma/prisma.service";
import { CreateDepartmentDto } from "./dto/create-department.dto";
import { UpdateDepartmentDto } from "./dto/update-department.dto";
import { FindAllDepartmentsDto } from "./dto/find-all-departments.dto";
import { DepartmentResponseDto } from "./dto/department-response.dto";
import { Prisma } from "@prisma/client";
import { plainToInstance } from "class-transformer";
import { PaginatedResponseDto } from "@/common/dto/pagination.dto";

@Injectable()
export class DepartmentService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Создать новое отделение
   */
  async create(
    createDepartmentDto: CreateDepartmentDto,
  ): Promise<DepartmentResponseDto> {
    try {
      const department = await this.prisma.department.create({
        data: {
          ...createDepartmentDto,
        },
        include: {
          head: {
            select: {
              id: true,
              employeeId: true,
              firstName: true,
              middleName: true,
              lastName: true,
            },
          },
        },
      });

      return plainToInstance(DepartmentResponseDto, department);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          const target = (error.meta?.target as string[]) || [];
          if (target.includes("name")) {
            throw new ConflictException(
              "Отделение с таким названием уже существует в организации",
            );
          }
          if (target.includes("code")) {
            throw new ConflictException(
              "Отделение с таким кодом уже существует в организации",
            );
          }
        }
      }
      throw error;
    }
  }

  /**
   * Получить все отделения с фильтрацией и пагинацией
   */
  async findAll(
    findAllDto: FindAllDepartmentsDto,
  ): Promise<PaginatedResponseDto<DepartmentResponseDto>> {
    const {
      organizationId,
      search,
      isActive,
      page = 1,
      limit = 10,
    } = findAllDto;
    const skip = (page - 1) * limit;

    const where: Prisma.DepartmentWhereInput = {
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

    const [departments, total] = await Promise.all([
      this.prisma.department.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ order: "asc" }, { createdAt: "desc" }],
        include: {
          head: {
            select: {
              id: true,
              employeeId: true,
              firstName: true,
              middleName: true,
              lastName: true,
            },
          },
        },
      }),
      this.prisma.department.count({ where }),
    ]);

    return {
      data: plainToInstance(DepartmentResponseDto, departments),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Получить отделение по ID
   */
  async findOne(id: string): Promise<DepartmentResponseDto> {
    const department = await this.prisma.department.findFirst({
      where: { id },
      include: {
        head: {
          select: {
            id: true,
            employeeId: true,
            firstName: true,
            middleName: true,
            lastName: true,
          },
        },
      },
    });

    if (!department) {
      throw new NotFoundException("Отделение не найдено");
    }

    return plainToInstance(DepartmentResponseDto, department);
  }

  /**
   * Обновить отделение
   */
  async update(
    id: string,
    updateDepartmentDto: UpdateDepartmentDto,
  ): Promise<DepartmentResponseDto> {
    await this.findOne(id);

    try {
      const department = await this.prisma.department.update({
        where: { id },
        data: updateDepartmentDto,
        include: {
          head: {
            select: {
              id: true,
              employeeId: true,
              firstName: true,
              middleName: true,
              lastName: true,
            },
          },
        },
      });

      return plainToInstance(DepartmentResponseDto, department);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          const target = (error.meta?.target as string[]) || [];
          if (target.includes("name")) {
            throw new ConflictException(
              "Отделение с таким названием уже существует в организации",
            );
          }
          if (target.includes("code")) {
            throw new ConflictException(
              "Отделение с таким кодом уже существует в организации",
            );
          }
        }
      }
      throw error;
    }
  }

  /**
   * Удалить отделение
   */
  async remove(id: string): Promise<void> {
    await this.findOne(id);

    await this.prisma.department.delete({
      where: { id },
    });
  }

  /**
   * Изменить статус отделения
   */
  async toggleStatus(id: string): Promise<DepartmentResponseDto> {
    const existingDepartment = await this.findOne(id);

    const department = await this.prisma.department.update({
      where: { id },
      data: { isActive: !existingDepartment.isActive },
      include: {
        head: {
          select: {
            id: true,
            employeeId: true,
            firstName: true,
            middleName: true,
            lastName: true,
          },
        },
      },
    });

    return plainToInstance(DepartmentResponseDto, department);
  }
}
