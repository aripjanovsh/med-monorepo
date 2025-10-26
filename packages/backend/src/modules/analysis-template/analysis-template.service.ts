import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../../common/prisma/prisma.service";
import { CreateAnalysisTemplateDto } from "./dto/create-analysis-template.dto";
import { UpdateAnalysisTemplateDto } from "./dto/update-analysis-template.dto";
import { FindAllAnalysisTemplateDto } from "./dto/find-all-analysis-template.dto";
import { AnalysisTemplateResponseDto } from "./dto/analysis-template-response.dto";
import { PaginatedResponseDto } from "../../common/dto/pagination.dto";
import { plainToInstance } from "class-transformer";

@Injectable()
export class AnalysisTemplateService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    createDto: CreateAnalysisTemplateDto,
    userId: string,
  ): Promise<AnalysisTemplateResponseDto> {
    // Check if code already exists in organization
    const existing = await this.prisma.analysisTemplate.findFirst({
      where: {
        code: createDto.code,
        organizationId: createDto.organizationId,
      },
    });

    if (existing) {
      throw new ConflictException(
        `Analysis template with code '${createDto.code}' already exists in this organization`,
      );
    }

    // Validate parameters array
    if (!Array.isArray(createDto.parameters) || createDto.parameters.length === 0) {
      throw new BadRequestException(
        "At least one parameter is required for analysis template",
      );
    }

    const analysisTemplate = await this.prisma.analysisTemplate.create({
      data: {
        name: createDto.name,
        code: createDto.code,
        description: createDto.description,
        parameters: createDto.parameters as any,
        organizationId: createDto.organizationId,
        createdBy: userId,
      },
      include: {
        organization: true,
      },
    });

    return plainToInstance(AnalysisTemplateResponseDto, analysisTemplate);
  }

  async findAll(
    query: FindAllAnalysisTemplateDto,
  ): Promise<PaginatedResponseDto<AnalysisTemplateResponseDto>> {
    const { search, isActive, page, limit, sortBy, sortOrder, organizationId } =
      query;
    const skip = (page - 1) * limit;

    const where: Prisma.AnalysisTemplateWhereInput = {
      organizationId,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { code: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const orderBy: Prisma.AnalysisTemplateOrderByWithRelationInput = sortBy
      ? { [sortBy]: sortOrder }
      : { createdAt: "desc" };

    const [data, total] = await Promise.all([
      this.prisma.analysisTemplate.findMany({
        where,
        include: {
          organization: true,
        },
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.analysisTemplate.count({ where }),
    ]);

    return {
      data: plainToInstance(AnalysisTemplateResponseDto, data),
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
  ): Promise<AnalysisTemplateResponseDto> {
    const where: Prisma.AnalysisTemplateWhereInput = { id };
    if (organizationId) {
      where.organizationId = organizationId;
    }

    const analysisTemplate = await this.prisma.analysisTemplate.findFirst({
      where,
      include: {
        organization: true,
      },
    });

    if (!analysisTemplate) {
      throw new NotFoundException("Analysis template not found");
    }

    return plainToInstance(AnalysisTemplateResponseDto, analysisTemplate);
  }

  async update(
    id: string,
    updateDto: UpdateAnalysisTemplateDto,
    userId: string,
  ): Promise<AnalysisTemplateResponseDto> {
    // Check existence first
    const existing = await this.prisma.analysisTemplate.findFirst({
      where: {
        id,
        organizationId: updateDto.organizationId,
      },
    });

    if (!existing) {
      throw new NotFoundException("Analysis template not found");
    }

    // Check for code conflict if code is being updated
    if (updateDto.code && updateDto.code !== existing.code) {
      const codeExists = await this.prisma.analysisTemplate.findFirst({
        where: {
          code: updateDto.code,
          organizationId: updateDto.organizationId,
          id: { not: id },
        },
      });

      if (codeExists) {
        throw new ConflictException(
          `Analysis template with code '${updateDto.code}' already exists in this organization`,
        );
      }
    }

    // Validate parameters if provided
    if (updateDto.parameters) {
      if (!Array.isArray(updateDto.parameters) || updateDto.parameters.length === 0) {
        throw new BadRequestException(
          "At least one parameter is required for analysis template",
        );
      }
    }

    const { organizationId, ...updateData } = updateDto;

    const updated = await this.prisma.analysisTemplate.update({
      where: { id },
      data: {
        ...updateData,
        parameters: updateData.parameters as any,
        updatedBy: userId,
      },
      include: {
        organization: true,
      },
    });

    return plainToInstance(AnalysisTemplateResponseDto, updated);
  }

  async remove(
    id: string,
    organizationId?: string,
  ): Promise<{ message: string }> {
    try {
      const where: Prisma.AnalysisTemplateWhereInput = { id };
      if (organizationId) {
        where.organizationId = organizationId;
      }

      await this.prisma.analysisTemplate.deleteMany({ where });
      return { message: "Analysis template deleted successfully" };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          throw new NotFoundException("Analysis template not found");
        }
      }
      throw error;
    }
  }
}
