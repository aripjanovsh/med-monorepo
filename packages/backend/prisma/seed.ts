import { PrismaClient, UserRole } from "@prisma/client";
import * as bcrypt from "bcrypt";
import { OrganizationSeed } from "../src/common/seeds/organization.seed";
import { UzbekistanLocationSeed } from "../src/common/seeds/uzbekistan-location.seed";
import { LanguageSeed } from "../src/common/seeds/language.seed";
import { DepartmentServiceSeed } from "../src/common/seeds/department-service.seed";
import { ParameterDefinitionSeed } from "../src/common/seeds/parameter-definition.seed";
import { AppointmentTypeSeed } from "../src/common/seeds/appointment-type.seed";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

  try {
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
      await seedParameterDefinitions(organizationId);
      await seedAppointmentTypes(organizationId);
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

  const superAdminPhone = process.env.SUPER_ADMIN_PHONE || "+998900000001";
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
    const result =
      await departmentServiceSeed.seedDepartmentsAndServices(organizationId);

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

async function seedParameterDefinitions(organizationId: string) {
  console.log("📊 Seeding parameter definitions...");

  try {
    const parameterSeed = new ParameterDefinitionSeed(prisma);
    const result = await parameterSeed.seedParameterDefinitions(organizationId);

    console.log(`✅ Parameter definitions: ${result.count} created`);

    return result;
  } catch (error) {
    if (error.message && error.message.includes("already exists")) {
      console.log("ℹ️  Parameter definitions already exist, skipping...");
      return null;
    }
    throw error;
  }
}

async function seedAppointmentTypes(organizationId: string) {
  console.log("📅 Seeding appointment types...");

  try {
    const appointmentTypeSeed = new AppointmentTypeSeed(prisma);
    const result = await appointmentTypeSeed.seedAll(organizationId);

    if (!result.appointmentTypes[0]?.skipped) {
      console.log("✅ Appointment types seeded successfully!");
      console.log(`📅 Appointment types: ${result.appointmentTypes.length}`);
      console.log(`❌ Cancel types: ${result.appointmentCancelTypes.length}`);
    }

    return result;
  } catch (error) {
    if (error.message && error.message.includes("already exists")) {
      console.log("ℹ️  Appointment types already exist, skipping...");
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
