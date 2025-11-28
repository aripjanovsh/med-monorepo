import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";
import {
  DEFAULT_PERMISSIONS,
  DEFAULT_ROLES,
  PERMISSIONS,
  PermissionName,
} from "../../common/constants/permissions.constants";

@Injectable()
export class PermissionService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get all available permissions from constants
   */
  getAvailablePermissions() {
    return DEFAULT_PERMISSIONS.map((p) => ({
      name: p.name,
      description: p.description,
    }));
  }

  /**
   * Get available permission names
   */
  getPermissionNames(): string[] {
    return Object.values(PERMISSIONS);
  }

  /**
   * Get default role configurations
   */
  getDefaultRoles() {
    return Object.entries(DEFAULT_ROLES).map(([key, config]) => ({
      key,
      name: config.name,
      description: config.description,
      isSystem: config.isSystem,
      permissions: config.permissions,
    }));
  }

  /**
   * Seed default roles for an organization
   */
  async seedDefaultRoles(organizationId: string) {
    const results: {
      role: string;
      created: boolean;
      permissionsAssigned: number;
    }[] = [];

    for (const [key, roleConfig] of Object.entries(DEFAULT_ROLES)) {
      // Check if role already exists
      const existingRole = await this.prisma.role.findFirst({
        where: {
          name: roleConfig.name,
          organizationId,
        },
      });

      if (existingRole) {
        results.push({
          role: roleConfig.name,
          created: false,
          permissionsAssigned: 0,
        });
        continue;
      }

      // Create role with permissions
      const role = await this.prisma.role.create({
        data: {
          name: roleConfig.name,
          description: roleConfig.description,
          isSystem: roleConfig.isSystem,
          organizationId,
          permissions: {
            create: roleConfig.permissions.map((permission) => ({
              permission,
            })),
          },
        },
      });

      results.push({
        role: roleConfig.name,
        created: true,
        permissionsAssigned: roleConfig.permissions.length,
      });
    }

    return {
      message: "Default roles seeded",
      results,
    };
  }

  /**
   * Validate that all permission names are valid
   */
  validatePermissions(permissions: string[]): {
    valid: boolean;
    invalid: string[];
  } {
    const validPermissions = new Set(Object.values(PERMISSIONS));
    const invalid = permissions.filter((p) => !validPermissions.has(p as PermissionName));
    return {
      valid: invalid.length === 0,
      invalid,
    };
  }
}
