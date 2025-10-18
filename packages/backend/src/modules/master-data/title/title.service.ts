import {
  Injectable,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { PrismaService } from "../../../common/prisma/prisma.service";
import { CreateTitleDto } from "./dto/create-title.dto";
import { UpdateTitleDto } from "./dto/update-title.dto";
import { FindAllTitlesDto } from "./dto/find-all-titles.dto";
import { TitleResponseDto } from "./dto/title-response.dto";
import { Prisma } from "@prisma/client";
import { plainToInstance } from "class-transformer";
import { PaginatedResponseDto } from "@/common/dto/pagination.dto";

@Injectable()
export class TitleService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Создать новую должность сотрудника
   */
  async create(createTitleDto: CreateTitleDto): Promise<TitleResponseDto> {
    try {
      const title = await this.prisma.title.create({
        data: {
          ...createTitleDto,
        },
      });

      return plainToInstance(TitleResponseDto, title);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          throw new ConflictException(
            "Должность с таким названием уже существует в организации",
          );
        }
      }
      throw error;
    }
  }

  /**
   * Получить все должности с фильтрацией и пагинацией
   */
  async findAll(
    findAllDto: FindAllTitlesDto,
  ): Promise<PaginatedResponseDto<TitleResponseDto>> {
    const {
      organizationId,
      search,
      isActive,
      page = 1,
      limit = 10,
    } = findAllDto;
    const skip = (page - 1) * limit;

    const where: Prisma.TitleWhereInput = {
      organizationId,
      ...(isActive !== undefined && { isActive }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ],
      }),
    };

    const [titles, total] = await Promise.all([
      this.prisma.title.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.title.count({ where }),
    ]);

    return {
      data: plainToInstance(TitleResponseDto, titles),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Получить должность по ID
   */
  async findOne(id: string): Promise<TitleResponseDto> {
    const title = await this.prisma.title.findFirst({
      where: { id },
    });

    if (!title) {
      throw new NotFoundException("Должность не найдена");
    }

    return plainToInstance(TitleResponseDto, title);
  }

  /**
   * Обновить должность
   */
  async update(
    id: string,
    updateTitleDto: UpdateTitleDto,
  ): Promise<TitleResponseDto> {
    await this.findOne(id);

    try {
      const title = await this.prisma.title.update({
        where: { id },
        data: updateTitleDto,
      });

      return plainToInstance(TitleResponseDto, title);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          throw new ConflictException(
            "Должность с таким названием уже существует в организации",
          );
        }
      }
      throw error;
    }
  }

  /**
   * Удалить должность
   */
  async remove(id: string): Promise<void> {
    await this.findOne(id);

    await this.prisma.title.delete({
      where: { id },
    });
  }

  /**
   * Изменить статус должности
   */
  async toggleStatus(id: string): Promise<TitleResponseDto> {
    const existingTitle = await this.findOne(id);

    const title = await this.prisma.title.update({
      where: { id },
      data: { isActive: !existingTitle.isActive },
    });

    return plainToInstance(TitleResponseDto, title);
  }
}
