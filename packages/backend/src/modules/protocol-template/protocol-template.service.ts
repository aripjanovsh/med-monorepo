import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../../common/prisma/prisma.service";
import { CreateProtocolTemplateDto } from "./dto/create-protocol-template.dto";
import { UpdateProtocolTemplateDto } from "./dto/update-protocol-template.dto";
import { FindAllProtocolTemplateDto } from "./dto/find-all-protocol-template.dto";
import { ProtocolTemplateResponseDto } from "./dto/protocol-template-response.dto";
import { PaginatedResponseDto } from "../../common/dto/pagination.dto";
import { plainToInstance } from "class-transformer";

@Injectable()
export class ProtocolTemplateService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    createDto: CreateProtocolTemplateDto,
    userId: string,
  ): Promise<ProtocolTemplateResponseDto> {
    // Validate JSON content
    try {
      JSON.parse(createDto.content);
    } catch {
      throw new BadRequestException("Invalid JSON content");
    }

    const protocolTemplate = await this.prisma.protocolTemplate.create({
      data: {
        name: createDto.name,
        description: createDto.description,
        content: createDto.content,
        organizationId: createDto.organizationId,
        createdBy: userId,
      },
      include: {
        organization: true,
      },
    });

    return plainToInstance(ProtocolTemplateResponseDto, protocolTemplate);
  }

  async findAll(
    query: FindAllProtocolTemplateDto,
  ): Promise<PaginatedResponseDto<ProtocolTemplateResponseDto>> {
    const { search, isActive, page, limit, sortBy, sortOrder, organizationId } =
      query;
    const skip = (page - 1) * limit;

    const where: Prisma.ProtocolTemplateWhereInput = {
      organizationId,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const orderBy: Prisma.ProtocolTemplateOrderByWithRelationInput = sortBy
      ? { [sortBy]: sortOrder }
      : { createdAt: "desc" };

    const [data, total] = await Promise.all([
      this.prisma.protocolTemplate.findMany({
        where,
        include: {
          organization: true,
        },
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.protocolTemplate.count({ where }),
    ]);

    return {
      data: plainToInstance(ProtocolTemplateResponseDto, data),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(
    id: string,
    organizationId?: string,
  ): Promise<ProtocolTemplateResponseDto> {
    const where: Prisma.ProtocolTemplateWhereUniqueInput = { id };
    if (organizationId) {
      where.organizationId = organizationId;
    }

    const protocolTemplate = await this.prisma.protocolTemplate.findUnique({
      where,
      include: {
        organization: true,
      },
    });

    if (!protocolTemplate) {
      throw new NotFoundException("Protocol template not found");
    }

    return plainToInstance(ProtocolTemplateResponseDto, protocolTemplate);
  }

  async update(
    id: string,
    updateDto: UpdateProtocolTemplateDto,
    userId: string,
  ): Promise<ProtocolTemplateResponseDto> {
    // Check existence first
    const existing = await this.prisma.protocolTemplate.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException("Protocol template not found");
    }

    // Validate JSON content if provided
    if (updateDto.content) {
      try {
        JSON.parse(updateDto.content);
      } catch {
        throw new BadRequestException("Invalid JSON content");
      }
    }

    const where: Prisma.ProtocolTemplateWhereUniqueInput = {
      id,
      organizationId: updateDto.organizationId,
    };

    const { organizationId, ...updateData } = updateDto;

    const updated = await this.prisma.protocolTemplate.update({
      where,
      data: {
        ...updateData,
        updatedBy: userId,
      },
      include: {
        organization: true,
      },
    });

    return plainToInstance(ProtocolTemplateResponseDto, updated);
  }

  async remove(
    id: string,
    organizationId?: string,
  ): Promise<{ message: string }> {
    try {
      const where: Prisma.ProtocolTemplateWhereUniqueInput = { id };
      if (organizationId) {
        where.organizationId = organizationId;
      }

      await this.prisma.protocolTemplate.delete({ where });
      return { message: "Protocol template deleted successfully" };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          throw new NotFoundException("Protocol template not found");
        }
      }
      throw error;
    }
  }
}
