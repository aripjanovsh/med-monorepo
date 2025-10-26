import type { PrismaClient } from "@prisma/client";

export class DepartmentServiceSeed {
  constructor(private readonly prisma: PrismaClient) {}

  async seedDepartmentsAndServices(organizationId: string) {
    console.log("🏥 Seeding departments and services...");

    // Check if departments already exist for this organization
    const existingDepartments = await this.prisma.department.findMany({
      where: { organizationId },
    });

    if (existingDepartments.length > 0) {
      console.log("ℹ️  Departments already exist for this organization, skipping...");
      return {
        departments: existingDepartments,
        services: [],
        skipped: true,
      };
    }

    // Get organization
    const organization = await this.prisma.organization.findUnique({
      where: { id: organizationId },
      include: {
        employees: true,
      },
    });

    if (!organization) {
      throw new Error(`Organization with ID ${organizationId} not found`);
    }

    // Create sample employees if needed (doctors)
    const doctors = await this.createSampleDoctors(organizationId);

    // Create departments
    const departments = await this.createDepartments(
      organizationId,
      doctors,
    );

    // Create services
    const services = await this.createServices(
      organizationId,
      departments,
    );

    console.log(`✅ Created ${departments.length} departments`);
    console.log(`✅ Created ${services.length} services`);

    return {
      departments,
      services,
      skipped: false,
    };
  }

  private async createSampleDoctors(organizationId: string) {
    const doctorData = [
      {
        employeeId: "DOC-001",
        firstName: "Иван",
        lastName: "Петров",
        email: "petrov@med.uz",
      },
      {
        employeeId: "DOC-002",
        firstName: "Мария",
        lastName: "Иванова",
        email: "ivanova@med.uz",
      },
      {
        employeeId: "DOC-003",
        firstName: "Алишер",
        lastName: "Назаров",
        email: "nazarov@med.uz",
      },
      {
        employeeId: "DOC-004",
        firstName: "Шахбоз",
        lastName: "Собиров",
        email: "sobirov@med.uz",
      },
    ];

    const doctors = [];

    for (const doctor of doctorData) {
      // Check if employee already exists
      const existing = await this.prisma.employee.findUnique({
        where: {
          employeeId_organizationId: {
            employeeId: doctor.employeeId,
            organizationId,
          },
        },
      });

      if (existing) {
        doctors.push(existing);
      } else {
        const newDoctor = await this.prisma.employee.create({
          data: {
            ...doctor,
            organizationId,
            status: "ACTIVE",
            gender: "MALE",
            hireDate: new Date().toISOString(),
          },
        });
        doctors.push(newDoctor);
      }
    }

    return doctors;
  }

  private async createDepartments(
    organizationId: string,
    doctors: any[],
  ) {
    const departmentsData = [
      {
        name: "Хирургическое отделение",
        code: "SURG",
        headId: doctors[0]?.id,
        order: 1,
      },
      {
        name: "Лаборатория",
        code: "LAB",
        headId: doctors[1]?.id,
        order: 2,
      },
      {
        name: "Диагностическое отделение",
        code: "DIAG",
        headId: doctors[2]?.id,
        order: 3,
      },
    ];

    const departments = [];

    for (const deptData of departmentsData) {
      const department = await this.prisma.department.create({
        data: {
          name: deptData.name,
          code: deptData.code,
          headId: deptData.headId,
          order: deptData.order,
          isActive: true,
          organizationId,
        },
      });
      departments.push(department);
    }

    // Create sub-departments
    const subDepartmentsData = [
      {
        name: "УЗИ",
        code: "USG",
        headId: doctors[2]?.id,
        order: 4,
      },
      {
        name: "ЭКГ",
        code: "ECG",
        headId: doctors[3]?.id,
        order: 5,
      },
    ];

    for (const subDeptData of subDepartmentsData) {
      const subDepartment = await this.prisma.department.create({
        data: {
          name: subDeptData.name,
          code: subDeptData.code,
          headId: subDeptData.headId,
          order: subDeptData.order,
          isActive: true,
          organizationId,
        },
      });
      departments.push(subDepartment);
    }

    return departments;
  }

  private async createServices(
    organizationId: string,
    departments: any[],
  ) {
    // Find departments by code
    const surgDept = departments.find((d) => d.code === "SURG");
    const labDept = departments.find((d) => d.code === "LAB");
    const usgDept = departments.find((d) => d.code === "USG");
    const ecgDept = departments.find((d) => d.code === "ECG");

    const servicesData = [
      {
        code: "SURG_CONSULT",
        name: "Приём хирурга",
        type: "CONSULTATION",
        departmentId: surgDept?.id,
        price: 80000,
        durationMin: 20,
      },
      {
        code: "LAB_CBC",
        name: "Общий анализ крови",
        type: "LAB",
        departmentId: labDept?.id,
        price: 45000,
        durationMin: 5,
      },
      {
        code: "LAB_URO",
        name: "Анализ мочи",
        type: "LAB",
        departmentId: labDept?.id,
        price: 35000,
        durationMin: 5,
      },
      {
        code: "USG_ABD",
        name: "УЗИ органов брюшной полости",
        type: "DIAGNOSTIC",
        departmentId: usgDept?.id,
        price: 120000,
        durationMin: 15,
      },
      {
        code: "ECG_STD",
        name: "ЭКГ стандартная",
        type: "DIAGNOSTIC",
        departmentId: ecgDept?.id,
        price: 80000,
        durationMin: 10,
      },
      {
        code: "PROC_DRESS",
        name: "Перевязка",
        type: "PROCEDURE",
        departmentId: surgDept?.id,
        price: 30000,
        durationMin: 10,
      },
    ];

    const services = [];

    for (const serviceData of servicesData) {
      const service = await this.prisma.service.create({
        data: {
          code: serviceData.code,
          name: serviceData.name,
          type: serviceData.type,
          departmentId: serviceData.departmentId,
          price: serviceData.price,
          durationMin: serviceData.durationMin,
          isActive: true,
          organizationId,
        } as any,
      });
      services.push(service);
    }

    return services;
  }
}
