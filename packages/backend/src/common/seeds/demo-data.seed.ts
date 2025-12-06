import {
  PrismaClient,
  Gender,
  EmployeeStatus,
  ServiceTypeEnum,
  UserRole,
  VisitStatus,
  VisitType,
  AppointmentStatus,
  OrderStatus,
  PaymentStatus,
  QueueStatus,
  PaymentMethod,
  AllergySeverity,
  type Employee,
  type Patient,
  type Service,
  type Department,
  type Title,
  type Visit,
  type ServiceOrder,
} from "@prisma/client";
import * as bcrypt from "bcrypt";
import { Decimal } from "@prisma/client/runtime/library";
import { RolesSeed } from "./roles.seed";
import {
  generateEntityIdSync,
  ENTITY_PREFIXES,
} from "../utils/id-generator.util";

type DemoDataResult = {
  titles: Title[];
  doctors: Employee[];
  patients: Patient[];
  services: Service[];
  protocolTemplates: number;
  analysisTemplates: number;
  roles: number;
  visits: Visit[];
  appointments: number;
  serviceOrders: ServiceOrder[];
  invoices: number;
  payments: number;
  prescriptions: number;
  patientDoctors: number;
  allergies: number;
  parameters: number;
};

export class DemoDataSeed {
  constructor(private readonly prisma: PrismaClient) {}

