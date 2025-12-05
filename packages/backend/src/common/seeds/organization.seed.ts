import { PrismaClient, UserRole } from "@prisma/client";
import * as bcrypt from "bcrypt";
import { PERMISSIONS, DEFAULT_ROLES } from "../constants/permissions.constants";
import {
  generateEntityIdSync,
  ENTITY_PREFIXES,
} from "../utils/id-generator.util";

export class OrganizationSeed {
  constructor(private readonly prisma: PrismaClient) {}

  async seedOrganizationWithAdmin(data: {
    organizationName: string;
    organizationSlug: string;
    adminPhone: string;
    adminPassword: string;
    adminFirstName: string;
    adminLastName: string;
    adminEmail?: string;
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
        `Organization with name "${organizationName}" or slug "${organizationSlug}" already exists`
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
        isActive: true,
        ...organizationData,
      },
    });

    // Create admin user (role is USER, permissions come from dynamic roles)
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    const adminUser = await this.prisma.user.create({
      data: {
        phone: adminPhone,
        password: hashedPassword,
        role: UserRole.USER,
        organizationId: organization.id,
        isActive: true,
      },
    });

    // Create admin employee
    const adminEmployee = await this.prisma.employee.create({
      data: {
        firstName: adminFirstName,
        lastName: adminLastName,
        email: adminEmail,
        phone: adminPhone,
        employeeId: generateEntityIdSync(ENTITY_PREFIXES.EMPLOYEE, 1),
        userId: adminUser.id,
        organizationId: organization.id,
      },
    });

    // Create organization administrator role with all permissions
    const adminRole = await this.createOrganizationAdminRole(organization.id);

    // Assign role to admin user
    await this.prisma.userRole_Assignment.create({
      data: {
        userId: adminUser.id,
        roleId: adminRole.id,
      },
    });

    return {
      organization,
      adminUser,
      adminEmployee,
      adminRole,
    };
  }

  private async createOrganizationAdminRole(organizationId: string) {
    // Get admin role config from constants
    const adminConfig = DEFAULT_ROLES.ADMINISTRATOR;

    // Create organization administrator role
    const adminRole = await this.prisma.role.create({
      data: {
        name: adminConfig.name,
        description: adminConfig.description,
        isSystem: adminConfig.isSystem,
        isActive: true,
        organizationId,
        permissions: {
          create: adminConfig.permissions.map((permission) => ({
            permission,
          })),
        },
      },
    });

    return adminRole;
  }

  async seedSampleOrganization() {
    return this.seedOrganizationWithAdmin({
      organizationName: "Здрав'е Клиника",
      organizationSlug: "zdravye-clinic",
      adminPhone: "+998901234567",
      adminPassword: "AdminPass123!",
      adminFirstName: "Admin",
      adminLastName: "Administrator",
      adminEmail: "admin@zdravye.uz",
      organizationData: {
        address: "г. Ташкент, ул. Амира Темура, 1",
        phone: "+998712345678",
        email: "info@zdravye.uz",
        website: "https://zdravye.uz",
        description: "Многопрофильная клиника",
      },
    });
  }
}
