import {
  Injectable,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../../common/prisma/prisma.service";
import { CreateOrganizationDto } from "./dto/create-organization.dto";
import { UpdateOrganizationDto } from "./dto/update-organization.dto";
import { FindAllOrganizationDto } from "./dto/find-all-organization.dto";
import { PaginatedResponseDto } from "../../common/dto/pagination.dto";
import { OrganizationResponseDto } from "./dto/organization-response.dto";
import {
  transformToDto,
  createPaginatedResponse,
} from "../../common/utils/transform.util";
import { CurrentUserData } from "../../common/decorators/current-user.decorator";
import { plainToInstance } from "class-transformer";

@Injectable()
export class OrganizationService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    createOrganizationDto: CreateOrganizationDto,
  ): Promise<OrganizationResponseDto> {
    try {
      // Generate slug from name if not provided
      const slug =
        createOrganizationDto.slug ||
        this.generateSlug(createOrganizationDto.name);

      const organizationData = {
        ...createOrganizationDto,
        slug,
      };

      const organization = await this.prisma.organization.create({
        data: organizationData,
        include: {
          _count: {
            select: {
              users: true,
              employees: true,
              patients: true,
              appointments: true,
            },
          },
        },
      });

      return transformToDto(
        OrganizationResponseDto,
        organization,
      ) as OrganizationResponseDto;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          throw new ConflictException(
            "Organization with this slug already exists",
          );
        }
      }
      throw error;
    }
  }

  async findAll(
    query: FindAllOrganizationDto,
    currentUser: CurrentUserData,
  ): Promise<PaginatedResponseDto<OrganizationResponseDto>> {
    const { page, limit, search, sortBy, sortOrder, isActive } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    // Regular users can only see their own organization unless they're super admin
    if (!currentUser.isSuperAdmin && currentUser.organizationId) {
      where.id = currentUser.organizationId;
    }

    if (typeof isActive === "boolean") {
      where.isActive = isActive;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { slug: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    const orderBy: any = {};
    if (sortBy) {
      orderBy[sortBy] = sortOrder;
    } else {
      orderBy.createdAt = "desc";
    }

    const [organizations, total] = await Promise.all([
      this.prisma.organization.findMany({
        where,
        include: {
          _count: {
            select: {
              users: true,
              employees: true,
              patients: true,
              appointments: true,
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.organization.count({ where }),
    ]);

    return {
      data: plainToInstance(OrganizationResponseDto, organizations),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string): Promise<OrganizationResponseDto> {
    const organization = await this.prisma.organization.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            users: true,
            employees: true,
            patients: true,
            appointments: true,
            departments: true,
            services: true,
          },
        },
      },
    });

    if (!organization) {
      throw new NotFoundException("Organization not found");
    }

    return transformToDto(
      OrganizationResponseDto,
      organization,
    ) as OrganizationResponseDto;
  }

  async findBySlug(slug: string): Promise<OrganizationResponseDto> {
    const organization = await this.prisma.organization.findUnique({
      where: { slug },
      include: {
        _count: {
          select: {
            users: true,
            employees: true,
            patients: true,
          },
        },
      },
    });

    if (!organization) {
      throw new NotFoundException("Organization not found");
    }

    return transformToDto(
      OrganizationResponseDto,
      organization,
    ) as OrganizationResponseDto;
  }

  async update(
    id: string,
    updateOrganizationDto: UpdateOrganizationDto,
  ): Promise<OrganizationResponseDto> {
    try {
      const organization = await this.prisma.organization.update({
        where: { id },
        data: updateOrganizationDto,
        include: {
          _count: {
            select: {
              users: true,
              employees: true,
              patients: true,
            },
          },
        },
      });

      return transformToDto(
        OrganizationResponseDto,
        organization,
      ) as OrganizationResponseDto;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          throw new NotFoundException("Organization not found");
        }
        if (error.code === "P2002") {
          throw new ConflictException(
            "Organization with this slug already exists",
          );
        }
      }
      throw error;
    }
  }

  async remove(id: string) {
    try {
      await this.prisma.organization.delete({
        where: { id },
      });
      return { message: "Organization deleted successfully" };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          throw new NotFoundException("Organization not found");
        }
      }
      throw error;
    }
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  }
}
