import { PrismaClient, Gender, EmployeeStatus, ServiceTypeEnum, UserRole } from "@prisma/client";
import * as bcrypt from "bcrypt";
import { Decimal } from "@prisma/client/runtime/library";

export class DemoDataSeed {
  constructor(private readonly prisma: PrismaClient) {}

  async seedDemoData(organizationId: string) {
    console.log("🎭 Creating demo data...");

    // Create titles for doctors
    const titles = await this.createTitles(organizationId);
    
    // Get departments
    const departments = await this.prisma.department.findMany({
      where: { organizationId },
    });

    if (departments.length === 0) {
      throw new Error("No departments found. Please seed departments first.");
    }

    // Create 20 doctors with user accounts
    const doctors = await this.createDoctors(organizationId, departments, titles);
    console.log(`✅ Created ${doctors.length} doctors`);

    // Create 20 patients
    const patients = await this.createPatients(organizationId);
    console.log(`✅ Created ${patients.length} patients`);

    // Create 20 additional services (beyond what's already seeded)
    const services = await this.createServices(organizationId, departments);
    console.log(`✅ Created ${services.length} services`);

    return {
      doctors,
      patients,
      services,
    };
  }

  private async createTitles(organizationId: string) {
    const titleData = [
      { name: "Врач-терапевт", description: "Терапия, общая практика" },
      { name: "Врач-кардиолог", description: "Кардиология" },
      { name: "Врач-невролог", description: "Неврология" },
      { name: "Врач-педиатр", description: "Педиатрия" },
      { name: "Врач-хирург", description: "Хирургия" },
      { name: "Врач-офтальмолог", description: "Офтальмология" },
      { name: "Врач-отоларинголог", description: "ЛОР" },
      { name: "Врач-гинеколог", description: "Гинекология" },
      { name: "Врач-уролог", description: "Урология" },
      { name: "Врач-эндокринолог", description: "Эндокринология" },
    ];

    const titles = [];
    for (const title of titleData) {
      const existing = await this.prisma.title.findFirst({
        where: {
          name: title.name,
          organizationId,
        },
      });

      if (!existing) {
        const created = await this.prisma.title.create({
          data: {
            ...title,
            organizationId,
          },
        });
        titles.push(created);
      } else {
        titles.push(existing);
      }
    }

    return titles;
  }

