import {
  Injectable,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../../common/prisma/prisma.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { FindAllUserDto } from "./dto/find-all-user.dto";
import { PaginatedResponseDto } from "../../common/dto/pagination.dto";
import { UserResponseDto } from "./dto/user-response.dto";
import { transformToDto } from "../../common/utils/transform.util";
import { CurrentUserData } from "../../common/decorators/current-user.decorator";
import { plainToInstance } from "class-transformer";

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    try {
      const user = await this.prisma.user.create({
        data: createUserDto,
        include: {
          organization: {
            select: {
              id: true,
              name: true,
              slug: true,
              address: true,
              phone: true,
              email: true,
              website: true,
              description: true,
              isActive: true,
              createdAt: true,
              updatedAt: true,
            },
          },
          roleAssignments: {
            include: { role: true },
          },
        },
      });

      return transformToDto(UserResponseDto, user) as UserResponseDto;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          throw new ConflictException("User with this phone already exists");
        }
      }
      throw error;
    }
  }

  async findAll(
    query: FindAllUserDto,
    currentUser: CurrentUserData,
  ): Promise<PaginatedResponseDto<UserResponseDto>> {
    const { page, limit, search, sortBy, sortOrder, role, isActive } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    // Super admin can see all users, otherwise filter by organization
    if (!currentUser.isSuperAdmin) {
      if (currentUser.organizationId) {
        where.organizationId = currentUser.organizationId;
      }
    }

    if (role) {
      where.role = role;
    }

    if (typeof isActive === "boolean") {
      where.isActive = isActive;
    }

    if (search) {
      where.OR = [{ phone: { contains: search, mode: "insensitive" } }];
    }

    const orderBy: any = {};
    if (sortBy) {
      orderBy[sortBy] = sortOrder;
    } else {
      orderBy.createdAt = "desc";
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        include: {
          organization: {
            select: {
              id: true,
              name: true,
              slug: true,
              address: true,
              phone: true,
              email: true,
              website: true,
              description: true,
              isActive: true,
              createdAt: true,
              updatedAt: true,
            },
          },
          roleAssignments: {
            include: { role: true },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: plainToInstance(UserResponseDto, users),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        organization: true,
        roleAssignments: { include: { role: true } },
        employee: true,
      },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    return transformToDto(UserResponseDto, user) as UserResponseDto;
  }

  async findByPhone(phone: string) {
    return this.prisma.user.findUnique({
      where: { phone },
      include: {
        organization: true,
        roleAssignments: { include: { role: true } },
        employee: true,
      },
    });
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    try {
      const user = await this.prisma.user.update({
        where: { id },
        data: updateUserDto,
        include: {
          organization: {
            select: {
              id: true,
              name: true,
              slug: true,
              address: true,
              phone: true,
              email: true,
              website: true,
              description: true,
              isActive: true,
              createdAt: true,
              updatedAt: true,
            },
          },
          roleAssignments: { include: { role: true } },
        },
      });

      return transformToDto(UserResponseDto, user) as UserResponseDto;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          throw new NotFoundException("User not found");
        }
        if (error.code === "P2002") {
          throw new ConflictException("User with this phone already exists");
        }
      }
      throw error;
    }
  }

  async remove(id: string) {
    try {
      await this.prisma.user.delete({
        where: { id },
      });
      return { message: "User deleted successfully" };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          throw new NotFoundException("User not found");
        }
      }
      throw error;
    }
  }
}
