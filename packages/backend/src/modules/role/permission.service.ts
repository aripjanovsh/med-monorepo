import {
  Injectable,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { Prisma, PermissionAction } from "@prisma/client";
import { PrismaService } from "../../common/prisma/prisma.service";
import { CreatePermissionDto } from "./dto/create-permission.dto";
import { FindAllPermissionDto } from "./dto/find-all-permission.dto";
import { PaginatedResponseDto } from "../../common/dto/pagination.dto";
import {
  transformToDto,
  createPaginatedResponse,
} from "../../common/utils/transform.util";
import { CurrentUserData } from "../../common/decorators/current-user.decorator";

@Injectable()
export class PermissionService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createPermissionDto: CreatePermissionDto) {
    try {
      return await this.prisma.permission.create({
        data: createPermissionDto,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          throw new ConflictException(
            "Permission with this name or resource/action combination already exists",
          );
        }
      }
      throw error;
    }
  }

  async findAll(
    query: FindAllPermissionDto,
    currentUser: CurrentUserData,
  ): Promise<PaginatedResponseDto<any>> {
    const { page, limit, search, sortBy, sortOrder, resource, action } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (resource) {
      where.resource = resource;
    }

    if (action) {
      where.action = action;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { resource: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const orderBy: any = {};
    if (sortBy) {
      orderBy[sortBy] = sortOrder;
    } else {
      orderBy.resource = "asc";
    }

    const [permissions, total] = await Promise.all([
      this.prisma.permission.findMany({
        where,
        include: {
          rolePermissions: {
            include: {
              role: {
                select: {
                  id: true,
                  name: true,
                  organizationId: true,
                },
              },
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.permission.count({ where }),
    ]);

    return {
      data: permissions,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string) {
    const permission = await this.prisma.permission.findUnique({
      where: { id },
      include: {
        rolePermissions: {
          include: {
            role: {
              select: {
                id: true,
                name: true,
                description: true,
                organizationId: true,
              },
            },
          },
        },
      },
    });

    if (!permission) {
      throw new NotFoundException("Permission not found");
    }

    return permission;
  }

  async update(id: string, updateData: Partial<CreatePermissionDto>) {
    try {
      return await this.prisma.permission.update({
        where: { id },
        data: updateData,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          throw new NotFoundException("Permission not found");
        }
        if (error.code === "P2002") {
          throw new ConflictException(
            "Permission with this name or resource/action combination already exists",
          );
        }
      }
      throw error;
    }
  }

  async remove(id: string) {
    try {
      await this.prisma.permission.delete({
        where: { id },
      });
      return { message: "Permission deleted successfully" };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          throw new NotFoundException("Permission not found");
        }
      }
      throw error;
    }
  }

  async getResourceList() {
    const permissions = await this.prisma.permission.findMany({
      select: {
        resource: true,
      },
      distinct: ["resource"],
      orderBy: {
        resource: "asc",
      },
    });

    return permissions.map((p) => p.resource);
  }

  async getPermissionsByResource() {
    // Get all permissions directly from database instead of using findAll()
    // since we don't need pagination or user context here
    const permissions = await this.prisma.permission.findMany({
      include: {
        rolePermissions: {
          include: {
            role: {
              select: {
                id: true,
                name: true,
                organizationId: true,
              },
            },
          },
        },
      },
      orderBy: {
        resource: "asc",
      },
    });

    const grouped = permissions.reduce(
      (acc, permission) => {
        if (!acc[permission.resource]) {
          acc[permission.resource] = [];
        }
        acc[permission.resource].push(permission);
        return acc;
      },
      {} as Record<string, typeof permissions>,
    );

    return grouped;
  }

  async seedDefaultPermissions() {
    const defaultPermissions = [
      // User management
      {
        name: "create_users",
        resource: "users",
        action: PermissionAction.CREATE,
        description: "Create new users",
      },
      {
        name: "read_users",
        resource: "users",
        action: PermissionAction.READ,
        description: "View user information",
      },
      {
        name: "update_users",
        resource: "users",
        action: PermissionAction.UPDATE,
        description: "Update user information",
      },
      {
        name: "delete_users",
        resource: "users",
        action: PermissionAction.DELETE,
        description: "Delete users",
      },
      {
        name: "manage_users",
        resource: "users",
        action: PermissionAction.MANAGE,
        description: "Full user management access",
      },

      // Patient management
      {
        name: "create_patients",
        resource: "patients",
        action: PermissionAction.CREATE,
        description: "Register new patients",
      },
      {
        name: "read_patients",
        resource: "patients",
        action: PermissionAction.READ,
        description: "View patient information",
      },
      {
        name: "update_patients",
        resource: "patients",
        action: PermissionAction.UPDATE,
        description: "Update patient information",
      },
      {
        name: "delete_patients",
        resource: "patients",
        action: PermissionAction.DELETE,
        description: "Delete patient records",
      },
      {
        name: "manage_patients",
        resource: "patients",
        action: PermissionAction.MANAGE,
        description: "Full patient management access",
      },

      // Doctor management
      {
        name: "create_doctors",
        resource: "doctors",
        action: PermissionAction.CREATE,
        description: "Add new doctors",
      },
      {
        name: "read_doctors",
        resource: "doctors",
        action: PermissionAction.READ,
        description: "View doctor information",
      },
      {
        name: "update_doctors",
        resource: "doctors",
        action: PermissionAction.UPDATE,
        description: "Update doctor information",
      },
      {
        name: "delete_doctors",
        resource: "doctors",
        action: PermissionAction.DELETE,
        description: "Remove doctors",
      },
      {
        name: "manage_doctors",
        resource: "doctors",
        action: PermissionAction.MANAGE,
        description: "Full doctor management access",
      },

      // Appointment management
      {
        name: "create_appointments",
        resource: "appointments",
        action: PermissionAction.CREATE,
        description: "Schedule appointments",
      },
      {
        name: "read_appointments",
        resource: "appointments",
        action: PermissionAction.READ,
        description: "View appointments",
      },
      {
        name: "update_appointments",
        resource: "appointments",
        action: PermissionAction.UPDATE,
        description: "Modify appointments",
      },
      {
        name: "delete_appointments",
        resource: "appointments",
        action: PermissionAction.DELETE,
        description: "Cancel appointments",
      },
      {
        name: "manage_appointments",
        resource: "appointments",
        action: PermissionAction.MANAGE,
        description: "Full appointment management access",
      },

      // Medical records
      {
        name: "create_medical_records",
        resource: "medical_records",
        action: PermissionAction.CREATE,
        description: "Create medical records",
      },
      {
        name: "read_medical_records",
        resource: "medical_records",
        action: PermissionAction.READ,
        description: "View medical records",
      },
      {
        name: "update_medical_records",
        resource: "medical_records",
        action: PermissionAction.UPDATE,
        description: "Update medical records",
      },
      {
        name: "delete_medical_records",
        resource: "medical_records",
        action: PermissionAction.DELETE,
        description: "Delete medical records",
      },
      {
        name: "manage_medical_records",
        resource: "medical_records",
        action: PermissionAction.MANAGE,
        description: "Full medical records access",
      },

      // Employee management
      {
        name: "create_employees",
        resource: "employees",
        action: PermissionAction.CREATE,
        description: "Add new employees",
      },
      {
        name: "read_employees",
        resource: "employees",
        action: PermissionAction.READ,
        description: "View employee information",
      },
      {
        name: "update_employees",
        resource: "employees",
        action: PermissionAction.UPDATE,
        description: "Update employee information",
      },
      {
        name: "delete_employees",
        resource: "employees",
        action: PermissionAction.DELETE,
        description: "Remove employees",
      },
      {
        name: "manage_employees",
        resource: "employees",
        action: PermissionAction.MANAGE,
        description: "Full employee management access",
      },

      // Organization management
      {
        name: "read_organization",
        resource: "organization",
        action: PermissionAction.READ,
        description: "View organization information",
      },
      {
        name: "update_organization",
        resource: "organization",
        action: PermissionAction.UPDATE,
        description: "Update organization settings",
      },
      {
        name: "manage_organization",
        resource: "organization",
        action: PermissionAction.MANAGE,
        description: "Full organization management access",
      },

      // Role and permission management
      {
        name: "create_roles",
        resource: "roles",
        action: PermissionAction.CREATE,
        description: "Create new roles",
      },
      {
        name: "read_roles",
        resource: "roles",
        action: PermissionAction.READ,
        description: "View roles and permissions",
      },
      {
        name: "update_roles",
        resource: "roles",
        action: PermissionAction.UPDATE,
        description: "Update roles and permissions",
      },
      {
        name: "delete_roles",
        resource: "roles",
        action: PermissionAction.DELETE,
        description: "Delete roles",
      },
      {
        name: "manage_roles",
        resource: "roles",
        action: PermissionAction.MANAGE,
        description: "Full role management access",
      },
    ];

    const existingPermissions = await this.prisma.permission.findMany({
      select: { name: true },
    });
    const existingNames = new Set(existingPermissions.map((p) => p.name));

    const newPermissions = defaultPermissions.filter(
      (p) => !existingNames.has(p.name),
    );

    if (newPermissions.length > 0) {
      await this.prisma.permission.createMany({
        data: newPermissions,
        skipDuplicates: true,
      });
    }

    return {
      message: `Seeded ${newPermissions.length} new permissions`,
      total: defaultPermissions.length,
      created: newPermissions.length,
    };
  }
}