  private async createDoctors(organizationId: string, departments: any[], titles: any[]) {
    const doctors = [];
    const hashedPassword = await bcrypt.hash("doctor123", 10);

    const doctorData = [
      { firstName: "Алишер", lastName: "Каримов", gender: Gender.MALE },
      { firstName: "Азиза", lastName: "Рахимова", gender: Gender.FEMALE },
      { firstName: "Бахтиёр", lastName: "Усманов", gender: Gender.MALE },
      { firstName: "Гульнара", lastName: "Хасанова", gender: Gender.FEMALE },
      { firstName: "Дилшод", lastName: "Тошматов", gender: Gender.MALE },
      { firstName: "Елена", lastName: "Иванова", gender: Gender.FEMALE },
      { firstName: "Жасур", lastName: "Абдуллаев", gender: Gender.MALE },
      { firstName: "Зарина", lastName: "Мирзаева", gender: Gender.FEMALE },
      { firstName: "Икром", lastName: "Нуриддинов", gender: Gender.MALE },
      { firstName: "Камила", lastName: "Саидова", gender: Gender.FEMALE },
      { firstName: "Лола", lastName: "Махмудова", gender: Gender.FEMALE },
      { firstName: "Мурод", lastName: "Азимов", gender: Gender.MALE },
      { firstName: "Нодира", lastName: "Шарипова", gender: Gender.FEMALE },
      { firstName: "Отабек", lastName: "Исмаилов", gender: Gender.MALE },
      { firstName: "Парвина", lastName: "Кадырова", gender: Gender.FEMALE },
      { firstName: "Равшан", lastName: "Юсупов", gender: Gender.MALE },
      { firstName: "Сабина", lastName: "Ахмедова", gender: Gender.FEMALE },
      { firstName: "Тимур", lastName: "Джалилов", gender: Gender.MALE },
      { firstName: "Умида", lastName: "Назарова", gender: Gender.FEMALE },
      { firstName: "Фарход", lastName: "Рустамов", gender: Gender.MALE },
    ];

    for (let i = 0; i < doctorData.length; i++) {
      const data = doctorData[i];
      const phone = `+99890${String(1000000 + i).padStart(7, "0")}`;
      const employeeId = `DOC-${String(i + 1).padStart(3, "0")}`;
      
      // Check if employee already exists
      const existingEmployee = await this.prisma.employee.findFirst({
        where: {
          employeeId,
          organizationId,
        },
      });

      if (existingEmployee) {
        console.log(`⏭️  Doctor ${employeeId} already exists, skipping...`);
        doctors.push(existingEmployee);
        continue;
      }
      
      // Check if user already exists
      const existingUser = await this.prisma.user.findUnique({
        where: { phone },
      });

      if (existingUser) {
        console.log(`⏭️  User with phone ${phone} already exists, skipping...`);
        continue;
      }

      // Create user account for doctor
      const user = await this.prisma.user.create({
        data: {
          phone,
          password: hashedPassword,
          role: UserRole.DOCTOR,
          isActive: true,
          organizationId,
        },
      });

      // Create employee record
      const employee = await this.prisma.employee.create({
        data: {
          userId: user.id,
          employeeId,
          firstName: data.firstName,
          lastName: data.lastName,
          gender: data.gender,
          dateOfBirth: new Date(1975 + Math.floor(Math.random() * 20), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
          phone,
          email: `${data.firstName.toLowerCase()}.${data.lastName.toLowerCase()}@zdravye-clinic.uz`,
          titleId: titles[i % titles.length].id,
          departmentId: departments[i % departments.length].id,
          salary: new Decimal(5000000 + Math.floor(Math.random() * 5000000)), // 5-10 млн сум
          hireDate: new Date(2020 + Math.floor(Math.random() * 4), Math.floor(Math.random() * 12), 1),
          status: EmployeeStatus.ACTIVE,
          organizationId,
        },
      });

      doctors.push(employee);
    }

    return doctors;
  }

  private async createPatients(organizationId: string) {
    const patients = [];

    const patientData = [
      { firstName: "Азиз", lastName: "Хамидов", middleName: "Рахматович", gender: Gender.MALE },
      { firstName: "Барно", lastName: "Исмаилова", middleName: "Алишеровна", gender: Gender.FEMALE },
      { firstName: "Вадим", lastName: "Петров", middleName: "Сергеевич", gender: Gender.MALE },
      { firstName: "Гузал", lastName: "Каримова", middleName: "Бахтияровна", gender: Gender.FEMALE },
      { firstName: "Давлат", lastName: "Усманов", middleName: "Шухратович", gender: Gender.MALE },
      { firstName: "Елена", lastName: "Смирнова", middleName: "Владимировна", gender: Gender.FEMALE },
      { firstName: "Жахонгир", lastName: "Абдуллаев", middleName: "Муродович", gender: Gender.MALE },
      { firstName: "Зухра", lastName: "Мирзаева", middleName: "Отабековна", gender: Gender.FEMALE },
      { firstName: "Искандар", lastName: "Нуриддинов", middleName: "Тимурович", gender: Gender.MALE },
      { firstName: "Камола", lastName: "Саидова", middleName: "Фарходовна", gender: Gender.FEMALE },
      { firstName: "Лазиз", lastName: "Махмудов", middleName: "Равшанович", gender: Gender.MALE },
      { firstName: "Малика", lastName: "Шарипова", middleName: "Азизовна", gender: Gender.FEMALE },
      { firstName: "Нодир", lastName: "Хамраев", middleName: "Джамшидович", gender: Gender.MALE },
      { firstName: "Ойша", lastName: "Кадырова", middleName: "Умаровна", gender: Gender.FEMALE },
      { firstName: "Равшан", lastName: "Юсупов", middleName: "Бахтиярович", gender: Gender.MALE },
      { firstName: "Сарвиноз", lastName: "Ахмедова", middleName: "Алишеровна", gender: Gender.FEMALE },
      { firstName: "Темур", lastName: "Джалилов", middleName: "Рустамович", gender: Gender.MALE },
      { firstName: "Умида", lastName: "Назарова", middleName: "Икромовна", gender: Gender.FEMALE },
      { firstName: "Фаррух", lastName: "Рустамов", middleName: "Шухратович", gender: Gender.MALE },
      { firstName: "Хилола", lastName: "Каландарова", middleName: "Дилшодовна", gender: Gender.FEMALE },
    ];

    for (let i = 0; i < patientData.length; i++) {
      const data = patientData[i];
      const patientId = `PAT-${String(i + 1).padStart(5, "0")}`;
      
      // Check if patient already exists
      const existingPatient = await this.prisma.patient.findFirst({
        where: {
          patientId,
          organizationId,
        },
      });

      if (existingPatient) {
        console.log(`⏭️  Patient ${patientId} already exists, skipping...`);
        continue;
      }

      const patient = await this.prisma.patient.create({
        data: {
          patientId,
          firstName: data.firstName,
          middleName: data.middleName,
          lastName: data.lastName,
          gender: data.gender,
          dateOfBirth: new Date(1950 + Math.floor(Math.random() * 60), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
          passportSeries: `A${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`,
          passportNumber: String(1000000 + Math.floor(Math.random() * 9000000)),
          organizationId,
        },
      });

      // Create patient contact
      await this.prisma.patientContact.create({
        data: {
          patientId: patient.id,
          relation: "SELF",
          type: "PRIMARY",
          firstName: data.firstName,
          lastName: data.lastName,
          primaryPhone: `+99891${String(1000000 + i).padStart(7, "0")}`,
          textNotificationsEnabled: true,
        },
      });

      patients.push(patient);
    }

    return patients;
  }

  private async createServices(organizationId: string, departments: any[]) {
    const services = [];

    const serviceData = [
      { code: "CONS-001", name: "Первичный прием терапевта", type: ServiceTypeEnum.CONSULTATION, price: 150000, durationMin: 30 },
      { code: "CONS-002", name: "Повторный прием терапевта", type: ServiceTypeEnum.CONSULTATION, price: 100000, durationMin: 20 },
      { code: "CONS-003", name: "Прием кардиолога", type: ServiceTypeEnum.CONSULTATION, price: 200000, durationMin: 40 },
      { code: "CONS-004", name: "Прием невролога", type: ServiceTypeEnum.CONSULTATION, price: 200000, durationMin: 40 },
      { code: "CONS-005", name: "Прием педиатра", type: ServiceTypeEnum.CONSULTATION, price: 150000, durationMin: 30 },
      
      { code: "LAB-001", name: "Общий анализ крови", type: ServiceTypeEnum.LAB, price: 50000, durationMin: 15 },
      { code: "LAB-002", name: "Биохимический анализ крови", type: ServiceTypeEnum.LAB, price: 120000, durationMin: 20 },
      { code: "LAB-003", name: "Общий анализ мочи", type: ServiceTypeEnum.LAB, price: 30000, durationMin: 10 },
      { code: "LAB-004", name: "Анализ на сахар", type: ServiceTypeEnum.LAB, price: 25000, durationMin: 10 },
      { code: "LAB-005", name: "Липидограмма", type: ServiceTypeEnum.LAB, price: 80000, durationMin: 15 },
      
      { code: "DIAG-001", name: "УЗИ органов брюшной полости", type: ServiceTypeEnum.DIAGNOSTIC, price: 180000, durationMin: 30 },
      { code: "DIAG-002", name: "УЗИ сердца (ЭХО-КГ)", type: ServiceTypeEnum.DIAGNOSTIC, price: 250000, durationMin: 40 },
      { code: "DIAG-003", name: "ЭКГ", type: ServiceTypeEnum.DIAGNOSTIC, price: 50000, durationMin: 15 },
      { code: "DIAG-004", name: "Рентген грудной клетки", type: ServiceTypeEnum.DIAGNOSTIC, price: 100000, durationMin: 20 },
      { code: "DIAG-005", name: "УЗИ щитовидной железы", type: ServiceTypeEnum.DIAGNOSTIC, price: 120000, durationMin: 25 },
      
      { code: "PROC-001", name: "Внутривенная инъекция", type: ServiceTypeEnum.PROCEDURE, price: 20000, durationMin: 10 },
      { code: "PROC-002", name: "Внутримышечная инъекция", type: ServiceTypeEnum.PROCEDURE, price: 15000, durationMin: 5 },
      { code: "PROC-003", name: "Капельница", type: ServiceTypeEnum.PROCEDURE, price: 80000, durationMin: 60 },
      { code: "PROC-004", name: "Перевязка", type: ServiceTypeEnum.PROCEDURE, price: 30000, durationMin: 15 },
      { code: "PROC-005", name: "Массаж (30 мин)", type: ServiceTypeEnum.PROCEDURE, price: 100000, durationMin: 30 },
    ];

    for (const data of serviceData) {
      // Check if service already exists
      const existingService = await this.prisma.service.findFirst({
        where: {
          code: data.code,
          organizationId,
        },
      });

      if (existingService) {
        console.log(`⏭️  Service ${data.code} already exists, skipping...`);
        continue;
      }

      // Assign department based on service type
      let departmentId = departments[0].id; // default
      const labDept = departments.find((d) => d.code === "LAB");
      const usgDept = departments.find((d) => d.code === "USG");
      const procDept = departments.find((d) => d.code === "PROC");

      if (data.type === ServiceTypeEnum.LAB && labDept) {
        departmentId = labDept.id;
      } else if (data.type === ServiceTypeEnum.DIAGNOSTIC && usgDept) {
        departmentId = usgDept.id;
      } else if (data.type === ServiceTypeEnum.PROCEDURE && procDept) {
        departmentId = procDept.id;
      }

      const service = await this.prisma.service.create({
        data: {
          code: data.code,
          name: data.name,
          type: data.type,
          price: new Decimal(data.price),
          durationMin: data.durationMin,
          departmentId,
          organizationId,
          isActive: true,
        },
      });

      services.push(service);
    }

    return services;
  }
}
