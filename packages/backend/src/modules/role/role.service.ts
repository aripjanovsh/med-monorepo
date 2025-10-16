import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../../common/prisma/prisma.service";
import { CreateRoleDto } from "./dto/create-role.dto";
import { UpdateRoleDto } from "./dto/update-role.dto";
import { AssignRoleDto } from "./dto/assign-role.dto";
import { FindAllRoleDto } from "./dto/find-all-role.dto";
import { PaginatedResponseDto } from "../../common/dto/pagination.dto";
import {
  transformToDto,
  createPaginatedResponse,
} from "../../common/utils/transform.util";
import { CurrentUserData } from "../../common/decorators/current-user.decorator";
import { plainToInstance } from "class-transformer";
import { RoleResponseDto } from "./dto/role-response.dto";

@Injectable()
export class RoleService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createRoleDto: CreateRoleDto, currentUser: CurrentUserData) {
    try {
      const { permissionIds, ...roleData } = createRoleDto;

      const role = await this.prisma.role.create({
        data: {
          ...roleData,
          organizationId: currentUser.organizationId,
        },
        include: {
          permissions: {
            include: {
              permission: true,
            },
          },
          organization: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      });

      // Assign permissions if provided
      if (permissionIds && permissionIds.length > 0) {
        await this.assignPermissions(role.id, permissionIds);

        // Return role with permissions
        return this.findById(role.id);
      }

      return role;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          throw new ConflictException(
            "Role with this name already exists in this organization"
          );
        }
      }
      throw error;
    }
  }

  async findAll(
    query: FindAllRoleDto,
    currentUser: CurrentUserData
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
          permissions: {
            include: {
              permission: true,
            },
          },
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
        permissions: {
          include: {
            permission: true,
          },
        },
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
      const { permissionIds, ...roleData } = updateRoleDto;

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

      const role = await this.prisma.role.update({
        where: { id },
        data: roleData,
      });

      // Update permissions if provided
      if (permissionIds !== undefined) {
        // Remove existing permissions
        await this.prisma.rolePermission.deleteMany({
          where: { roleId: id },
        });

        // Add new permissions
        if (permissionIds.length > 0) {
          await this.assignPermissions(id, permissionIds);
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
            "Role with this name already exists in this organization"
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

  async assignPermissions(roleId: string, permissionIds: string[]) {
    const rolePermissions = permissionIds.map((permissionId) => ({
      roleId,
      permissionId,
    }));

    await this.prisma.rolePermission.createMany({
      data: rolePermissions,
      skipDuplicates: true,
    });

    return { message: "Permissions assigned successfully" };
  }

  async removePermissions(roleId: string, permissionIds: string[]) {
    await this.prisma.rolePermission.deleteMany({
      where: {
        roleId,
        permissionId: {
          in: permissionIds,
        },
      },
    });

    return { message: "Permissions removed successfully" };
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
            permissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });
  }

  async getUserPermissions(userId: string) {
    const roleAssignments = await this.getUserRoles(userId);

    const permissions = new Map();

    roleAssignments.forEach((assignment) => {
      assignment.role.permissions.forEach((rolePermission) => {
        const permission = rolePermission.permission;
        const key = `${permission.resource}:${permission.action}`;
        permissions.set(key, permission);
      });
    });

    return Array.from(permissions.values());
  }

  async checkUserPermission(
    userId: string,
    resource: string,
    action: string
  ): Promise<boolean> {
    const permissions = await this.getUserPermissions(userId);

    // Check for exact permission or MANAGE permission on the resource
    return permissions.some(
      (permission) =>
        permission.resource === resource &&
        (permission.action === action || permission.action === "MANAGE")
    );
  }
}
