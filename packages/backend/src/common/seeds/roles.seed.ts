import { PrismaClient } from "@prisma/client";
import { DEFAULT_ROLES } from "../constants/permissions.constants";

export class RolesSeed {
  constructor(private readonly prisma: PrismaClient) {}

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
        created: true,
        permissionsAssigned: roleConfig.permissions.length,
      });
    }

    return {
      message: "Default roles seeded",
      results,
    };
  }
}
