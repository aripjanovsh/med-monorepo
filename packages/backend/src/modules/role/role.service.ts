import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../../common/prisma/prisma.service";
import { CreateRoleDto } from "./dto/create-role.dto";
import { UpdateRoleDto } from "./dto/update-role.dto";
import { AssignRoleDto } from "./dto/assign-role.dto";
import { FindAllRoleDto } from "./dto/find-all-role.dto";
import { PaginatedResponseDto } from "../../common/dto/pagination.dto";
import { CurrentUserData } from "../../common/decorators/current-user.decorator";
import { plainToInstance } from "class-transformer";
import { RoleResponseDto } from "./dto/role-response.dto";
import { PERMISSIONS } from "../../common/constants/permissions.constants";

@Injectable()
export class RoleService {
  constructor(private readonly prisma: PrismaService) {}

  private validatePermissions(permissions: string[]): void {
    const validPermissions = new Set(Object.values(PERMISSIONS));
    const invalid = permissions.filter((p) => !validPermissions.has(p as any));
    if (invalid.length > 0) {
      throw new BadRequestException(`Invalid permissions: ${invalid.join(", ")}`);
    }
  }

  async create(createRoleDto: CreateRoleDto, currentUser: CurrentUserData) {
    try {
      const { permissions, ...roleData } = createRoleDto;

      // Validate permissions if provided
      if (permissions && permissions.length > 0) {
        this.validatePermissions(permissions);
      }

      const role = await this.prisma.role.create({
        data: {
          ...roleData,
          organizationId: currentUser.organizationId,
          permissions: permissions && permissions.length > 0
            ? {
                create: permissions.map((permission) => ({
                  permission,
                })),
              }
            : undefined,
        },
        include: {
          permissions: true,
          organization: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      });

      return role;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          throw new ConflictException(
            "Role with this name already exists in this organization",
          );
        }
      }
      throw error;
    }
  }

  async findAll(
    query: FindAllRoleDto,
    currentUser: CurrentUserData,
  ): Promise<PaginatedResponseDto<RoleResponseDto>> {
    const {
      page,
      limit,
      search,
      sortBy,
      sortOrder,
      includeInactive,
      isSystem,
    } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    // Super admin can see all roles, otherwise filter by organization
    if (!currentUser.isSuperAdmin) {
      if (currentUser.organizationId) {
        where.organizationId = currentUser.organizationId;
      }
    }

    if (!includeInactive) {
      where.isActive = true;
    }

    if (typeof isSystem === "boolean") {
      where.isSystem = isSystem;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const orderBy: any = {};
    if (sortBy) {
      orderBy[sortBy] = sortOrder;
    } else {
      orderBy.createdAt = "desc";
    }

    const [roles, total] = await Promise.all([
      this.prisma.role.findMany({
        where,
        include: {
          permissions: true,
          organization: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          _count: {
            select: {
              userAssignments: true,
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.role.count({ where }),
    ]);

    return {
      data: plainToInstance(RoleResponseDto, roles),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string) {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: {
        permissions: true,
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        userAssignments: {
          include: {
            user: {
              select: {
                id: true,
                phone: true,
              },
            },
          },
        },
        _count: {
          select: {
            userAssignments: true,
          },
        },
      },
    });

    if (!role) {
      throw new NotFoundException("Role not found");
    }

    return role;
  }

  async update(id: string, updateRoleDto: UpdateRoleDto) {
    try {
      const { permissions, ...roleData } = updateRoleDto;

      // Check if role exists and is not system role if trying to modify system properties
      const existingRole = await this.prisma.role.findUnique({
        where: { id },
      });

      if (!existingRole) {
        throw new NotFoundException("Role not found");
      }

      if (
        existingRole.isSystem &&
        (roleData.isSystem === false || roleData.name)
      ) {
        throw new ForbiddenException("Cannot modify system role properties");
      }

      // Validate permissions if provided
      if (permissions !== undefined && permissions.length > 0) {
        this.validatePermissions(permissions);
      }

      // Update role data
      await this.prisma.role.update({
        where: { id },
        data: roleData,
      });

      // Update permissions if provided
      if (permissions !== undefined) {
        // Remove existing permissions
        await this.prisma.rolePermission.deleteMany({
          where: { roleId: id },
        });

        // Add new permissions
        if (permissions.length > 0) {
          await this.prisma.rolePermission.createMany({
            data: permissions.map((permission) => ({
              roleId: id,
              permission,
            })),
            skipDuplicates: true,
          });
        }
      }

      return this.findById(id);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          throw new NotFoundException("Role not found");
        }
        if (error.code === "P2002") {
          throw new ConflictException(
            "Role with this name already exists in this organization",
          );
        }
      }
      throw error;
    }
  }

  async remove(id: string) {
    try {
      const role = await this.prisma.role.findUnique({
        where: { id },
      });

      if (!role) {
        throw new NotFoundException("Role not found");
      }

      if (role.isSystem) {
        throw new ForbiddenException("Cannot delete system role");
      }

      await this.prisma.role.delete({
        where: { id },
      });

      return { message: "Role deleted successfully" };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          throw new NotFoundException("Role not found");
        }
      }
      throw error;
    }
  }

  async assignUserRole(assignRoleDto: AssignRoleDto) {
    try {
      const data: any = {
        userId: assignRoleDto.userId,
        roleId: assignRoleDto.roleId,
        assignedBy: assignRoleDto.assignedBy,
      };

      if (assignRoleDto.expiresAt) {
        data.expiresAt = new Date(assignRoleDto.expiresAt);
      }

      const assignment = await this.prisma.userRole_Assignment.create({
        data,
        include: {
          user: {
            select: {
              id: true,
              phone: true,
            },
          },
          role: {
            select: {
              id: true,
              name: true,
              description: true,
            },
          },
        },
      });

      return assignment;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          throw new ConflictException("User already has this role assigned");
        }
      }
      throw error;
    }
  }

  async removeUserRole(userId: string, roleId: string) {
    try {
      await this.prisma.userRole_Assignment.delete({
        where: {
          userId_roleId: {
            userId,
            roleId,
          },
        },
      });

      return { message: "Role removed from user successfully" };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          throw new NotFoundException("Role assignment not found");
        }
      }
      throw error;
    }
  }

  async getUserRoles(userId: string) {
    return this.prisma.userRole_Assignment.findMany({
      where: { userId },
      include: {
        role: {
          include: {
            permissions: true,
          },
        },
      },
    });
  }

  async getUserPermissions(userId: string): Promise<string[]> {
    const roleAssignments = await this.getUserRoles(userId);

    const permissions = new Set<string>();

    roleAssignments.forEach((assignment) => {
      assignment.role.permissions.forEach((rolePermission) => {
        permissions.add(rolePermission.permission);
      });
    });

    return Array.from(permissions);
  }

  async checkUserPermission(
    userId: string,
    permission: string,
  ): Promise<boolean> {
    const permissions = await this.getUserPermissions(userId);
    return permissions.includes(permission);
  }
}
