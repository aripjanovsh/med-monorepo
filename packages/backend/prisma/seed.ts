import { PrismaClient, UserRole, PermissionAction } from "@prisma/client";
import * as bcrypt from "bcrypt";
import { OrganizationSeed } from "../src/common/seeds/organization.seed";
import { UzbekistanLocationSeed } from "../src/common/seeds/uzbekistan-location.seed";
import { LanguageSeed } from "../src/common/seeds/language.seed";
import { DepartmentServiceSeed } from "../src/common/seeds/department-service.seed";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

  try {
    // Create default permissions (system-wide)
    await createDefaultPermissions();

    // Create super admin user
    await createSuperAdmin();

    // Create sample organization with admin (optional)
    const orgResult = await createSampleOrganization();

    // Seed Uzbekistan location data
    await seedUzbekistanLocations();

    // Seed languages
    await seedLanguages();

    // Seed departments and services
    // Get organization ID even if it already existed
    let organizationId: string | null = null;
    if (orgResult && orgResult.organization) {
      organizationId = orgResult.organization.id;
    } else {
      // Organization already exists, find it
      const existingOrg = await prisma.organization.findFirst({
        where: { slug: "zdravye-clinic" },
      });
      organizationId = existingOrg?.id ?? null;
    }

    if (organizationId) {
      await seedDepartmentsAndServices(organizationId);
    }

    console.log("✅ Database seeding completed successfully!");
    console.log("");
    console.log(
      "🏥 Sample organization created. You can create more organizations via API endpoints."
    );
  } catch (error) {
    console.error("❌ Error during seeding:", error);
    process.exit(1);
  }
}

async function createSuperAdmin() {
  console.log("👨‍💼 Creating super admin user...");

  const superAdminPhone =
    process.env.SUPER_ADMIN_PHONE || "+998900000001";
  const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD || "Admin123!";

  // Check if super admin already exists
  const existingSuperAdmin = await prisma.user.findFirst({
    where: {
      role: UserRole.SUPER_ADMIN,
    },
  });

  if (existingSuperAdmin) {
    console.log("ℹ️  Super admin already exists:", existingSuperAdmin.phone);
    return existingSuperAdmin;
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(superAdminPassword, 10);

  // Create super admin user
  const superAdmin = await prisma.user.create({
    data: {
      phone: superAdminPhone,
      password: hashedPassword,
      role: UserRole.SUPER_ADMIN,
      isActive: true,
      // Super admin doesn't belong to any organization
    },
  });

  console.log("✅ Super admin created successfully!");
  console.log("📱 Phone:", superAdmin.phone);
  console.log("🔑 Password:", superAdminPassword);
  console.log("⚠️  Please change the password after first login!");

  return superAdmin;
}

async function createDefaultPermissions() {
  console.log("🔐 Creating default permissions...");
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
      description: "Update appointments",
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

  const existingPermissions = await prisma.permission.findMany({
    select: { name: true },
  });
  const existingNames = new Set(existingPermissions.map((p) => p.name));

  const newPermissions = defaultPermissions.filter(
    (p) => !existingNames.has(p.name)
  );

  if (newPermissions.length > 0) {
    await prisma.permission.createMany({
      data: newPermissions,
      skipDuplicates: true,
    });
    console.log(`✅ Created ${newPermissions.length} permissions`);
  } else {
    console.log("ℹ️  All permissions already exist");
  }
}

async function createSampleOrganization() {
  console.log("🏥 Creating sample organization...");

  try {
    const organizationSeed = new OrganizationSeed(prisma);
    const result = await organizationSeed.seedSampleOrganization();

    console.log("✅ Sample organization created successfully!");
    console.log("🏢 Organization:", result.organization.name);
    console.log("👨‍💼 Admin phone:", result.adminUser.phone);
    console.log("🔑 Admin password: AdminPass123!");
    console.log("⚠️  Please change the admin password after first login!");
    console.log("👷 Employee ID:", result.adminEmployee.employeeId);

    return result;
  } catch (error) {
    // If organization already exists, just log and continue
    if (error.message.includes("already exists")) {
      console.log("ℹ️  Sample organization already exists, skipping...");
      return null;
    }
    throw error;
  }
}

async function seedUzbekistanLocations() {
  console.log("🗺️ Seeding location data...");

  try {
    const locationSeed = new UzbekistanLocationSeed(prisma);
    const result = await locationSeed.seedUzbekistanLocations();

    console.log("✅ Location data seeded successfully!");
    console.log(`🌍 Country: ${result.country.name}`);
    console.log(`🏘️ Regions: ${result.regionsCount}`);
    console.log(`🏙️ Tashkent Districts: ${result.tashkentDistrictsCount}`);
    console.log(`🏙️ Cities: ${result.citiesCount}`);
    console.log(`🏘️ Other Districts: ${result.otherDistrictsCount}`);

    return result;
  } catch (error) {
    // If location data already exists, just log and continue
    if (error.message && error.message.includes("already exists")) {
      console.log("ℹ️  Location data already exists, skipping...");
      return null;
    }
    throw error;
  }
}

async function seedLanguages() {
  console.log("🌐 Seeding languages...");

  try {
    const languageSeed = new LanguageSeed(prisma);
    const result = await languageSeed.seedLanguages();

    console.log("✅ Languages seeded successfully!");
    console.log(`🌐 Languages: ${result.count}`);

    return result;
  } catch (error) {
    // If languages already exist, just log and continue
    if (error.message && error.message.includes("already exists")) {
      console.log("ℹ️  Languages already exist, skipping...");
      return null;
    }
    throw error;
  }
}

async function seedDepartmentsAndServices(organizationId: string) {
  console.log("🏥 Seeding departments and services...");

  try {
    const departmentServiceSeed = new DepartmentServiceSeed(prisma);
    const result = await departmentServiceSeed.seedDepartmentsAndServices(organizationId);

    if (!result.skipped) {
      console.log("✅ Departments and services seeded successfully!");
      console.log(`🏢 Departments: ${result.departments.length}`);
      console.log(`💼 Services: ${result.services.length}`);
    }

    return result;
  } catch (error) {
    // If data already exists, just log and continue
    if (error.message && error.message.includes("already exists")) {
      console.log("ℹ️  Departments and services already exist, skipping...");
      return null;
    }
    throw error;
  }
}

main()
  .catch((e) => {
    console.error("💥 Fatal error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
