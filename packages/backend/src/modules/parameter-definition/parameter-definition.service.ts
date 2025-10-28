import { Injectable, NotFoundException, ConflictException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "@/common/prisma/prisma.service";
import { CreateParameterDefinitionDto } from "./dto/create-parameter-definition.dto";
import { UpdateParameterDefinitionDto } from "./dto/update-parameter-definition.dto";
import { FindAllParameterDefinitionDto } from "./dto/find-all-parameter-definition.dto";
import { PaginatedResponseDto } from "@/common/dto/pagination.dto";
import { ParameterDefinitionResponseDto } from "./dto/parameter-definition-response.dto";
import { plainToInstance } from "class-transformer";

@Injectable()
export class ParameterDefinitionService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateParameterDefinitionDto): Promise<ParameterDefinitionResponseDto> {
    const { organizationId, code, ...data } = dto;

    // Check for duplicate code within organization
    const existing = await this.prisma.parameterDefinition.findUnique({
      where: { code_organizationId: { code, organizationId } },
    });

    if (existing) {
      throw new ConflictException(`Parameter definition with code ${code} already exists`);
    }

    const created = await this.prisma.parameterDefinition.create({
      data: {
        ...data,
        code,
        organizationId,
      },
    });

    return plainToInstance(ParameterDefinitionResponseDto, created);
  }

  async findAll(query: FindAllParameterDefinitionDto, organizationId: string): Promise<PaginatedResponseDto<ParameterDefinitionResponseDto>> {
    const { page = 1, limit = 10, sortBy, sortOrder, category, isActive, search } = query;

    const skip = (page - 1) * limit;

    const where: Prisma.ParameterDefinitionWhereInput = {
      organizationId,
    };

    if (category) {
      where.category = category;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
      ];
    }

    const orderBy: Prisma.ParameterDefinitionOrderByWithRelationInput = sortBy
      ? { [sortBy]: sortOrder }
      : { createdAt: "desc" };

    const [data, total] = await Promise.all([
      this.prisma.parameterDefinition.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.parameterDefinition.count({ where }),
    ]);

    return {
      data: plainToInstance(ParameterDefinitionResponseDto, data),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, organizationId: string): Promise<ParameterDefinitionResponseDto> {
    const definition = await this.prisma.parameterDefinition.findUnique({
      where: { id },
    });

    if (!definition || definition.organizationId !== organizationId) {
      throw new NotFoundException(`Parameter definition with ID ${id} not found`);
    }

    return plainToInstance(ParameterDefinitionResponseDto, definition);
  }

  async findByCode(code: string, organizationId: string): Promise<ParameterDefinitionResponseDto | null> {
    const definition = await this.prisma.parameterDefinition.findUnique({
      where: { code_organizationId: { code, organizationId } },
    });

    if (!definition) {
      return null;
    }

    return plainToInstance(ParameterDefinitionResponseDto, definition);
  }

  async update(id: string, dto: UpdateParameterDefinitionDto, organizationId: string): Promise<ParameterDefinitionResponseDto> {
    const definition = await this.prisma.parameterDefinition.findUnique({
      where: { id },
    });

    if (!definition || definition.organizationId !== organizationId) {
      throw new NotFoundException(`Parameter definition with ID ${id} not found`);
    }

    const updated = await this.prisma.parameterDefinition.update({
      where: { id },
      data: dto,
    });

    return plainToInstance(ParameterDefinitionResponseDto, updated);
  }

  async remove(id: string, organizationId: string): Promise<void> {
    const definition = await this.prisma.parameterDefinition.findUnique({
      where: { id },
    });

    if (!definition || definition.organizationId !== organizationId) {
      throw new NotFoundException(`Parameter definition with ID ${id} not found`);
    }

    await this.prisma.parameterDefinition.delete({
      where: { id },
    });
  }
}
