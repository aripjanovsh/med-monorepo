import { PrismaClient } from "@prisma/client";
import { DemoDataSeed } from "../src/common/seeds/demo-data.seed";

const prisma = new PrismaClient();

async function main() {
  console.log("🎭 Starting demo data seeding...");

  try {
    // Get the first organization (assumed to be zdravye-clinic from main seed)
    const organization = await prisma.organization.findFirst({
      where: { slug: "zdravye-clinic" },
    });

    if (!organization) {
      console.error("❌ No organization found. Please run main seed first: pnpm db:seed");
      process.exit(1);
    }

    console.log(`🏥 Using organization: ${organization.name}`);

    // Seed demo data
    const demoSeed = new DemoDataSeed(prisma);
    const result = await demoSeed.seedDemoData(organization.id);

    console.log("");
    console.log("✅ Demo data seeded successfully!");
    console.log(`👨‍⚕️ Doctors: ${result.doctors.length}`);
    console.log(`👥 Patients: ${result.patients.length}`);
    console.log(`💼 Services: ${result.services.length}`);
    console.log("");
    console.log("📱 All doctors have accounts with password: doctor123");
    console.log("📱 Example doctor login: +998901000000 / doctor123");
  } catch (error) {
    console.error("❌ Error during demo seeding:", error);
    process.exit(1);
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
