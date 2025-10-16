import {
  Injectable,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { PrismaService } from "../../../common/prisma/prisma.service";
import { CreateLanguageDto } from "./dto/create-language.dto";
import { UpdateLanguageDto } from "./dto/update-language.dto";
import { FindAllLanguagesDto } from "./dto/find-all-languages.dto";
import { LanguageResponseDto } from "./dto/language-response.dto";
import { Prisma } from "@prisma/client";
import { plainToInstance } from "class-transformer";
import { PaginatedResponseDto } from "@/common/dto/pagination.dto";

@Injectable()
export class LanguageService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Создать новый язык
   */
  async create(
    createLanguageDto: CreateLanguageDto
  ): Promise<LanguageResponseDto> {
    try {
      const language = await this.prisma.language.create({
        data: {
          ...createLanguageDto,
        },
      });

      return plainToInstance(LanguageResponseDto, language);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          throw new ConflictException(
            "Язык с таким названием или кодом уже существует"
          );
        }
      }
      throw error;
    }
  }

  /**
   * Получить все языки с фильтрацией и пагинацией
   */
  async findAll(
    findAllDto: FindAllLanguagesDto
  ): Promise<PaginatedResponseDto<LanguageResponseDto>> {
    const { search, isActive, page = 1, limit = 10 } = findAllDto;
    const skip = (page - 1) * limit;

    const where: Prisma.LanguageWhereInput = {
      ...(isActive !== undefined && { isActive }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { nativeName: { contains: search, mode: "insensitive" } },
          { code: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ],
      }),
    };

    const [languages, total] = await Promise.all([
      this.prisma.language.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ weight: "asc" }],
      }),
      this.prisma.language.count({ where }),
    ]);

    return {
      data: plainToInstance(LanguageResponseDto, languages),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Получить язык по ID
   */
  async findOne(id: string): Promise<LanguageResponseDto> {
    const language = await this.prisma.language.findFirst({
      where: { id },
    });

    if (!language) {
      throw new NotFoundException("Язык не найден");
    }

    return plainToInstance(LanguageResponseDto, language);
  }

  /**
   * Обновить язык
   */
  async update(
    id: string,
    updateLanguageDto: UpdateLanguageDto
  ): Promise<LanguageResponseDto> {
    await this.findOne(id);

    try {
      const language = await this.prisma.language.update({
        where: { id },
        data: updateLanguageDto,
      });

      return plainToInstance(LanguageResponseDto, language);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          throw new ConflictException(
            "Язык с таким названием или кодом уже существует"
          );
        }
      }
      throw error;
    }
  }

  /**
   * Удалить язык
   */
  async remove(id: string): Promise<void> {
    await this.findOne(id);

    await this.prisma.language.delete({
      where: { id },
    });
  }

  /**
   * Изменить статус языка
   */
  async toggleStatus(id: string): Promise<LanguageResponseDto> {
    const existingLanguage = await this.findOne(id);

    const language = await this.prisma.language.update({
      where: { id },
      data: { isActive: !existingLanguage.isActive },
    });

    return plainToInstance(LanguageResponseDto, language);
  }
}
