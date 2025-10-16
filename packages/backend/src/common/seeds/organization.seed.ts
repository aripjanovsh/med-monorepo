import { PrismaClient, UserRole, PermissionAction } from "@prisma/client";
import * as bcrypt from "bcrypt";

export class OrganizationSeed {
  constructor(private readonly prisma: PrismaClient) {}

  async seedOrganizationWithAdmin(data: {
    organizationName: string;
    organizationSlug: string;
    adminPhone: string;
    adminPassword: string;
    adminFirstName: string;
    adminLastName: string;
    adminEmail?: string; // optional, used for employee contact email
    organizationData?: {
      address?: string;
      phone?: string;
      email?: string;
      website?: string;
      description?: string;
    };
  }) {
    const {
      organizationName,
      organizationSlug,
      adminPhone,
      adminPassword,
      adminFirstName,
      adminLastName,
      adminEmail,
      organizationData = {},
    } = data;

    // Check if organization already exists
    const existingOrg = await this.prisma.organization.findFirst({
      where: {
        OR: [{ slug: organizationSlug }, { name: organizationName }],
      },
    });

    if (existingOrg) {
      throw new Error(
        `Organization with name "${organizationName}" or slug "${organizationSlug}" already exists`,
      );
    }

    // Check if admin phone already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { phone: adminPhone },
    });

    if (existingUser) {
      throw new Error(`User with phone "${adminPhone}" already exists`);
    }

    // Create organization
    const organization = await this.prisma.organization.create({
      data: {
        name: organizationName,
        slug: organizationSlug,
        address: organizationData.address,
        phone: organizationData.phone,
        email: organizationData.email,
        website: organizationData.website,
        description: organizationData.description,
        isActive: true,
      },
    });

    // Hash admin password
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // Create admin user (phone-based auth)
    const adminUser = await this.prisma.user.create({
      data: {
        phone: adminPhone,
        password: hashedPassword,
        role: UserRole.ADMIN,
        isActive: true,
        organizationId: organization.id,
      },
    });

    // Create employee record for admin
    const adminEmployee = await this.prisma.employee.create({
      data: {
        userId: adminUser.id,
        // employeeId is now optional - can be auto-generated or set manually
        employeeId: `EMP-${organizationSlug.toUpperCase()}-001`,
        firstName: adminFirstName,
        lastName: adminLastName,
        email: adminEmail,
        hireDate: new Date().toISOString(),
        organizationId: organization.id,
      },
    });

    // Create system admin role for the organization
    await this.createOrganizationAdminRole(organization.id);

    // Assign admin role to the user
    const adminRole = await this.prisma.role.findFirst({
      where: {
        name: "Organization Administrator",
        organizationId: organization.id,
      },
    });

    if (adminRole) {
      await this.prisma.userRole_Assignment.create({
        data: {
          userId: adminUser.id,
          roleId: adminRole.id,
        },
      });
    }

    return {
      organization,
      adminUser,
      adminEmployee,
      adminRole,
    };
  }

  private async createOrganizationAdminRole(organizationId: string) {
    // Ensure permissions exist
    await this.ensurePermissions();

    // Get all management permissions for organization admin
    const adminPermissions = await this.prisma.permission.findMany({
      where: {
        OR: [
          { action: PermissionAction.MANAGE },
          { name: { in: ["read_organization", "update_organization"] } },
        ],
      },
    });

    // Create organization administrator role
    const adminRole = await this.prisma.role.create({
      data: {
        name: "Organization Administrator",
        description:
          "Full system administrator with all permissions for the organization",
        isSystem: true,
        isActive: true,
        organizationId,
      },
    });

    // Assign all management permissions to admin role
    const rolePermissions = adminPermissions.map((permission) => ({
      roleId: adminRole.id,
      permissionId: permission.id,
    }));

    if (rolePermissions.length > 0) {
      await this.prisma.rolePermission.createMany({
        data: rolePermissions,
        skipDuplicates: true,
      });
    }

    return adminRole;
  }

  private async ensurePermissions() {
    const requiredPermissions = [
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

    const newPermissions = requiredPermissions.filter(
      (p) => !existingNames.has(p.name),
    );

    if (newPermissions.length > 0) {
      await this.prisma.permission.createMany({
        data: newPermissions,
        skipDuplicates: true,
      });
    }
  }

  async seedSampleOrganization() {
    return this.seedOrganizationWithAdmin({
      organizationName: 'Медицинская клиника "Здоровье"',
      organizationSlug: "zdravye-clinic",
      adminPhone: "+998901112233",
      adminEmail: "admin@med.uz",
      adminPassword: "123456",
      adminFirstName: "Администратор",
      adminLastName: "Клиники",
      organizationData: {
        address: "г. Ташкент, ул. Амира Тимура, 123",
        phone: "+998 71 123-45-67",
        email: "info@zdravye-clinic.uz",
        website: "https://zdravye-clinic.uz",
        description: "Современная медицинская клиника с полным спектром услуг",
      },
    });
  }
}
