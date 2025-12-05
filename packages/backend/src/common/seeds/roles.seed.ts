import { PrismaClient } from "@prisma/client";
import {
  DEFAULT_ROLES,
  DEFAULT_PERMISSIONS,
  type DefaultRoleName,
} from "../constants/permissions.constants";

type SeedResult = {
  role: string;
  action: "created" | "updated" | "skipped";
  permissionsCount: number;
};

export class RolesSeed {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * Seeds all default roles for an organization
   * Creates new roles or updates existing ones with current permissions
   */
  async seedDefaultRoles(
    organizationId: string,
    options: { updateExisting?: boolean } = {}
  ) {
    const { updateExisting = false } = options;
    const results: SeedResult[] = [];

    for (const [key, roleConfig] of Object.entries(DEFAULT_ROLES)) {
      const existingRole = await this.prisma.role.findFirst({
        where: {
          name: roleConfig.name,
          organizationId,
        },
        include: {
          permissions: true,
        },
      });

      if (existingRole) {
        if (updateExisting) {
          // Update existing role with new permissions
          await this.updateRolePermissions(
            existingRole.id,
            roleConfig.permissions
          );
          results.push({
            role: roleConfig.name,
            action: "updated",
            permissionsCount: roleConfig.permissions.length,
          });
        } else {
          results.push({
            role: roleConfig.name,
            action: "skipped",
            permissionsCount: existingRole.permissions.length,
          });
        }
        continue;
      }

      // Create new role with permissions
      await this.prisma.role.create({
        data: {
          name: roleConfig.name,
          description: roleConfig.description,
          isSystem: roleConfig.isSystem,
          isActive: true,
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
        action: "created",
        permissionsCount: roleConfig.permissions.length,
      });
    }

    return {
      message: "Default roles seeded",
      organizationId,
      results,
      summary: {
        created: results.filter((r) => r.action === "created").length,
        updated: results.filter((r) => r.action === "updated").length,
        skipped: results.filter((r) => r.action === "skipped").length,
      },
    };
  }

  /**
   * Updates permissions for a specific role
   * Removes old permissions and adds new ones
   */
  private async updateRolePermissions(roleId: string, permissions: string[]) {
    // Delete all existing permissions
    await this.prisma.rolePermission.deleteMany({
      where: { roleId },
    });

    // Create new permissions
    await this.prisma.rolePermission.createMany({
      data: permissions.map((permission) => ({
        roleId,
        permission,
      })),
    });
  }

  /**
   * Seeds a specific role by key
   */
  async seedRole(organizationId: string, roleKey: DefaultRoleName) {
    const roleConfig = DEFAULT_ROLES[roleKey];
    if (!roleConfig) {
      throw new Error(`Role ${roleKey} not found in DEFAULT_ROLES`);
    }

    const existingRole = await this.prisma.role.findFirst({
      where: {
        name: roleConfig.name,
        organizationId,
      },
    });

    if (existingRole) {
      await this.updateRolePermissions(existingRole.id, roleConfig.permissions);
      return {
        role: roleConfig.name,
        action: "updated" as const,
        permissionsCount: roleConfig.permissions.length,
      };
    }

    await this.prisma.role.create({
      data: {
        name: roleConfig.name,
        description: roleConfig.description,
        isSystem: roleConfig.isSystem,
        isActive: true,
        organizationId,
        permissions: {
          create: roleConfig.permissions.map((permission) => ({
            permission,
          })),
        },
      },
    });

    return {
      role: roleConfig.name,
      action: "created" as const,
      permissionsCount: roleConfig.permissions.length,
    };
  }

  /**
   * Seeds roles for all organizations
   */
  async seedRolesForAllOrganizations(
    options: { updateExisting?: boolean } = {}
  ) {
    const organizations = await this.prisma.organization.findMany({
      select: { id: true, name: true },
    });

    const results = [];
    for (const org of organizations) {
      const result = await this.seedDefaultRoles(org.id, options);
      results.push({
        organization: org.name,
        ...result,
      });
    }

    return {
      message: "Roles seeded for all organizations",
      totalOrganizations: organizations.length,
      results,
    };
  }

  /**
   * Gets all available permissions for display
   */
  getAllPermissions() {
    return DEFAULT_PERMISSIONS;
  }

  /**
   * Gets all default role configurations
   */
  getDefaultRoles() {
    return DEFAULT_ROLES;
  }
}