  async seedDemoData(organizationId: string): Promise<DemoDataResult> {
    console.log("🎭 Creating comprehensive demo data...");

    // 1. Create titles for doctors
    const titles = await this.createTitles(organizationId);
    console.log(`✅ Created ${titles.length} titles`);

    // 2. Get departments
    const departments = await this.prisma.department.findMany({
      where: { organizationId },
    });

    if (departments.length === 0) {
      throw new Error("No departments found. Please seed departments first.");
    }

    // 3. Create protocol templates
    const protocolTemplates =
      await this.createProtocolTemplates(organizationId);
    console.log(`✅ Created ${protocolTemplates} protocol templates`);

    // 3.1. Create analysis templates
    const analysisTemplates =
      await this.createAnalysisTemplates(organizationId);
    console.log(`✅ Created ${analysisTemplates} analysis templates`);

    // 4. Create roles and permissions
    const roles = await this.createRoles(organizationId);
    console.log(`✅ Created ${roles} roles`);

    // 5. Create doctors with user accounts
    const doctors = await this.createDoctors(
      organizationId,
      departments,
      titles
    );
    console.log(`✅ Created ${doctors.length} doctors`);

    // 6. Assign roles to doctors
    await this.assignRolesToDoctors(organizationId, doctors);
    console.log(`✅ Assigned roles to doctors`);

    // 7. Create patients
    const patients = await this.createPatients(organizationId);
    console.log(`✅ Created ${patients.length} patients`);

    // 8. Create services
    const services = await this.createServices(organizationId, departments);
    console.log(`✅ Created ${services.length} services`);

    // 9. Create visits (today and past days)
    const visits = await this.createVisits(organizationId, doctors, patients);
    console.log(`✅ Created ${visits.length} visits`);

    // 9.1 Create extensive visit history for Хилола
    const hilolaVisits = await this.createExtensiveVisitHistoryForHilola(
      organizationId,
      patients,
      doctors
    );
    if (hilolaVisits > 0) {
      visits.push(
        ...(await this.prisma.visit.findMany({
          where: {
            patientId: patients.find(
              (p) => p.firstName === "Хилола" && p.lastName === "Каландарова"
            )?.id,
          },
          orderBy: { visitDate: "desc" },
          take: hilolaVisits,
        }))
      );
    }

    // 10. Create appointments (today and future)
    const appointments = await this.createAppointments(
      organizationId,
      doctors,
      patients,
      services
    );
    console.log(`✅ Created ${appointments} appointments`);

    // 11. Create service orders
    const allServices = await this.prisma.service.findMany({
      where: { organizationId, isActive: true },
    });
    const serviceOrders = await this.createServiceOrders(
      organizationId,
      doctors,
      patients,
      allServices,
      departments,
      visits
    );
    console.log(`✅ Created ${serviceOrders.length} service orders`);

    // 12. Create invoices and payments
    const { invoices, payments } = await this.createInvoicesAndPayments(
      organizationId,
      patients,
      visits,
      serviceOrders,
      doctors
    );
    console.log(`✅ Created ${invoices} invoices and ${payments} payments`);

    // 13. Create prescriptions
    const prescriptions = await this.createPrescriptions(visits, doctors);
    console.log(`✅ Created ${prescriptions} prescriptions`);

    // 13.1. Create patient-doctor relationships based on visits
    const patientDoctors = await this.createPatientDoctorRelationships(visits);
    console.log(`✅ Created ${patientDoctors} patient-doctor relationships`);

    // 14. Create patient allergies
    const allergies = await this.createPatientAllergies(
      organizationId,
      patients,
      doctors,
      visits
    );
    console.log(`✅ Created ${allergies} allergies`);

    // 15. Create patient parameters (vital signs)
    const parameters = await this.createPatientParameters(
      organizationId,
      patients,
      doctors,
      visits,
      serviceOrders
    );
    console.log(`✅ Created ${parameters} patient parameters`);

    return {
      titles,
      doctors,
      patients,
      services,
      protocolTemplates,
      analysisTemplates,
      roles,
      visits,
      appointments,
      serviceOrders,
      invoices,
      payments,
      prescriptions,
      patientDoctors,
      allergies,
      parameters,
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

  private async createDoctors(
    organizationId: string,
    departments: any[],
    titles: any[]
  ) {
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
      const employeeId = generateEntityIdSync(ENTITY_PREFIXES.EMPLOYEE, i + 1);

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
          role: UserRole.USER,
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
          dateOfBirth: new Date(
            1975 + Math.floor(Math.random() * 20),
            Math.floor(Math.random() * 12),
            Math.floor(Math.random() * 28) + 1
          ),
          phone,
          email: `${data.firstName.toLowerCase()}.${data.lastName.toLowerCase()}@demo.uz`,
          titleId: titles[i % titles.length].id,
          departmentId: departments[i % departments.length].id,
          salary: new Decimal(5000000 + Math.floor(Math.random() * 5000000)), // 5-10 млн сум
          hireDate: new Date(
            2020 + Math.floor(Math.random() * 4),
            Math.floor(Math.random() * 12),
            1
          ),
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
      {
        firstName: "Азиз",
        lastName: "Хамидов",
        middleName: "Рахматович",
        gender: Gender.MALE,
      },
      {
        firstName: "Барно",
        lastName: "Исмаилова",
        middleName: "Алишеровна",
        gender: Gender.FEMALE,
      },
      {
        firstName: "Вадим",
        lastName: "Петров",
        middleName: "Сергеевич",
        gender: Gender.MALE,
      },
      {
        firstName: "Гузал",
        lastName: "Каримова",
        middleName: "Бахтияровна",
        gender: Gender.FEMALE,
      },
      {
        firstName: "Давлат",
        lastName: "Усманов",
        middleName: "Шухратович",
        gender: Gender.MALE,
      },
      {
        firstName: "Елена",
        lastName: "Смирнова",
        middleName: "Владимировна",
        gender: Gender.FEMALE,
      },
      {
        firstName: "Жахонгир",
        lastName: "Абдуллаев",
        middleName: "Муродович",
        gender: Gender.MALE,
      },
      {
        firstName: "Зухра",
        lastName: "Мирзаева",
        middleName: "Отабековна",
        gender: Gender.FEMALE,
      },
      {
        firstName: "Искандар",
        lastName: "Нуриддинов",
        middleName: "Тимурович",
        gender: Gender.MALE,
      },
      {
        firstName: "Камола",
        lastName: "Саидова",
        middleName: "Фарходовна",
        gender: Gender.FEMALE,
      },
      {
        firstName: "Лазиз",
        lastName: "Махмудов",
        middleName: "Равшанович",
        gender: Gender.MALE,
      },
      {
        firstName: "Малика",
        lastName: "Шарипова",
        middleName: "Азизовна",
        gender: Gender.FEMALE,
      },
      {
        firstName: "Нодир",
        lastName: "Хамраев",
        middleName: "Джамшидович",
        gender: Gender.MALE,
      },
      {
        firstName: "Ойша",
        lastName: "Кадырова",
        middleName: "Умаровна",
        gender: Gender.FEMALE,
      },
      {
        firstName: "Равшан",
        lastName: "Юсупов",
        middleName: "Бахтиярович",
        gender: Gender.MALE,
      },
      {
        firstName: "Сарвиноз",
        lastName: "Ахмедова",
        middleName: "Алишеровна",
        gender: Gender.FEMALE,
      },
      {
        firstName: "Темур",
        lastName: "Джалилов",
        middleName: "Рустамович",
        gender: Gender.MALE,
      },
      {
        firstName: "Умида",
        lastName: "Назарова",
        middleName: "Икромовна",
        gender: Gender.FEMALE,
      },
      {
        firstName: "Фаррух",
        lastName: "Рустамов",
        middleName: "Шухратович",
        gender: Gender.MALE,
      },
      {
        firstName: "Хилола",
        lastName: "Каландарова",
        middleName: "Дилшодовна",
        gender: Gender.FEMALE,
      },
    ];

    for (let i = 0; i < patientData.length; i++) {
      const data = patientData[i];
      const patientId = generateEntityIdSync(ENTITY_PREFIXES.PATIENT, i + 1);

      // Check if patient already exists
      const existingPatient = await this.prisma.patient.findFirst({
        where: {
          patientId,
          organizationId,
        },
      });

      if (existingPatient) {
        patients.push(existingPatient);
        continue;
      }

      const patient = await this.prisma.patient.create({
        data: {
          patientId,
          firstName: data.firstName,
          middleName: data.middleName,
          lastName: data.lastName,
          gender: data.gender,
          dateOfBirth: new Date(
            1950 + Math.floor(Math.random() * 60),
            Math.floor(Math.random() * 12),
            Math.floor(Math.random() * 28) + 1
          ),
          passportSeries: `A${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`,
          passportNumber: String(1000000 + Math.floor(Math.random() * 9000000)),
          phone: `+99891${String(1000000 + i).padStart(7, "0")}`,
          email: `${data.firstName.toLowerCase()}.${data.lastName.toLowerCase()}@example.com`,
          organizationId,
        },
      });

      patients.push(patient);
    }

    return patients;
  }

  private async createServices(
    organizationId: string,
    departments: Department[]
  ) {
    const services: Service[] = [];

    const serviceData = [
      {
        code: "CONS-001",
        name: "Первичный прием терапевта",
        type: ServiceTypeEnum.CONSULTATION,
        price: 150000,
        durationMin: 30,
      },
      {
        code: "CONS-002",
        name: "Повторный прием терапевта",
        type: ServiceTypeEnum.CONSULTATION,
        price: 100000,
        durationMin: 20,
      },
      {
        code: "CONS-003",
        name: "Прием кардиолога",
        type: ServiceTypeEnum.CONSULTATION,
        price: 200000,
        durationMin: 40,
      },
      {
        code: "CONS-004",
        name: "Прием невролога",
        type: ServiceTypeEnum.CONSULTATION,
        price: 200000,
        durationMin: 40,
      },
      {
        code: "CONS-005",
        name: "Прием педиатра",
        type: ServiceTypeEnum.CONSULTATION,
        price: 150000,
        durationMin: 30,
      },
      {
        code: "LAB-001",
        name: "Общий анализ крови",
        type: ServiceTypeEnum.LAB,
        price: 50000,
        durationMin: 15,
      },
      {
        code: "LAB-002",
        name: "Биохимический анализ крови",
        type: ServiceTypeEnum.LAB,
        price: 120000,
        durationMin: 20,
      },
      {
        code: "LAB-003",
        name: "Общий анализ мочи",
        type: ServiceTypeEnum.LAB,
        price: 30000,
        durationMin: 10,
      },
      {
        code: "LAB-004",
        name: "Анализ на сахар",
        type: ServiceTypeEnum.LAB,
        price: 25000,
        durationMin: 10,
      },
      {
        code: "LAB-005",
        name: "Липидограмма",
        type: ServiceTypeEnum.LAB,
        price: 80000,
        durationMin: 15,
      },
      {
        code: "DIAG-001",
        name: "УЗИ органов брюшной полости",
        type: ServiceTypeEnum.DIAGNOSTIC,
        price: 180000,
        durationMin: 30,
      },
      {
        code: "DIAG-002",
        name: "УЗИ сердца (ЭХО-КГ)",
        type: ServiceTypeEnum.DIAGNOSTIC,
        price: 250000,
        durationMin: 40,
      },
      {
        code: "DIAG-003",
        name: "ЭКГ",
        type: ServiceTypeEnum.DIAGNOSTIC,
        price: 50000,
        durationMin: 15,
      },
      {
        code: "DIAG-004",
        name: "Рентген грудной клетки",
        type: ServiceTypeEnum.DIAGNOSTIC,
        price: 100000,
        durationMin: 20,
      },
      {
        code: "DIAG-005",
        name: "УЗИ щитовидной железы",
        type: ServiceTypeEnum.DIAGNOSTIC,
        price: 120000,
        durationMin: 25,
      },
      {
        code: "PROC-001",
        name: "Внутривенная инъекция",
        type: ServiceTypeEnum.PROCEDURE,
        price: 20000,
        durationMin: 10,
      },
      {
        code: "PROC-002",
        name: "Внутримышечная инъекция",
        type: ServiceTypeEnum.PROCEDURE,
        price: 15000,
        durationMin: 5,
      },
      {
        code: "PROC-003",
        name: "Капельница",
        type: ServiceTypeEnum.PROCEDURE,
        price: 80000,
        durationMin: 60,
      },
      {
        code: "PROC-004",
        name: "Перевязка",
        type: ServiceTypeEnum.PROCEDURE,
        price: 30000,
        durationMin: 15,
      },
      {
        code: "PROC-005",
        name: "Массаж (30 мин)",
        type: ServiceTypeEnum.PROCEDURE,
        price: 100000,
        durationMin: 30,
      },
    ];

    for (const data of serviceData) {
      const existingService = await this.prisma.service.findFirst({
        where: { code: data.code, organizationId },
      });

      if (existingService) {
        services.push(existingService);
        continue;
      }

      const labDept = departments.find((d) => d.code === "LAB");
      const usgDept = departments.find((d) => d.code === "USG");
      const procDept = departments.find((d) => d.code === "PROC");

      let departmentId = departments[0].id;
      if (data.type === ServiceTypeEnum.LAB && labDept)
        departmentId = labDept.id;
      else if (data.type === ServiceTypeEnum.DIAGNOSTIC && usgDept)
        departmentId = usgDept.id;
      else if (data.type === ServiceTypeEnum.PROCEDURE && procDept)
        departmentId = procDept.id;

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

  // =====================================
  // PROTOCOL TEMPLATES
  // =====================================
  private async createProtocolTemplates(
    organizationId: string
  ): Promise<number> {
    const templates = [
      {
        name: "Первичный осмотр терапевта",
        description: "Шаблон для первичного осмотра пациента терапевтом",
        content: JSON.stringify({
          version: 1,
          sections: [
            {
              id: "s1",
              title: "Жалобы и анамнез",
              fields: [
                {
                  id: "complaints",
                  label: "Жалобы",
                  type: "textarea",
                  required: true,
                  placeholder: "Опишите жалобы пациента",
                },
                {
                  id: "anamnesis",
                  label: "Анамнез заболевания",
                  type: "textarea",
                  required: true,
                },
                {
                  id: "life_anamnesis",
                  label: "Анамнез жизни",
                  type: "textarea",
                },
              ],
            },
            {
              id: "s2",
              title: "Витальные показатели",
              fields: [
                {
                  id: "bp_sys",
                  label: "АД систолическое (мм рт.ст.)",
                  type: "number",
                  width: 50,
                },
                {
                  id: "bp_dia",
                  label: "АД диастолическое (мм рт.ст.)",
                  type: "number",
                  width: 50,
                },
                {
                  id: "pulse",
                  label: "Пульс (уд/мин)",
                  type: "number",
                  width: 50,
                },
                {
                  id: "temp",
                  label: "Температура (°C)",
                  type: "number",
                  width: 50,
                },
                { id: "weight", label: "Вес (кг)", type: "number", width: 50 },
                { id: "height", label: "Рост (см)", type: "number", width: 50 },
              ],
            },
            {
              id: "s3",
              title: "Осмотр",
              fields: [
                {
                  id: "general_state",
                  label: "Общее состояние",
                  type: "select",
                  options: ["Удовлетворительное", "Средней тяжести", "Тяжёлое"],
                },
                {
                  id: "respiratory",
                  label: "Органы дыхания",
                  type: "textarea",
                },
                {
                  id: "cardiovascular",
                  label: "Сердечно-сосудистая система",
                  type: "textarea",
                },
                {
                  id: "digestive",
                  label: "Органы пищеварения",
                  type: "textarea",
                },
              ],
            },
            {
              id: "s4",
              title: "Заключение",
              fields: [
                {
                  id: "diagnosis",
                  label: "Диагноз",
                  type: "textarea",
                  required: true,
                },
                {
                  id: "recommendations",
                  label: "Рекомендации",
                  type: "textarea",
                },
                {
                  id: "next_visit",
                  label: "Дата следующего визита",
                  type: "date",
                },
              ],
            },
          ],
        }),
      },
      {
        name: "Осмотр кардиолога",
        description: "Шаблон для консультации кардиолога",
        content: JSON.stringify({
          version: 1,
          sections: [
            {
              id: "s1",
              title: "Жалобы",
              fields: [
                {
                  id: "complaints",
                  label: "Жалобы",
                  type: "textarea",
                  required: true,
                },
                { id: "chest_pain", label: "Боли в груди", type: "checkbox" },
                { id: "dyspnea", label: "Одышка", type: "checkbox" },
                { id: "palpitations", label: "Сердцебиение", type: "checkbox" },
                { id: "edema", label: "Отёки", type: "checkbox" },
              ],
            },
            {
              id: "s2",
              title: "Гемодинамика",
              fields: [
                {
                  id: "bp_sys",
                  label: "АД систолическое",
                  type: "number",
                  width: 50,
                },
                {
                  id: "bp_dia",
                  label: "АД диастолическое",
                  type: "number",
                  width: 50,
                },
                { id: "pulse", label: "ЧСС", type: "number", width: 50 },
                { id: "spo2", label: "SpO2 (%)", type: "number", width: 50 },
              ],
            },
            {
              id: "s3",
              title: "Аускультация",
              fields: [
                {
                  id: "heart_sounds",
                  label: "Тоны сердца",
                  type: "select",
                  options: [
                    "Ясные, ритмичные",
                    "Приглушены",
                    "Глухие",
                    "Аритмичные",
                  ],
                },
                { id: "murmurs", label: "Шумы", type: "text" },
                {
                  id: "lungs",
                  label: "Лёгкие",
                  type: "select",
                  options: ["Дыхание в норме", "Жёсткое дыхание", "Хрипы"],
                },
              ],
            },
            {
              id: "s4",
              title: "Заключение",
              fields: [
                {
                  id: "ecg_findings",
                  label: "Заключение ЭКГ",
                  type: "textarea",
                },
                {
                  id: "diagnosis",
                  label: "Диагноз",
                  type: "textarea",
                  required: true,
                },
                { id: "treatment", label: "Назначения", type: "textarea" },
              ],
            },
          ],
        }),
      },
      {
        name: "Осмотр невролога",
        description: "Шаблон для консультации невролога",
        content: JSON.stringify({
          version: 1,
          sections: [
            {
              id: "s1",
              title: "Жалобы и анамнез",
              fields: [
                {
                  id: "complaints",
                  label: "Жалобы",
                  type: "textarea",
                  required: true,
                },
                { id: "dizziness", label: "Головокружение", type: "checkbox" },
                {
                  id: "weakness",
                  label: "Слабость в конечностях",
                  type: "checkbox",
                },
                {
                  id: "neuro_history",
                  label: "Неврологический анамнез",
                  type: "textarea",
                },
              ],
            },
            {
              id: "s2",
              title: "Статус",
              fields: [
                {
                  id: "consciousness",
                  label: "Сознание",
                  type: "select",
                  options: ["Ясное", "Оглушение", "Сопор", "Кома"],
                },
                {
                  id: "orientation",
                  label: "Ориентация",
                  type: "select",
                  options: [
                    "Полная",
                    "Нарушена во времени",
                    "Нарушена в месте",
                    "Нарушена в личности",
                  ],
                },
                {
                  id: "speech",
                  label: "Речь",
                  type: "select",
                  options: ["Не нарушена", "Дизартрия", "Афазия"],
                },
              ],
            },
            {
              id: "s3",
              title: "Двигательная сфера",
              fields: [
                {
                  id: "muscle_tone",
                  label: "Мышечный тонус",
                  type: "select",
                  options: ["Норма", "Повышен", "Снижен"],
                },
                { id: "reflexes", label: "Рефлексы", type: "textarea" },
                { id: "coordination", label: "Координация", type: "textarea" },
              ],
            },
            {
              id: "s4",
              title: "Заключение",
              fields: [
                {
                  id: "diagnosis",
                  label: "Диагноз",
                  type: "textarea",
                  required: true,
                },
                {
                  id: "recommendations",
                  label: "Рекомендации",
                  type: "textarea",
                },
              ],
            },
          ],
        }),
      },
      {
        name: "Осмотр педиатра",
        description: "Шаблон для осмотра ребёнка педиатром",
        content: JSON.stringify({
          version: 1,
          sections: [
            {
              id: "s1",
              title: "Жалобы",
              fields: [
                {
                  id: "complaints",
                  label: "Жалобы (со слов родителей)",
                  type: "textarea",
                  required: true,
                },
                { id: "fever", label: "Лихорадка", type: "checkbox" },
                { id: "cough", label: "Кашель", type: "checkbox" },
              ],
            },
            {
              id: "s2",
              title: "Антропометрия",
              fields: [
                { id: "weight", label: "Вес (кг)", type: "number", width: 50 },
                { id: "height", label: "Рост (см)", type: "number", width: 50 },
                {
                  id: "head_circ",
                  label: "Окружность головы (см)",
                  type: "number",
                  width: 50,
                },
                {
                  id: "development",
                  label: "Физическое развитие",
                  type: "select",
                  options: [
                    "Соответствует возрасту",
                    "Отставание",
                    "Опережение",
                  ],
                },
              ],
            },
            {
              id: "s3",
              title: "Осмотр",
              fields: [
                { id: "temp", label: "Температура (°C)", type: "number" },
                { id: "skin", label: "Кожные покровы", type: "textarea" },
                { id: "throat", label: "Зев", type: "textarea" },
                { id: "lungs", label: "Лёгкие", type: "textarea" },
              ],
            },
            {
              id: "s4",
              title: "Заключение",
              fields: [
                {
                  id: "diagnosis",
                  label: "Диагноз",
                  type: "textarea",
                  required: true,
                },
                { id: "treatment", label: "Лечение", type: "textarea" },
              ],
            },
          ],
        }),
      },
      {
        name: "Осмотр хирурга",
        description: "Шаблон для консультации хирурга",
        content: JSON.stringify({
          version: 1,
          sections: [
            {
              id: "s1",
              title: "Жалобы",
              fields: [
                {
                  id: "complaints",
                  label: "Жалобы",
                  type: "textarea",
                  required: true,
                },
                {
                  id: "pain_location",
                  label: "Локализация боли",
                  type: "text",
                },
                {
                  id: "pain_character",
                  label: "Характер боли",
                  type: "select",
                  options: [
                    "Острая",
                    "Тупая",
                    "Ноющая",
                    "Колющая",
                    "Схваткообразная",
                  ],
                },
              ],
            },
            {
              id: "s2",
              title: "Анамнез",
              fields: [
                {
                  id: "disease_history",
                  label: "Анамнез заболевания",
                  type: "textarea",
                },
                {
                  id: "surgeries",
                  label: "Перенесённые операции",
                  type: "textarea",
                },
                {
                  id: "allergies",
                  label: "Аллергии",
                  type: "tags",
                  options: ["Лекарства", "Пища", "Латекс", "Контраст"],
                },
              ],
            },
            {
              id: "s3",
              title: "Осмотр",
              fields: [
                { id: "inspection", label: "Осмотр", type: "textarea" },
                { id: "palpation", label: "Пальпация", type: "textarea" },
                { id: "percussion", label: "Перкуссия", type: "textarea" },
              ],
            },
            {
              id: "s4",
              title: "Заключение",
              fields: [
                {
                  id: "diagnosis",
                  label: "Диагноз",
                  type: "textarea",
                  required: true,
                },
                {
                  id: "surgery_needed",
                  label: "Показания к операции",
                  type: "select",
                  options: ["Нет", "Плановая", "Экстренная"],
                },
                {
                  id: "recommendations",
                  label: "Рекомендации",
                  type: "textarea",
                },
              ],
            },
          ],
        }),
      },
      {
        name: "Осмотр офтальмолога",
        description: "Шаблон для консультации офтальмолога",
        content: JSON.stringify({
          version: 1,
          sections: [
            {
              id: "s1",
              title: "Жалобы",
              fields: [
                {
                  id: "complaints",
                  label: "Жалобы",
                  type: "textarea",
                  required: true,
                },
                {
                  id: "vision_decrease",
                  label: "Снижение зрения",
                  type: "checkbox",
                },
                { id: "eye_pain", label: "Боль в глазах", type: "checkbox" },
              ],
            },
            {
              id: "s2",
              title: "Острота зрения",
              fields: [
                {
                  id: "vis_od",
                  label: "Vis OD (правый)",
                  type: "text",
                  width: 50,
                },
                {
                  id: "vis_os",
                  label: "Vis OS (левый)",
                  type: "text",
                  width: 50,
                },
                {
                  id: "vis_od_corr",
                  label: "С коррекцией OD",
                  type: "text",
                  width: 50,
                },
                {
                  id: "vis_os_corr",
                  label: "С коррекцией OS",
                  type: "text",
                  width: 50,
                },
              ],
            },
            {
              id: "s3",
              title: "Тонометрия",
              fields: [
                {
                  id: "iop_od",
                  label: "ВГД OD (мм рт.ст.)",
                  type: "number",
                  width: 50,
                },
                {
                  id: "iop_os",
                  label: "ВГД OS (мм рт.ст.)",
                  type: "number",
                  width: 50,
                },
              ],
            },
            {
              id: "s4",
              title: "Заключение",
              fields: [
                {
                  id: "diagnosis",
                  label: "Диагноз",
                  type: "textarea",
                  required: true,
                },
                { id: "treatment", label: "Лечение", type: "textarea" },
              ],
            },
          ],
        }),
      },
      {
        name: "Осмотр ЛОР-врача",
        description: "Шаблон для консультации оториноларинголога",
        content: JSON.stringify({
          version: 1,
          sections: [
            {
              id: "s1",
              title: "Жалобы",
              fields: [
                {
                  id: "complaints",
                  label: "Жалобы",
                  type: "textarea",
                  required: true,
                },
                {
                  id: "nasal_congestion",
                  label: "Заложенность носа",
                  type: "checkbox",
                },
                { id: "sore_throat", label: "Боль в горле", type: "checkbox" },
                {
                  id: "hearing_loss",
                  label: "Снижение слуха",
                  type: "checkbox",
                },
              ],
            },
            {
              id: "s2",
              title: "Осмотр",
              fields: [
                {
                  id: "nose_mucosa",
                  label: "Слизистая носа",
                  type: "textarea",
                },
                {
                  id: "septum",
                  label: "Перегородка",
                  type: "select",
                  options: [
                    "По средней линии",
                    "Искривлена влево",
                    "Искривлена вправо",
                  ],
                },
                { id: "tonsils", label: "Миндалины", type: "textarea" },
                {
                  id: "hearing_test",
                  label: "Слуховая функция",
                  type: "textarea",
                },
              ],
            },
            {
              id: "s3",
              title: "Заключение",
              fields: [
                {
                  id: "diagnosis",
                  label: "Диагноз",
                  type: "textarea",
                  required: true,
                },
                { id: "treatment", label: "Лечение", type: "textarea" },
              ],
            },
          ],
        }),
      },
      {
        name: "Осмотр гинеколога",
        description: "Шаблон для консультации гинеколога",
        content: JSON.stringify({
          version: 1,
          sections: [
            {
              id: "s1",
              title: "Жалобы",
              fields: [
                {
                  id: "complaints",
                  label: "Жалобы",
                  type: "textarea",
                  required: true,
                },
              ],
            },
            {
              id: "s2",
              title: "Анамнез",
              fields: [
                { id: "menarche", label: "Менархе (возраст)", type: "number" },
                { id: "cycle", label: "Менструальный цикл", type: "text" },
                {
                  id: "last_period",
                  label: "Последняя менструация",
                  type: "date",
                },
                {
                  id: "pregnancies",
                  label: "Беременности",
                  type: "number",
                  width: 50,
                },
                { id: "deliveries", label: "Роды", type: "number", width: 50 },
              ],
            },
            {
              id: "s3",
              title: "Осмотр",
              fields: [
                {
                  id: "external",
                  label: "Наружные половые органы",
                  type: "textarea",
                },
                { id: "uterus", label: "Матка", type: "textarea" },
                { id: "appendages", label: "Придатки", type: "textarea" },
              ],
            },
            {
              id: "s4",
              title: "Заключение",
              fields: [
                {
                  id: "diagnosis",
                  label: "Диагноз",
                  type: "textarea",
                  required: true,
                },
                { id: "treatment", label: "Лечение", type: "textarea" },
              ],
            },
          ],
        }),
      },
      {
        name: "Осмотр эндокринолога",
        description: "Шаблон для консультации эндокринолога",
        content: JSON.stringify({
          version: 1,
          sections: [
            {
              id: "s1",
              title: "Жалобы",
              fields: [
                {
                  id: "complaints",
                  label: "Жалобы",
                  type: "textarea",
                  required: true,
                },
                {
                  id: "weight_change",
                  label: "Изменение веса",
                  type: "checkbox",
                },
                { id: "thirst", label: "Жажда", type: "checkbox" },
                { id: "fatigue", label: "Утомляемость", type: "checkbox" },
              ],
            },
            {
              id: "s2",
              title: "Анамнез",
              fields: [
                {
                  id: "endocrine_history",
                  label: "Эндокринный анамнез",
                  type: "textarea",
                },
                {
                  id: "family_history",
                  label: "Семейный анамнез",
                  type: "textarea",
                },
                {
                  id: "medications",
                  label: "Принимаемые препараты",
                  type: "tags",
                  options: [
                    "Метформин",
                    "Инсулин",
                    "Тироксин",
                    "Ингибиторы ДПП-4",
                  ],
                },
              ],
            },
            {
              id: "s3",
              title: "Осмотр",
              fields: [
                { id: "weight", label: "Вес (кг)", type: "number", width: 50 },
                { id: "height", label: "Рост (см)", type: "number", width: 50 },
                { id: "bmi", label: "ИМТ", type: "number", width: 50 },
                {
                  id: "waist",
                  label: "Окружность талии (см)",
                  type: "number",
                  width: 50,
                },
                { id: "thyroid", label: "Щитовидная железа", type: "textarea" },
              ],
            },
            {
              id: "s4",
              title: "Заключение",
              fields: [
                {
                  id: "diagnosis",
                  label: "Диагноз",
                  type: "textarea",
                  required: true,
                },
                { id: "treatment", label: "Лечение", type: "textarea" },
                {
                  id: "diet",
                  label: "Диетические рекомендации",
                  type: "textarea",
                },
              ],
            },
          ],
        }),
      },
      {
        name: "Осмотр уролога",
        description: "Шаблон для консультации уролога",
        content: JSON.stringify({
          version: 1,
          sections: [
            {
              id: "s1",
              title: "Жалобы",
              fields: [
                {
                  id: "complaints",
                  label: "Жалобы",
                  type: "textarea",
                  required: true,
                },
                { id: "dysuria", label: "Дизурия", type: "checkbox" },
                {
                  id: "frequency",
                  label: "Учащённое мочеиспускание",
                  type: "checkbox",
                },
                { id: "nocturia", label: "Ноктурия", type: "checkbox" },
                { id: "hematuria", label: "Гематурия", type: "checkbox" },
              ],
            },
            {
              id: "s2",
              title: "Осмотр",
              fields: [
                { id: "kidneys", label: "Почки", type: "textarea" },
                { id: "bladder", label: "Мочевой пузырь", type: "textarea" },
                {
                  id: "prostate",
                  label: "Предстательная железа",
                  type: "textarea",
                },
              ],
            },
            {
              id: "s3",
              title: "Заключение",
              fields: [
                {
                  id: "diagnosis",
                  label: "Диагноз",
                  type: "textarea",
                  required: true,
                },
                { id: "treatment", label: "Лечение", type: "textarea" },
              ],
            },
          ],
        }),
      },
    ];

    let count = 0;
    for (const template of templates) {
      const existing = await this.prisma.protocolTemplate.findFirst({
        where: { name: template.name, organizationId },
      });

      if (!existing) {
        await this.prisma.protocolTemplate.create({
          data: { ...template, organizationId },
        });
        count++;
      } else {
        await this.prisma.protocolTemplate.update({
          where: { id: existing.id },
          data: {
            description: template.description,
            content: template.content,
            templateType: "formbuilder",
            isActive: true,
          },
        });
      }
    }

    return count;
  }

  // =====================================
  // ANALYSIS TEMPLATES
  // =====================================
  private async createAnalysisTemplates(
    organizationId: string
  ): Promise<number> {
    const templates = [
      {
        name: "Общий анализ крови (ОАК)",
        code: "OAK",
        description: "Клинический анализ крови",
        content: JSON.stringify({
          version: 1,
          sections: [
            {
              id: "s1",
              title: "Эритроцитарные показатели",
              parameters: [
                {
                  id: "hgb",
                  name: "Гемоглобин",
                  unit: "г/л",
                  type: "NUMBER",
                  isRequired: true,
                  referenceRanges: {
                    men: { min: 130, max: 160 },
                    women: { min: 120, max: 150 },
                  },
                },
                {
                  id: "rbc",
                  name: "Эритроциты",
                  unit: "×10¹²/л",
                  type: "NUMBER",
                  isRequired: true,
                  referenceRanges: {
                    men: { min: 4.0, max: 5.5 },
                    women: { min: 3.5, max: 5.0 },
                  },
                },
                {
                  id: "hct",
                  name: "Гематокрит",
                  unit: "%",
                  type: "NUMBER",
                  isRequired: true,
                  referenceRanges: {
                    men: { min: 40, max: 48 },
                    women: { min: 36, max: 42 },
                  },
                },
              ],
            },
            {
              id: "s2",
              title: "Лейкоцитарные показатели",
              parameters: [
                {
                  id: "wbc",
                  name: "Лейкоциты",
                  unit: "×10⁹/л",
                  type: "NUMBER",
                  isRequired: true,
                  referenceRanges: { default: { min: 4.0, max: 9.0 } },
                },
                {
                  id: "neut",
                  name: "Нейтрофилы",
                  unit: "%",
                  type: "NUMBER",
                  isRequired: true,
                  referenceRanges: { default: { min: 47, max: 72 } },
                },
                {
                  id: "lymph",
                  name: "Лимфоциты",
                  unit: "%",
                  type: "NUMBER",
                  isRequired: true,
                  referenceRanges: { default: { min: 19, max: 37 } },
                },
              ],
            },
            {
              id: "s3",
              title: "Тромбоциты и СОЭ",
              parameters: [
                {
                  id: "plt",
                  name: "Тромбоциты",
                  unit: "×10⁹/л",
                  type: "NUMBER",
                  isRequired: true,
                  referenceRanges: { default: { min: 150, max: 400 } },
                },
                {
                  id: "esr",
                  name: "СОЭ",
                  unit: "мм/ч",
                  type: "NUMBER",
                  isRequired: true,
                  referenceRanges: {
                    men: { min: 2, max: 10 },
                    women: { min: 2, max: 15 },
                  },
                },
              ],
            },
          ],
        }),
      },
      {
        name: "Биохимический анализ крови",
        code: "BIO",
        description: "Базовая биохимия",
        content: JSON.stringify({
          version: 1,
          sections: [
            {
              id: "s1",
              title: "Углеводный обмен",
              parameters: [
                {
                  id: "glucose",
                  name: "Глюкоза",
                  unit: "ммоль/л",
                  type: "NUMBER",
                  isRequired: true,
                  referenceRanges: { default: { min: 3.9, max: 6.1 } },
                },
              ],
            },
            {
              id: "s2",
              title: "Функция почек",
              parameters: [
                {
                  id: "creat",
                  name: "Креатинин",
                  unit: "мкмоль/л",
                  type: "NUMBER",
                  isRequired: true,
                  referenceRanges: {
                    men: { min: 62, max: 115 },
                    women: { min: 53, max: 97 },
                  },
                },
                {
                  id: "urea",
                  name: "Мочевина",
                  unit: "ммоль/л",
                  type: "NUMBER",
                  isRequired: true,
                  referenceRanges: { default: { min: 2.5, max: 8.3 } },
                },
              ],
            },
            {
              id: "s3",
              title: "Функция печени",
              parameters: [
                {
                  id: "alt",
                  name: "АЛТ",
                  unit: "Ед/л",
                  type: "NUMBER",
                  isRequired: true,
                  referenceRanges: {
                    men: { min: 0, max: 41 },
                    women: { min: 0, max: 31 },
                  },
                },
                {
                  id: "ast",
                  name: "АСТ",
                  unit: "Ед/л",
                  type: "NUMBER",
                  isRequired: true,
                  referenceRanges: {
                    men: { min: 0, max: 37 },
                    women: { min: 0, max: 31 },
                  },
                },
                {
                  id: "bili",
                  name: "Билирубин общий",
                  unit: "мкмоль/л",
                  type: "NUMBER",
                  isRequired: true,
                  referenceRanges: { default: { min: 3.4, max: 20.5 } },
                },
              ],
            },
          ],
        }),
      },
      {
        name: "Липидный профиль",
        code: "LIPID",
        description: "Анализ липидного спектра",
        content: JSON.stringify({
          version: 1,
          sections: [
            {
              id: "s1",
              title: "Липиды",
              parameters: [
                {
                  id: "chol",
                  name: "Холестерин общий",
                  unit: "ммоль/л",
                  type: "NUMBER",
                  isRequired: true,
                  referenceRanges: { default: { min: 0, max: 5.2 } },
                },
                {
                  id: "trig",
                  name: "Триглицериды",
                  unit: "ммоль/л",
                  type: "NUMBER",
                  isRequired: true,
                  referenceRanges: { default: { min: 0, max: 1.7 } },
                },
                {
                  id: "hdl",
                  name: "ЛПВП",
                  unit: "ммоль/л",
                  type: "NUMBER",
                  isRequired: true,
                  referenceRanges: {
                    men: { min: 1.0, max: 999 },
                    women: { min: 1.2, max: 999 },
                  },
                },
                {
                  id: "ldl",
                  name: "ЛПНП",
                  unit: "ммоль/л",
                  type: "NUMBER",
                  isRequired: true,
                  referenceRanges: { default: { min: 0, max: 3.0 } },
                },
              ],
            },
          ],
        }),
      },
      {
        name: "Общий анализ мочи",
        code: "OAM",
        description: "Клинический анализ мочи",
        content: JSON.stringify({
          version: 1,
          sections: [
            {
              id: "s1",
              title: "Физические свойства",
              parameters: [
                {
                  id: "color",
                  name: "Цвет",
                  unit: "",
                  type: "TEXT",
                  isRequired: true,
                },
                {
                  id: "sg",
                  name: "Плотность",
                  unit: "",
                  type: "NUMBER",
                  isRequired: true,
                  referenceRanges: { default: { min: 1.01, max: 1.025 } },
                },
                {
                  id: "ph",
                  name: "pH",
                  unit: "",
                  type: "NUMBER",
                  isRequired: true,
                  referenceRanges: { default: { min: 5.0, max: 7.0 } },
                },
              ],
            },
            {
              id: "s2",
              title: "Химические свойства",
              parameters: [
                {
                  id: "protein",
                  name: "Белок",
                  unit: "г/л",
                  type: "NUMBER",
                  isRequired: true,
                  referenceRanges: { default: { min: 0, max: 0.033 } },
                },
                {
                  id: "glucose_u",
                  name: "Глюкоза",
                  unit: "ммоль/л",
                  type: "NUMBER",
                  isRequired: true,
                },
              ],
            },
            {
              id: "s3",
              title: "Микроскопия",
              parameters: [
                {
                  id: "rbc_u",
                  name: "Эритроциты",
                  unit: "в п/зр",
                  type: "NUMBER",
                  isRequired: true,
                  referenceRanges: { default: { min: 0, max: 2 } },
                },
                {
                  id: "wbc_u",
                  name: "Лейкоциты",
                  unit: "в п/зр",
                  type: "NUMBER",
                  isRequired: true,
                  referenceRanges: {
                    men: { min: 0, max: 3 },
                    women: { min: 0, max: 5 },
                  },
                },
              ],
            },
          ],
        }),
      },
      {
        name: "Коагулограмма",
        code: "COAG",
        description: "Исследование гемостаза",
        content: JSON.stringify({
          version: 1,
          sections: [
            {
              id: "s1",
              title: "Показатели свёртывания",
              parameters: [
                {
                  id: "pt",
                  name: "Протромбиновое время",
                  unit: "сек",
                  type: "NUMBER",
                  isRequired: true,
                  referenceRanges: { default: { min: 11, max: 15 } },
                },
                {
                  id: "inr",
                  name: "МНО",
                  unit: "",
                  type: "NUMBER",
                  isRequired: true,
                  referenceRanges: { default: { min: 0.85, max: 1.15 } },
                },
                {
                  id: "aptt",
                  name: "АЧТВ",
                  unit: "сек",
                  type: "NUMBER",
                  isRequired: true,
                  referenceRanges: { default: { min: 25, max: 37 } },
                },
                {
                  id: "fibr",
                  name: "Фибриноген",
                  unit: "г/л",
                  type: "NUMBER",
                  isRequired: true,
                  referenceRanges: { default: { min: 2.0, max: 4.0 } },
                },
              ],
            },
          ],
        }),
      },
      {
        name: "Гормоны щитовидной железы",
        code: "THYROID",
        description: "Тиреоидный профиль",
        content: JSON.stringify({
          version: 1,
          sections: [
            {
              id: "s1",
              title: "Тиреоидные гормоны",
              parameters: [
                {
                  id: "tsh",
                  name: "ТТГ",
                  unit: "мМЕ/л",
                  type: "NUMBER",
                  isRequired: true,
                  referenceRanges: { default: { min: 0.4, max: 4.0 } },
                },
                {
                  id: "t4f",
                  name: "Т4 свободный",
                  unit: "пмоль/л",
                  type: "NUMBER",
                  isRequired: true,
                  referenceRanges: { default: { min: 10.3, max: 24.5 } },
                },
                {
                  id: "t3f",
                  name: "Т3 свободный",
                  unit: "пмоль/л",
                  type: "NUMBER",
                  isRequired: false,
                  referenceRanges: { default: { min: 2.6, max: 5.7 } },
                },
              ],
            },
          ],
        }),
      },
      {
        name: "Гликемический профиль",
        code: "GLYC",
        description: "Контроль уровня глюкозы",
        content: JSON.stringify({
          version: 1,
          sections: [
            {
              id: "s1",
              title: "Показатели гликемии",
              parameters: [
                {
                  id: "gluc_f",
                  name: "Глюкоза натощак",
                  unit: "ммоль/л",
                  type: "NUMBER",
                  isRequired: true,
                  referenceRanges: { default: { min: 3.9, max: 6.1 } },
                },
                {
                  id: "hba1c",
                  name: "HbA1c",
                  unit: "%",
                  type: "NUMBER",
                  isRequired: true,
                  referenceRanges: { default: { min: 4.0, max: 6.0 } },
                },
                {
                  id: "insulin",
                  name: "Инсулин",
                  unit: "мкЕд/мл",
                  type: "NUMBER",
                  isRequired: false,
                  referenceRanges: { default: { min: 2.6, max: 24.9 } },
                },
              ],
            },
          ],
        }),
      },
      {
        name: "Электролиты крови",
        code: "ELEC",
        description: "Электролитный состав",
        content: JSON.stringify({
          version: 1,
          sections: [
            {
              id: "s1",
              title: "Электролиты",
              parameters: [
                {
                  id: "na",
                  name: "Натрий",
                  unit: "ммоль/л",
                  type: "NUMBER",
                  isRequired: true,
                  referenceRanges: { default: { min: 136, max: 145 } },
                },
                {
                  id: "k",
                  name: "Калий",
                  unit: "ммоль/л",
                  type: "NUMBER",
                  isRequired: true,
                  referenceRanges: { default: { min: 3.5, max: 5.1 } },
                },
                {
                  id: "ca",
                  name: "Кальций общий",
                  unit: "ммоль/л",
                  type: "NUMBER",
                  isRequired: true,
                  referenceRanges: { default: { min: 2.15, max: 2.55 } },
                },
                {
                  id: "fe",
                  name: "Железо",
                  unit: "мкмоль/л",
                  type: "NUMBER",
                  isRequired: false,
                  referenceRanges: {
                    men: { min: 11.6, max: 31.3 },
                    women: { min: 9.0, max: 30.4 },
                  },
                },
              ],
            },
          ],
        }),
      },
      {
        name: "Маркеры воспаления",
        code: "INFLAM",
        description: "Показатели воспаления",
        content: JSON.stringify({
          version: 1,
          sections: [
            {
              id: "s1",
              title: "Маркеры",
              parameters: [
                {
                  id: "crp",
                  name: "С-реактивный белок",
                  unit: "мг/л",
                  type: "NUMBER",
                  isRequired: true,
                  referenceRanges: { default: { min: 0, max: 5 } },
                },
                {
                  id: "rf",
                  name: "Ревматоидный фактор",
                  unit: "МЕ/мл",
                  type: "NUMBER",
                  isRequired: false,
                  referenceRanges: { default: { min: 0, max: 14 } },
                },
                {
                  id: "ferr",
                  name: "Ферритин",
                  unit: "нг/мл",
                  type: "NUMBER",
                  isRequired: false,
                  referenceRanges: {
                    men: { min: 20, max: 250 },
                    women: { min: 10, max: 120 },
                  },
                },
              ],
            },
          ],
        }),
      },
      {
        name: "Кардиомаркеры",
        code: "CARDIO",
        description: "Маркеры повреждения миокарда",
        content: JSON.stringify({
          version: 1,
          sections: [
            {
              id: "s1",
              title: "Кардиоспецифические маркеры",
              parameters: [
                {
                  id: "trop",
                  name: "Тропонин I",
                  unit: "нг/мл",
                  type: "NUMBER",
                  isRequired: true,
                  referenceRanges: { default: { min: 0, max: 0.04 } },
                },
                {
                  id: "cpk",
                  name: "КФК общая",
                  unit: "Ед/л",
                  type: "NUMBER",
                  isRequired: true,
                  referenceRanges: {
                    men: { min: 39, max: 308 },
                    women: { min: 26, max: 192 },
                  },
                },
                {
                  id: "cpkmb",
                  name: "КФК-МВ",
                  unit: "Ед/л",
                  type: "NUMBER",
                  isRequired: true,
                  referenceRanges: { default: { min: 0, max: 25 } },
                },
                {
                  id: "bnp",
                  name: "NT-proBNP",
                  unit: "пг/мл",
                  type: "NUMBER",
                  isRequired: false,
                  referenceRanges: { default: { min: 0, max: 125 } },
                },
              ],
            },
          ],
        }),
      },
    ];

    let count = 0;
    for (const template of templates) {
      const existing = await this.prisma.analysisTemplate.findFirst({
        where: { code: template.code, organizationId },
      });

      if (!existing) {
        await this.prisma.analysisTemplate.create({
          data: { ...template, organizationId },
        });
        count++;
      }
    }

    return count;
  }

  // =====================================
  // ROLES
  // =====================================
  private async createRoles(organizationId: string): Promise<number> {
    const rolesSeed = new RolesSeed(this.prisma);
    const result = await rolesSeed.seedDefaultRoles(organizationId);
    return result.summary.created;
  }

  private async assignRolesToDoctors(
    organizationId: string,
    doctors: Employee[]
  ): Promise<void> {
    const doctorRole = await this.prisma.role.findFirst({
      where: { name: "Врач", organizationId },
    });

    if (!doctorRole) return;

    for (const doctor of doctors) {
      if (!doctor.userId) continue;

      const existing = await this.prisma.userRole_Assignment.findFirst({
        where: { userId: doctor.userId, roleId: doctorRole.id },
      });

      if (!existing) {
        await this.prisma.userRole_Assignment.create({
          data: {
            userId: doctor.userId,
            roleId: doctorRole.id,
          },
        });
      }
    }
  }

  // =====================================
  // VISITS
  // =====================================
  private async createVisits(
    organizationId: string,
    doctors: Employee[],
    patients: Patient[]
  ): Promise<Visit[]> {
    const visits: Visit[] = [];
    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    const randomBetween = (min: number, max: number): number => {
      return min + Math.floor(Math.random() * (max - min + 1));
    };

    // Check existing visits count
    const existingCount = await this.prisma.visit.count({
      where: { organizationId },
    });
    if (existingCount > 20) {
      console.log("⏭️  Visits already exist, fetching existing...");
      return this.prisma.visit.findMany({
        where: { organizationId },
        take: 50,
      });
    }

    // Counter for visit IDs
    let visitCounter = 0;

    // Create visits for last 7 days + today
    for (let dayOffset = 0; dayOffset <= 7; dayOffset++) {
      const visitDate = new Date(now);
      visitDate.setDate(visitDate.getDate() - dayOffset);
      visitDate.setHours(9, 0, 0, 0);

      // 3-5 visits per day per active doctor (first 5 doctors)
      const activeDoctors = doctors.slice(0, 5);

      for (const doctor of activeDoctors) {
        const visitsPerDay = 3 + Math.floor(Math.random() * 3); // 3-5 visits

        for (let v = 0; v < visitsPerDay; v++) {
          const patient = patients[Math.floor(Math.random() * patients.length)];
          let visitTime = new Date(visitDate);
          visitTime.setHours(9 + v * 2, Math.floor(Math.random() * 60), 0, 0);

          // Determine status based on day
          let status: VisitStatus;
          let queuedAt: Date | null = null;
          let startedAt: Date | null = null;
          let completedAt: Date | null = null;
          let waitingTimeMinutes: number | null = null;
          let serviceTimeMinutes: number | null = null;

          if (dayOffset === 0) {
            // Today: mix of statuses
            const rand = Math.random();
            if (rand < 0.3) {
              status = VisitStatus.WAITING;
              queuedAt = visitTime;
            } else if (rand < 0.5) {
              status = VisitStatus.IN_PROGRESS;
              queuedAt = visitTime;
              startedAt = new Date(visitTime.getTime() + 15 * 60000);
              waitingTimeMinutes = 15;
            } else {
              status = VisitStatus.COMPLETED;
              queuedAt = visitTime;
              startedAt = new Date(visitTime.getTime() + 10 * 60000);
              completedAt = new Date(startedAt.getTime() + 25 * 60000);
              waitingTimeMinutes = 10;
              serviceTimeMinutes = 25;
            }

            // Ensure "today" visits are not in the future to avoid negative waiting times
            switch (status) {
              case VisitStatus.WAITING: {
                const minutesAgo = randomBetween(5, 40);
                visitTime = new Date(now.getTime() - minutesAgo * 60000);
                queuedAt = visitTime;
                waitingTimeMinutes = minutesAgo;
                startedAt = null;
                completedAt = null;
                serviceTimeMinutes = null;
                break;
              }
              case VisitStatus.IN_PROGRESS: {
                const waitMinutes = randomBetween(8, 18);
                const startedMinutesAgo = randomBetween(5, 25);
                startedAt = new Date(now.getTime() - startedMinutesAgo * 60000);
                queuedAt = new Date(startedAt.getTime() - waitMinutes * 60000);
                visitTime = queuedAt;
                waitingTimeMinutes = waitMinutes;
                serviceTimeMinutes = null;
                completedAt = null;
                break;
              }
              case VisitStatus.COMPLETED: {
                const waitMinutes = randomBetween(8, 15);
                const serviceMinutes = randomBetween(20, 35);
                const completedMinutesAgo = randomBetween(10, 120);
                completedAt = new Date(
                  now.getTime() - completedMinutesAgo * 60000
                );
                startedAt = new Date(
                  completedAt.getTime() - serviceMinutes * 60000
                );
                queuedAt = new Date(startedAt.getTime() - waitMinutes * 60000);
                visitTime = queuedAt;
                waitingTimeMinutes = waitMinutes;
                serviceTimeMinutes = serviceMinutes;
                break;
              }
            }

            if (queuedAt && queuedAt < startOfToday) {
              const shift = startOfToday.getTime() - queuedAt.getTime();
              queuedAt = startOfToday;
              if (startedAt) {
                startedAt = new Date(startedAt.getTime() + shift);
              }
              if (completedAt) {
                completedAt = new Date(completedAt.getTime() + shift);
              }
              visitTime = queuedAt;
            }
          } else {
            // Past days: all completed
            status = VisitStatus.COMPLETED;
            queuedAt = visitTime;
            startedAt = new Date(visitTime.getTime() + 10 * 60000);
            completedAt = new Date(startedAt.getTime() + 25 * 60000);
            waitingTimeMinutes = 10;
            serviceTimeMinutes = 25;
          }

          visitCounter++;
          const visitId = generateEntityIdSync(
            ENTITY_PREFIXES.VISIT,
            visitCounter,
            visitTime
          );

          // Get medical data for completed visits
          const medicalData =
            status === VisitStatus.COMPLETED
              ? this.getRandomMedicalData()
              : {
                  complaint: null,
                  anamnesis: null,
                  diagnosis: null,
                  conclusion: null,
                };

          const visit = await this.prisma.visit.create({
            data: {
              visitId,
              visitDate: visitTime,
              status,
              type:
                Math.random() > 0.9 ? VisitType.EMERGENCY : VisitType.STANDARD,
              notes: this.getRandomVisitNotes(),
              complaint: medicalData.complaint,
              anamnesis: medicalData.anamnesis,
              diagnosis: medicalData.diagnosis,
              conclusion: medicalData.conclusion,
              queuedAt,
              startedAt,
              completedAt,
              waitingTimeMinutes,
              serviceTimeMinutes,
              organizationId,
              patientId: patient.id,
              employeeId: doctor.id,
            },
          });

          visits.push(visit);
        }
      }
    }

    return visits;
  }

  private getRandomVisitNotes(): string | null {
    const notes = [
      "Плановый осмотр",
      "Жалобы на головную боль",
      "Повторный приём",
      "Консультация по результатам анализов",
      "Профилактический осмотр",
      null,
    ];
    return notes[Math.floor(Math.random() * notes.length)];
  }

  private getRandomMedicalData(): {
    complaint: string | null;
    anamnesis: string | null;
    diagnosis: string | null;
    conclusion: string | null;
  } {
    const medicalCases = [
      {
        complaint:
          "Головная боль, головокружение, повышенное артериальное давление",
        anamnesis:
          "Болеет около 3 лет. Периодически принимает гипотензивные препараты. Последнее ухудшение 2 дня назад.",
        diagnosis: "I10 Эссенциальная (первичная) гипертензия",
        conclusion:
          "Рекомендовано: соблюдение диеты с ограничением соли, ежедневный контроль АД, приём эналаприла 10мг 2р/д. Повторный осмотр через 2 недели.",
      },
      {
        complaint: "Боли в горле, кашель, повышение температуры до 38.2°C",
        anamnesis:
          "Заболел 3 дня назад после переохлаждения. Принимал парацетамол с временным эффектом.",
        diagnosis: "J06.9 Острая инфекция верхних дыхательных путей",
        conclusion:
          "Назначено: постельный режим, обильное тёплое питьё, парацетамол 500мг при t>38.5°C, полоскание горла. Больничный лист на 5 дней.",
      },
      {
        complaint: "Боли в эпигастральной области, изжога после еды",
        anamnesis:
          "Жалобы беспокоят около 2 месяцев. Связывает с нерегулярным питанием. Антациды принимал без эффекта.",
        diagnosis: "K29.7 Гастрит неуточненный",
        conclusion:
          "Рекомендовано: ЭФГДС, диета стол №1, омепразол 20мг 2р/д за 30 мин до еды. Контроль через 2 недели.",
      },
      {
        complaint: "Боли в пояснице с иррадиацией в левую ногу, онемение",
        anamnesis:
          "Боли беспокоят около недели после подъёма тяжести. Применял мази местно без эффекта.",
        diagnosis: "M54.5 Боль внизу спины (люмбалгия)",
        conclusion:
          "Назначено: МРТ поясничного отдела, диклофенак 75мг в/м №5, мидокалм 150мг 2р/д, ограничение физических нагрузок.",
      },
      {
        complaint: "Слабость, сухость во рту, частое мочеиспускание, жажда",
        anamnesis:
          "Жалобы появились около месяца назад. Отмечает похудание на 3 кг. Семейный анамнез: мать болеет СД 2 типа.",
        diagnosis: "E11.9 Сахарный диабет 2 типа без осложнений",
        conclusion:
          "Контроль гликемии натощак, HbA1c. Диета с ограничением углеводов, метформин 500мг 2р/д с едой. Повторный осмотр через 1 месяц с результатами анализов.",
      },
      {
        complaint: "Одышка при физической нагрузке, отёки на ногах к вечеру",
        anamnesis:
          "Страдает гипертонической болезнью 10 лет. Лечение нерегулярное. Ухудшение состояния последнюю неделю.",
        diagnosis: "I50.9 Сердечная недостаточность неуточненная",
        conclusion:
          "ЭхоКГ, ЭКГ, БАК. Фуросемид 40мг утром, эналаприл 10мг 2р/д, ограничение жидкости до 1.5л/сут. Контроль веса ежедневно.",
      },
      {
        complaint: "Насморк, заложенность носа, чихание, слезотечение",
        anamnesis:
          "Симптомы появляются ежегодно весной. Ранее не обследовался.",
        diagnosis: "J30.1 Аллергический ринит, вызванный пыльцой растений",
        conclusion:
          "Аллергопробы, риноскопия. Цетиризин 10мг 1р/д, назонекс 2 впрыска 2р/д. Избегать контакта с аллергенами.",
      },
      {
        complaint: "Боли в правом подреберье после приёма жирной пищи, тошнота",
        anamnesis:
          "Боли беспокоят периодически около года. Диету не соблюдает.",
        diagnosis: "K80.2 Камни желчного пузыря без холецистита",
        conclusion:
          "УЗИ ОБП, БАК. Диета стол №5, урсосан 250мг 2р/д. Консультация хирурга при ухудшении.",
      },
      {
        complaint: "Общая слабость, утомляемость, сонливость, выпадение волос",
        anamnesis: "Жалобы около 3 месяцев. Связывает со стрессом на работе.",
        diagnosis: "E03.9 Гипотиреоз неуточненный",
        conclusion:
          "ТТГ, Т4 свободный, УЗИ щитовидной железы. Левотироксин 50мкг утром натощак после получения результатов. Контроль ТТГ через 6 недель.",
      },
      {
        complaint: "Боли в коленных суставах, утренняя скованность",
        anamnesis:
          "Боли беспокоят несколько лет, постепенно нарастают. Хуже в холодную погоду.",
        diagnosis: "M17.9 Гонартроз неуточненный",
        conclusion:
          "Рентген коленных суставов. Хондропротекторы, НПВС местно, ЛФК, снижение веса. Консультация ортопеда.",
      },
    ];

    // 80% chance to have medical data for completed visits
    if (Math.random() > 0.8) {
      return {
        complaint: null,
        anamnesis: null,
        diagnosis: null,
        conclusion: null,
      };
    }

    return medicalCases[Math.floor(Math.random() * medicalCases.length)];
  }

  // =====================================
  // APPOINTMENTS
  // =====================================
  private async createAppointments(
    organizationId: string,
    doctors: Employee[],
    patients: Patient[],
    services: Service[]
  ): Promise<number> {
    const existingCount = await this.prisma.appointment.count({
      where: { organizationId },
    });
    if (existingCount > 10) return existingCount;

    const now = new Date();
    let count = 0;

    // Get admin user for createdBy
    const adminUser = await this.prisma.user.findFirst({
      where: { organizationId, isActive: true },
    });

    if (!adminUser) return 0;

    // Create appointments for next 7 days
    for (let dayOffset = 1; dayOffset <= 7; dayOffset++) {
      const appointmentDate = new Date(now);
      appointmentDate.setDate(appointmentDate.getDate() + dayOffset);

      // 5-10 appointments per day
      const appointmentsPerDay = 5 + Math.floor(Math.random() * 6);

      for (let a = 0; a < appointmentsPerDay; a++) {
        const doctor = doctors[Math.floor(Math.random() * doctors.length)];
        const patient = patients[Math.floor(Math.random() * patients.length)];
        const service =
          services.find((s) => s.type === ServiceTypeEnum.CONSULTATION) ??
          services[0];

        const scheduledAt = new Date(appointmentDate);
        scheduledAt.setHours(9 + a, Math.floor(Math.random() * 4) * 15, 0, 0);

        const appointmentId = generateEntityIdSync(
          ENTITY_PREFIXES.APPOINTMENT,
          count + 1,
          scheduledAt
        );

        await this.prisma.appointment.create({
          data: {
            appointmentId,
            scheduledAt,
            duration: service.durationMin ?? 30,
            status:
              Math.random() > 0.2
                ? AppointmentStatus.SCHEDULED
                : AppointmentStatus.CONFIRMED,
            reason: this.getRandomAppointmentReason(),
            organizationId,
            patientId: patient.id,
            employeeId: doctor.id,
            serviceId: service.id,
            createdById: adminUser.id,
          },
        });
        count++;
      }
    }

    return count;
  }

  private getRandomAppointmentReason(): string {
    const reasons = [
      "Профилактический осмотр",
      "Консультация по жалобам",
      "Повторный приём",
      "Получение результатов анализов",
      "Плановый осмотр",
      "Первичная консультация",
    ];
    return reasons[Math.floor(Math.random() * reasons.length)];
  }

  // =====================================
  // SERVICE ORDERS
  // =====================================
  private async createServiceOrders(
    organizationId: string,
    doctors: Employee[],
    patients: Patient[],
    services: Service[],
    departments: Department[],
    visits: Visit[]
  ): Promise<ServiceOrder[]> {
    const orders: ServiceOrder[] = [];

    const existingCount = await this.prisma.serviceOrder.count({
      where: { organizationId },
    });
    if (existingCount > 20) {
      return this.prisma.serviceOrder.findMany({
        where: { organizationId },
        take: 50,
      });
    }

    const labServices = services.filter((s) => s.type === ServiceTypeEnum.LAB);
    const diagServices = services.filter(
      (s) => s.type === ServiceTypeEnum.DIAGNOSTIC
    );

    // Create orders for completed visits
    const completedVisits = visits.filter(
      (v) => v.status === VisitStatus.COMPLETED
    );

    for (const visit of completedVisits.slice(0, 30)) {
      const doctor =
        doctors.find((d) => d.id === visit.employeeId) ?? doctors[0];
      const patient = patients.find((p) => p.id === visit.patientId);
      if (!patient) continue;

      // 50% chance of lab order, 30% chance of diagnostic order
      if (Math.random() < 0.5 && labServices.length > 0) {
        const service =
          labServices[Math.floor(Math.random() * labServices.length)];
        const labDept = departments.find((d) => d.code === "LAB");

        const order = await this.prisma.serviceOrder.create({
          data: {
            patientId: patient.id,
            visitId: visit.id,
            doctorId: doctor.id,
            serviceId: service.id,
            departmentId: labDept?.id,
            status: OrderStatus.COMPLETED,
            paymentStatus: PaymentStatus.PAID,
            queueNumber: Math.floor(Math.random() * 50) + 1,
            queueStatus: QueueStatus.COMPLETED,
            queuedAt: visit.queuedAt,
            startedAt: visit.startedAt,
            finishedAt: visit.completedAt,
            resultText: this.getRandomLabResult(),
            resultAt: visit.completedAt,
            organizationId,
          },
        });
        orders.push(order);
      }

      if (Math.random() < 0.3 && diagServices.length > 0) {
        const service =
          diagServices[Math.floor(Math.random() * diagServices.length)];
        const usgDept = departments.find((d) => d.code === "USG");

        const order = await this.prisma.serviceOrder.create({
          data: {
            patientId: patient.id,
            visitId: visit.id,
            doctorId: doctor.id,
            serviceId: service.id,
            departmentId: usgDept?.id,
            status: OrderStatus.COMPLETED,
            paymentStatus: PaymentStatus.PAID,
            queueNumber: Math.floor(Math.random() * 30) + 1,
            queueStatus: QueueStatus.COMPLETED,
            queuedAt: visit.queuedAt,
            startedAt: visit.startedAt,
            finishedAt: visit.completedAt,
            resultText: this.getRandomDiagResult(),
            resultAt: visit.completedAt,
            organizationId,
          },
        });
        orders.push(order);
      }
    }

    // Create some pending orders for today's visits
    const todayVisits = visits.filter(
      (v) =>
        v.status === VisitStatus.WAITING || v.status === VisitStatus.IN_PROGRESS
    );
    for (const visit of todayVisits.slice(0, 5)) {
      const doctor =
        doctors.find((d) => d.id === visit.employeeId) ?? doctors[0];
      const patient = patients.find((p) => p.id === visit.patientId);
      if (!patient) continue;

      if (labServices.length > 0) {
        const service =
          labServices[Math.floor(Math.random() * labServices.length)];
        const labDept = departments.find((d) => d.code === "LAB");

        const order = await this.prisma.serviceOrder.create({
          data: {
            patientId: patient.id,
            visitId: visit.id,
            doctorId: doctor.id,
            serviceId: service.id,
            departmentId: labDept?.id,
            status: OrderStatus.ORDERED,
            paymentStatus: PaymentStatus.UNPAID,
            queueNumber: Math.floor(Math.random() * 10) + 1,
            queueStatus: QueueStatus.WAITING,
            queuedAt: new Date(Date.now() - 2 * 60 * 60000), // 2 hours ago
            organizationId,
          },
        });
        orders.push(order);
      }
    }

    return orders;
  }

  private getRandomLabResult(): string {
    return `Общий анализ крови:
- Гемоглобин: ${120 + Math.floor(Math.random() * 40)} г/л (норма: 120-160)
- Эритроциты: ${4 + Math.random().toFixed(1)} x10^12/л (норма: 4.0-5.5)
- Лейкоциты: ${4 + Math.floor(Math.random() * 6)} x10^9/л (норма: 4-9)
- Тромбоциты: ${180 + Math.floor(Math.random() * 120)} x10^9/л (норма: 180-320)
- СОЭ: ${2 + Math.floor(Math.random() * 15)} мм/ч (норма: 2-15)

Заключение: показатели в пределах нормы`;
  }

  private getRandomDiagResult(): string {
    const results = [
      "УЗИ брюшной полости: Печень не увеличена, контуры ровные. Желчный пузырь без особенностей. Поджелудочная железа не изменена. Селезёнка в норме. Заключение: патологии не выявлено.",
      "ЭКГ: Синусовый ритм, ЧСС 72 уд/мин. ЭОС не отклонена. Признаков нарушения проводимости нет. Заключение: ЭКГ в пределах нормы.",
      "Рентген грудной клетки: Лёгочные поля прозрачные. Корни структурны. Синусы свободны. Сердце в норме. Заключение: патологии не выявлено.",
    ];
    return results[Math.floor(Math.random() * results.length)];
  }

  // =====================================
  // INVOICES AND PAYMENTS
  // =====================================
  private async createInvoicesAndPayments(
    organizationId: string,
    patients: Patient[],
    visits: Visit[],
    serviceOrders: ServiceOrder[],
    doctors: Employee[]
  ): Promise<{ invoices: number; payments: number }> {
    const existingInvoices = await this.prisma.invoice.count({
      where: { organizationId },
    });
    if (existingInvoices > 10)
      return { invoices: existingInvoices, payments: 0 };

    let invoiceCount = 0;
    let paymentCount = 0;

    const cashier = doctors[0]; // Use first doctor as cashier for demo

    // Create invoices for completed visits
    const completedVisits = visits.filter(
      (v) => v.status === VisitStatus.COMPLETED
    );

    for (const visit of completedVisits.slice(0, 20)) {
      const patient = patients.find((p) => p.id === visit.patientId);
      if (!patient) continue;

      const visitOrders = serviceOrders.filter((o) => o.visitId === visit.id);
      if (visitOrders.length === 0) continue;

      // Get services for orders
      const serviceIds = visitOrders.map((o) => o.serviceId);
      const orderServices = await this.prisma.service.findMany({
        where: { id: { in: serviceIds } },
      });

      const totalAmount = orderServices.reduce(
        (sum, s) => sum + (s.price?.toNumber() ?? 0),
        0
      );

      if (totalAmount === 0) continue;

      const invoiceNumber = generateEntityIdSync(
        ENTITY_PREFIXES.INVOICE,
        invoiceCount + 1,
        visit.completedAt ?? undefined
      );

      const invoice = await this.prisma.invoice.create({
        data: {
          invoiceNumber,
          patientId: patient.id,
          visitId: visit.id,
          totalAmount: new Decimal(totalAmount),
          paidAmount: new Decimal(totalAmount),
          status: PaymentStatus.PAID,
          createdById: cashier.id,
          organizationId,
          items: {
            create: visitOrders.map((order) => {
              const service = orderServices.find(
                (s) => s.id === order.serviceId
              );
              const price = service?.price?.toNumber() ?? 0;
              return {
                serviceId: order.serviceId,
                serviceOrderId: order.id,
                description: service?.name ?? "Услуга",
                quantity: 1,
                unitPrice: new Decimal(price),
                totalPrice: new Decimal(price),
              };
            }),
          },
        },
      });

      invoiceCount++;

      // Create payment for invoice
      await this.prisma.payment.create({
        data: {
          invoiceId: invoice.id,
          amount: new Decimal(totalAmount),
          paymentMethod:
            Math.random() > 0.5 ? PaymentMethod.CASH : PaymentMethod.CARD,
          paidById: cashier.id,
          organizationId,
        },
      });

      paymentCount++;
    }

    return { invoices: invoiceCount, payments: paymentCount };
  }

  // =====================================
  // PRESCRIPTIONS
  // =====================================
  private async createPrescriptions(
    visits: Visit[],
    doctors: Employee[]
  ): Promise<number> {
    const existingCount = await this.prisma.prescription.count();
    if (existingCount > 20) return existingCount;

    const medications = [
      {
        name: "Парацетамол",
        dosage: "500 мг",
        frequency: "3 раза в день",
        duration: "5 дней",
      },
      {
        name: "Ибупрофен",
        dosage: "400 мг",
        frequency: "2 раза в день",
        duration: "7 дней",
      },
      {
        name: "Амоксициллин",
        dosage: "500 мг",
        frequency: "3 раза в день",
        duration: "7 дней",
      },
      {
        name: "Омепразол",
        dosage: "20 мг",
        frequency: "1 раз в день утром",
        duration: "14 дней",
      },
      {
        name: "Лоратадин",
        dosage: "10 мг",
        frequency: "1 раз в день",
        duration: "10 дней",
      },
      {
        name: "Аспирин",
        dosage: "100 мг",
        frequency: "1 раз в день",
        duration: "30 дней",
      },
      {
        name: "Метформин",
        dosage: "850 мг",
        frequency: "2 раза в день",
        duration: "постоянно",
      },
      {
        name: "Эналаприл",
        dosage: "10 мг",
        frequency: "1 раз в день",
        duration: "постоянно",
      },
      {
        name: "Витамин D3",
        dosage: "2000 МЕ",
        frequency: "1 раз в день",
        duration: "3 месяца",
      },
      {
        name: "Магний B6",
        dosage: "1 таблетка",
        frequency: "2 раза в день",
        duration: "1 месяц",
      },
    ];

    let count = 0;
    const completedVisits = visits.filter(
      (v) => v.status === VisitStatus.COMPLETED
    );

    for (const visit of completedVisits.slice(0, 25)) {
      const doctor = doctors.find((d) => d.id === visit.employeeId);
      if (!doctor) continue;

      // 1-3 prescriptions per visit
      const prescriptionCount = 1 + Math.floor(Math.random() * 3);

      for (let p = 0; p < prescriptionCount; p++) {
        const med = medications[Math.floor(Math.random() * medications.length)];

        await this.prisma.prescription.create({
          data: {
            name: med.name,
            dosage: med.dosage,
            frequency: med.frequency,
            duration: med.duration,
            notes: Math.random() > 0.7 ? "Принимать после еды" : null,
            visitId: visit.id,
            createdById: doctor.id,
          },
        });
        count++;
      }
    }

    return count;
  }

  // =====================================
  // PATIENT ALLERGIES
  // =====================================
  private async createPatientAllergies(
    organizationId: string,
    patients: Patient[],
    doctors: Employee[],
    visits: Visit[]
  ): Promise<number> {
    const existingCount = await this.prisma.patientAllergy.count({
      where: { organizationId },
    });
    if (existingCount > 10) return existingCount;

    const allergies = [
      {
        substance: "Пенициллин",
        reaction: "Крапивница, отёк",
        severity: AllergySeverity.SEVERE,
      },
      {
        substance: "Аспирин",
        reaction: "Бронхоспазм",
        severity: AllergySeverity.MODERATE,
      },
      {
        substance: "Сульфаниламиды",
        reaction: "Кожная сыпь",
        severity: AllergySeverity.MILD,
      },
      {
        substance: "Латекс",
        reaction: "Контактный дерматит",
        severity: AllergySeverity.MODERATE,
      },
      {
        substance: "Йод",
        reaction: "Покраснение кожи",
        severity: AllergySeverity.MILD,
      },
      {
        substance: "Орехи",
        reaction: "Анафилаксия",
        severity: AllergySeverity.SEVERE,
      },
      {
        substance: "Морепродукты",
        reaction: "Отёк Квинке",
        severity: AllergySeverity.SEVERE,
      },
      {
        substance: "Пыльца",
        reaction: "Ринит, слезотечение",
        severity: AllergySeverity.MILD,
      },
      {
        substance: "Молоко",
        reaction: "Диарея, вздутие",
        severity: AllergySeverity.MILD,
      },
      {
        substance: "Глютен",
        reaction: "Кишечные расстройства",
        severity: AllergySeverity.MODERATE,
      },
    ];

    let count = 0;

    // Add allergies to ~30% of patients
    for (const patient of patients) {
      if (Math.random() > 0.3) continue;

      const allergyCount = 1 + Math.floor(Math.random() * 2);
      const doctor = doctors[Math.floor(Math.random() * doctors.length)];
      const patientVisits = visits.filter((v) => v.patientId === patient.id);
      const visit = patientVisits.length > 0 ? patientVisits[0] : null;

      for (let a = 0; a < allergyCount; a++) {
        const allergy = allergies[Math.floor(Math.random() * allergies.length)];

        const existing = await this.prisma.patientAllergy.findFirst({
          where: { patientId: patient.id, substance: allergy.substance },
        });

        if (!existing) {
          await this.prisma.patientAllergy.create({
            data: {
              patientId: patient.id,
              visitId: visit?.id,
              recordedById: doctor.id,
              substance: allergy.substance,
              reaction: allergy.reaction,
              severity: allergy.severity,
              organizationId,
            },
          });
          count++;
        }
      }
    }

    return count;
  }

  // =====================================
  // PATIENT PARAMETERS (Vital Signs)
  // =====================================
  private async createPatientParameters(
    organizationId: string,
    patients: Patient[],
    doctors: Employee[],
    visits: Visit[],
    serviceOrders: ServiceOrder[]
  ): Promise<number> {
    const existingCount = await this.prisma.patientParameter.count({
      where: { organizationId },
    });
    if (existingCount > 50) return existingCount;

    let count = 0;
    const completedVisits = visits.filter(
      (v) => v.status === VisitStatus.COMPLETED
    );

    for (const visit of completedVisits.slice(0, 30)) {
      const doctor = doctors.find((d) => d.id === visit.employeeId);
      const patient = patients.find((p) => p.id === visit.patientId);
      if (!doctor || !patient) continue;

      // Vital signs for each visit
      const vitals = [
        {
          code: "BP_SYS",
          valueNumeric: 110 + Math.floor(Math.random() * 30),
          unit: "мм рт.ст.",
        },
        {
          code: "BP_DIA",
          valueNumeric: 70 + Math.floor(Math.random() * 20),
          unit: "мм рт.ст.",
        },
        {
          code: "PULSE",
          valueNumeric: 60 + Math.floor(Math.random() * 30),
          unit: "уд/мин",
        },
        { code: "TEMP", valueNumeric: 36.2 + Math.random() * 1.2, unit: "°C" },
        {
          code: "WEIGHT",
          valueNumeric: 50 + Math.floor(Math.random() * 50),
          unit: "кг",
        },
        {
          code: "HEIGHT",
          valueNumeric: 150 + Math.floor(Math.random() * 40),
          unit: "см",
        },
      ];

      for (const vital of vitals) {
        await this.prisma.patientParameter.create({
          data: {
            patientId: patient.id,
            visitId: visit.id,
            parameterCode: vital.code,
            valueNumeric: new Decimal(vital.valueNumeric),
            unit: vital.unit,
            measuredAt: visit.startedAt ?? visit.visitDate,
            recordedById: doctor.id,
            source: "MANUAL",
            organizationId,
          },
        });
        count++;
      }
    }

    // Add lab results from service orders
    const labOrders = serviceOrders.filter(
      (o) => o.status === OrderStatus.COMPLETED
    );
    for (const order of labOrders.slice(0, 20)) {
      const doctor = doctors.find((d) => d.id === order.doctorId);
      if (!doctor) continue;

      const labParams = [
        {
          code: "HGB",
          valueNumeric: 120 + Math.floor(Math.random() * 40),
          unit: "г/л",
        },
        {
          code: "RBC",
          valueNumeric: 4 + Math.random() * 1.5,
          unit: "x10^12/л",
        },
        {
          code: "WBC",
          valueNumeric: 4 + Math.floor(Math.random() * 6),
          unit: "x10^9/л",
        },
        {
          code: "PLT",
          valueNumeric: 180 + Math.floor(Math.random() * 140),
          unit: "x10^9/л",
        },
        {
          code: "ESR",
          valueNumeric: 2 + Math.floor(Math.random() * 18),
          unit: "мм/ч",
        },
      ];

      for (const param of labParams) {
        await this.prisma.patientParameter.create({
          data: {
            patientId: order.patientId,
            visitId: order.visitId,
            serviceOrderId: order.id,
            parameterCode: param.code,
            valueNumeric: new Decimal(param.valueNumeric),
            unit: param.unit,
            measuredAt: order.finishedAt ?? new Date(),
            recordedById: doctor.id,
            source: "LAB",
            organizationId,
          },
        });
        count++;
      }
    }

    // Add extensive history for Каландарова Хилола Дилшодовна
    count += await this.createExtensiveParameterHistoryForHilola(
      organizationId,
      patients,
      doctors
    );

    return count;
  }

  // =====================================
  // PATIENT-DOCTOR RELATIONSHIPS
  // =====================================
  private async createPatientDoctorRelationships(
    visits: Visit[]
  ): Promise<number> {
    // Get unique patient-doctor pairs from visits
    const pairs = new Map<string, { patientId: string; employeeId: string }>();

    for (const visit of visits) {
      const key = `${visit.patientId}-${visit.employeeId}`;
      if (!pairs.has(key)) {
        pairs.set(key, {
          patientId: visit.patientId,
          employeeId: visit.employeeId,
        });
      }
    }

    let count = 0;
    for (const pair of pairs.values()) {
      // Check if relationship already exists
      const existing = await this.prisma.patientDoctor.findUnique({
        where: {
          patientId_employeeId: {
            patientId: pair.patientId,
            employeeId: pair.employeeId,
          },
        },
      });

      if (!existing) {
        await this.prisma.patientDoctor.create({
          data: {
            patientId: pair.patientId,
            employeeId: pair.employeeId,
            isActive: true,
          },
        });
        count++;
      }
    }

    return count;
  }

  // Create extensive visit history for Хилола Каландарова
  async createExtensiveVisitHistoryForHilola(
    organizationId: string,
    patients: Patient[],
    doctors: Employee[]
  ): Promise<number> {
    // Find Хилола Каландарова
    const hilola = patients.find(
      (p) => p.firstName === "Хилола" && p.lastName === "Каландарова"
    );
    if (!hilola) {
      console.log("⚠️  Patient Хилола Каландарова not found");
      return 0;
    }

    // Check existing visits
    const existingCount = await this.prisma.visit.count({
      where: { patientId: hilola.id },
    });
    if (existingCount >= 10) {
      console.log("⏭️  Хилола already has enough visits");
      return 0;
    }

    const doctor = doctors[0];
    if (!doctor) return 0;

    let count = 0;
    const now = new Date();

    // Create visits for the last 12 months (monthly checkups for hypertension patient)
    const hilolaVisits = [
      {
        monthsAgo: 11,
        complaint:
          "Головные боли, повышение артериального давления до 160/100 мм рт.ст.",
        anamnesis:
          "Обратилась впервые. Головные боли беспокоят около 2 месяцев. Ранее АД не контролировала.",
        diagnosis: "I10 Эссенциальная (первичная) гипертензия",
        conclusion:
          "Назначено: эналаприл 10мг 2р/д, диета с ограничением соли, дневник АД. Контроль через 2 недели.",
      },
      {
        monthsAgo: 10,
        complaint:
          "Контрольный визит. АД 150/95 мм рт.ст. Головные боли уменьшились.",
        anamnesis: "Принимает эналаприл регулярно. Диету соблюдает частично.",
        diagnosis: "I10 Эссенциальная (первичная) гипертензия",
        conclusion:
          "Увеличить дозу эналаприла до 20мг/д. Рекомендовано снижение веса. Повторный осмотр через месяц.",
      },
      {
        monthsAgo: 8,
        complaint:
          "АД 145/90 мм рт.ст. Головных болей нет. Начала заниматься ходьбой.",
        anamnesis: "Лечение принимает регулярно. Похудела на 1.5 кг.",
        diagnosis: "I10 Эссенциальная (первичная) гипертензия, контролируемая",
        conclusion: "Продолжить терапию. ОАК, БАК, ЭКГ. Осмотр через 2 месяца.",
      },
      {
        monthsAgo: 6,
        complaint: "Периодические головокружения, АД 140/88 мм рт.ст.",
        anamnesis: "Терапию принимает. Похудела ещё на 1 кг. Анализы в норме.",
        diagnosis: "I10 Эссенциальная (первичная) гипертензия",
        conclusion:
          "Добавить амлодипин 5мг утром. Контроль головокружений. Осмотр через месяц.",
      },
      {
        monthsAgo: 5,
        complaint:
          "Головокружений нет. АД 135/85 мм рт.ст. Самочувствие хорошее.",
        anamnesis:
          "Принимает эналаприл 20мг + амлодипин 5мг. Активно занимается ходьбой.",
        diagnosis: "I10 Эссенциальная гипертензия, хороший контроль",
        conclusion: "Продолжить текущую терапию. Контроль через 2 месяца.",
      },
      {
        monthsAgo: 3,
        complaint: "Плановый осмотр. АД 130/82 мм рт.ст. Жалоб нет.",
        anamnesis: "Стабильное состояние. Вес снизился на 3 кг за полгода.",
        diagnosis: "I10 Эссенциальная гипертензия, целевое АД достигнуто",
        conclusion:
          "Продолжить терапию. Липидограмма, глюкоза крови. Осмотр через 3 месяца.",
      },
      {
        monthsAgo: 1,
        complaint:
          "Контрольный визит. АД 128/80 мм рт.ст. Активный образ жизни.",
        anamnesis: "Лечение продолжает. Вес стабильный. Анализы в норме.",
        diagnosis: "I10 Эссенциальная гипертензия, компенсация",
        conclusion:
          "Терапию продолжить. Рекомендовано продолжать физическую активность. Следующий осмотр через 3 месяца.",
      },
    ];

    for (const visitData of hilolaVisits) {
      const visitDate = new Date(now);
      visitDate.setMonth(visitDate.getMonth() - visitData.monthsAgo);
      visitDate.setHours(10, 30, 0, 0);

      const visitId = generateEntityIdSync(
        ENTITY_PREFIXES.VISIT,
        1000 + count,
        visitDate
      );

      await this.prisma.visit.create({
        data: {
          visitId,
          visitDate,
          status: VisitStatus.COMPLETED,
          type: VisitType.STANDARD,
          complaint: visitData.complaint,
          anamnesis: visitData.anamnesis,
          diagnosis: visitData.diagnosis,
          conclusion: visitData.conclusion,
          queuedAt: visitDate,
          startedAt: new Date(visitDate.getTime() + 10 * 60000),
          completedAt: new Date(visitDate.getTime() + 35 * 60000),
          waitingTimeMinutes: 10,
          serviceTimeMinutes: 25,
          organizationId,
          patientId: hilola.id,
          employeeId: doctor.id,
        },
      });
      count++;
    }

    console.log(`✅ Created ${count} visits for Хилола Каландарова`);
    return count;
  }

  // Create extensive parameter history for Хилола Каландарова
  private async createExtensiveParameterHistoryForHilola(
    organizationId: string,
    patients: Patient[],
    doctors: Employee[]
  ): Promise<number> {
    // Find Хилола Каландарова
    const hilola = patients.find(
      (p) => p.firstName === "Хилола" && p.lastName === "Каландарова"
    );
    if (!hilola) {
      console.log(
        "⚠️  Patient Хилола Каландарова not found, skipping extensive history"
      );
      return 0;
    }

    const doctor = doctors[0];
    if (!doctor) return 0;

    // Check if already has extensive data
    const existingCount = await this.prisma.patientParameter.count({
      where: { patientId: hilola.id },
    });
    if (existingCount > 30) {
      console.log("⏭️  Хилола already has extensive parameter history");
      return 0;
    }

    let count = 0;
    const now = new Date();

    // Generate 12 months of historical data (one measurement every 2 weeks)
    for (let monthsAgo = 11; monthsAgo >= 0; monthsAgo--) {
      for (const week of [0, 2]) {
        const measureDate = new Date(now);
        measureDate.setMonth(measureDate.getMonth() - monthsAgo);
        measureDate.setDate(measureDate.getDate() - week * 7);

        // Simulate a patient with mild hypertension improving over time
        const progressFactor = (12 - monthsAgo) / 12; // 0 to 1 over the year

        // Blood pressure gradually improving
        const bpSys = Math.round(
          145 - progressFactor * 15 + (Math.random() - 0.5) * 10
        );
        const bpDia = Math.round(
          92 - progressFactor * 10 + (Math.random() - 0.5) * 6
        );

        // Pulse relatively stable
        const pulse = Math.round(78 + (Math.random() - 0.5) * 12);

        // Weight gradually decreasing (healthy lifestyle)
        const weight =
          Math.round(
            (72 - progressFactor * 4 + (Math.random() - 0.5) * 1) * 10
          ) / 10;

        // Temperature normal
        const temp = Math.round((36.5 + (Math.random() - 0.5) * 0.4) * 10) / 10;

        const vitals = [
          { code: "BP_SYS", value: bpSys, unit: "мм рт.ст." },
          { code: "BP_DIA", value: bpDia, unit: "мм рт.ст." },
          { code: "PULSE", value: pulse, unit: "уд/мин" },
          { code: "WEIGHT", value: weight, unit: "кг" },
          { code: "TEMP", value: temp, unit: "°C" },
        ];

        for (const vital of vitals) {
          await this.prisma.patientParameter.create({
            data: {
              patientId: hilola.id,
              parameterCode: vital.code,
              valueNumeric: new Decimal(vital.value),
              unit: vital.unit,
              measuredAt: measureDate,
              recordedById: doctor.id,
              source: "MANUAL",
              organizationId,
            },
          });
          count++;
        }

        // Add lab results every 2 months
        if (monthsAgo % 2 === 0 && week === 0) {
          const labParams = [
            {
              code: "HGB",
              value: Math.round(
                125 + progressFactor * 10 + (Math.random() - 0.5) * 8
              ),
              unit: "г/л",
            },
            {
              code: "RBC",
              value:
                Math.round((4.3 + (Math.random() - 0.5) * 0.4) * 100) / 100,
              unit: "x10^12/л",
            },
            {
              code: "WBC",
              value: Math.round((6 + (Math.random() - 0.5) * 2) * 10) / 10,
              unit: "x10^9/л",
            },
            {
              code: "PLT",
              value: Math.round(220 + (Math.random() - 0.5) * 40),
              unit: "x10^9/л",
            },
            {
              code: "ESR",
              value: Math.round(
                8 - progressFactor * 3 + (Math.random() - 0.5) * 4
              ),
              unit: "мм/ч",
            },
          ];

          for (const param of labParams) {
            await this.prisma.patientParameter.create({
              data: {
                patientId: hilola.id,
                parameterCode: param.code,
                valueNumeric: new Decimal(param.value),
                unit: param.unit,
                measuredAt: measureDate,
                recordedById: doctor.id,
                source: "LAB",
                organizationId,
              },
            });
            count++;
          }
        }
      }
    }

    console.log(
      `✅ Created ${count} extensive parameters for Хилола Каландарова`
    );
    return count;
  }
}
