import { PrismaService } from "../prisma/prisma.service";
import { PermissionAction } from "@prisma/client";

export class RolesSeed {
  constructor(private readonly prisma: PrismaService) {}

  async seedDefaultRoles(organizationId: string) {
    // First, ensure all permissions exist
    await this.seedDefaultPermissions();

    const defaultRoles = [
      {
        name: "Administrator",
        description: "Full system administrator with all permissions",
        isSystem: true,
        permissions: [
          "manage_users",
          "manage_employees",
          "manage_doctors",
          "manage_patients",
          "manage_appointments",
          "manage_medical_records",
          "manage_organization",
          "manage_roles",
        ],
      },
      {
        name: "Doctor",
        description: "Medical doctor with patient care permissions",
        isSystem: true,
        permissions: [
          "read_patients",
          "update_patients",
          "create_appointments",
          "read_appointments",
          "update_appointments",
          "create_medical_records",
          "read_medical_records",
          "update_medical_records",
        ],
      },
      {
        name: "Nurse",
        description: "Nursing staff with patient care support permissions",
        isSystem: true,
        permissions: [
          "read_patients",
          "update_patients",
          "read_appointments",
          "update_appointments",
          "read_medical_records",
        ],
      },
      {
        name: "Receptionist",
        description: "Front desk staff with appointment management",
        isSystem: true,
        permissions: [
          "read_patients",
          "create_patients",
          "update_patients",
          "create_appointments",
          "read_appointments",
          "update_appointments",
          "delete_appointments",
        ],
      },
      {
        name: "Patient",
        description: "Patient with limited access to own information",
        isSystem: true,
        permissions: ["read_appointments"],
      },
    ];

    for (const roleData of defaultRoles) {
      const { permissions: permissionNames, ...roleInfo } = roleData;

      // Check if role already exists
      const existingRole = await this.prisma.role.findFirst({
        where: {
          name: roleInfo.name,
          organizationId,
        },
      });

      if (existingRole) {
        continue; // Skip if role already exists
      }

      // Create role
      const role = await this.prisma.role.create({
        data: {
          ...roleInfo,
          organizationId,
        },
      });

      // Get permissions by names
      const permissions = await this.prisma.permission.findMany({
        where: {
          name: {
            in: permissionNames,
          },
        },
      });

      // Assign permissions to role
      const rolePermissions = permissions.map((permission) => ({
        roleId: role.id,
        permissionId: permission.id,
      }));

      if (rolePermissions.length > 0) {
        await this.prisma.rolePermission.createMany({
          data: rolePermissions,
          skipDuplicates: true,
        });
      }
    }

    return {
      message: "Default roles seeded successfully",
      organizationId,
      rolesCreated: defaultRoles.length,
    };
  }

  private async seedDefaultPermissions() {
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

    return newPermissions.length;
  }
}
