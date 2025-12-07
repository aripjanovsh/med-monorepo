import type { PrismaClient } from "@prisma/client";

export class AppointmentTypeSeed {
  constructor(private readonly prisma: PrismaClient) {}

  async seedAppointmentTypes(organizationId: string) {
    console.log("📅 Seeding appointment types...");

    // Check if appointment types already exist for this organization
    const existingTypes = await this.prisma.appointmentType.findMany({
      where: { organizationId },
    });

    if (existingTypes.length > 0) {
      console.log(
        "ℹ️  Appointment types already exist for this organization, skipping..."
      );
      return {
        appointmentTypes: existingTypes,
        skipped: true,
      };
    }

    const appointmentTypesData = [
      {
        name: "Первичный приём",
        code: "PRIMARY",
        description: "Первичный приём нового пациента",
        color: "#4CAF50",
        durationMin: 30,
        order: 1,
      },
      {
        name: "Повторный приём",
        code: "FOLLOWUP",
        description: "Повторный приём пациента",
        color: "#2196F3",
        durationMin: 20,
        order: 2,
      },
      {
        name: "Консультация",
        code: "CONSULTATION",
        description: "Консультация специалиста",
        color: "#9C27B0",
        durationMin: 30,
        order: 3,
      },
      {
        name: "Профилактический осмотр",
        code: "PREVENTIVE",
        description: "Профилактический осмотр",
        color: "#FF9800",
        durationMin: 20,
        order: 4,
      },
      {
        name: "Экстренный приём",
        code: "EMERGENCY",
        description: "Экстренный приём",
        color: "#F44336",
        durationMin: 15,
        order: 5,
      },
      {
        name: "Диспансеризация",
        code: "CHECKUP",
        description: "Комплексный медицинский осмотр",
        color: "#00BCD4",
        durationMin: 60,
        order: 6,
      },
      {
        name: "Телемедицина",
        code: "TELEMEDICINE",
        description: "Онлайн-консультация",
        color: "#607D8B",
        durationMin: 20,
        order: 7,
      },
    ];

    const appointmentTypes = [];

    for (const typeData of appointmentTypesData) {
      const appointmentType = await this.prisma.appointmentType.create({
        data: {
          ...typeData,
          isActive: true,
          organizationId,
        },
      });
      appointmentTypes.push(appointmentType);
    }

    console.log(`✅ Created ${appointmentTypes.length} appointment types`);

    return {
      appointmentTypes,
      skipped: false,
    };
  }

  async seedAppointmentCancelTypes(organizationId: string) {
    console.log("❌ Seeding appointment cancel types...");

    // Check if cancel types already exist for this organization
    const existingTypes = await this.prisma.appointmentCancelType.findMany({
      where: { organizationId },
    });

    if (existingTypes.length > 0) {
      console.log(
        "ℹ️  Appointment cancel types already exist for this organization, skipping..."
      );
      return {
        appointmentCancelTypes: existingTypes,
        skipped: true,
      };
    }

    const cancelTypesData = [
      {
        name: "Болезнь пациента",
        code: "PATIENT_SICK",
        description: "Пациент отменил приём по причине болезни",
        order: 1,
      },
      {
        name: "Личные обстоятельства пациента",
        code: "PATIENT_PERSONAL",
        description: "Пациент отменил приём по личным обстоятельствам",
        order: 2,
      },
      {
        name: "Пациент не явился",
        code: "NO_SHOW",
        description: "Пациент не явился на приём без предупреждения",
        order: 3,
      },
      {
        name: "Отсутствие врача",
        code: "DOCTOR_ABSENT",
        description: "Врач отсутствует (болезнь, командировка)",
        order: 4,
      },
      {
        name: "Перенос приёма",
        code: "RESCHEDULED",
        description: "Приём перенесён на другую дату",
        order: 5,
      },
      {
        name: "Технические причины",
        code: "TECHNICAL",
        description: "Отмена по техническим причинам",
        order: 6,
      },
      {
        name: "Дублирование записи",
        code: "DUPLICATE",
        description: "Запись была создана по ошибке (дубликат)",
        order: 7,
      },
      {
        name: "Финансовые причины",
        code: "FINANCIAL",
        description: "Пациент отказался от услуги по финансовым причинам",
        order: 8,
      },
      {
        name: "Другое",
        code: "OTHER",
        description: "Другая причина отмены",
        order: 99,
      },
    ];

    const cancelTypes = [];

    for (const typeData of cancelTypesData) {
      const cancelType = await this.prisma.appointmentCancelType.create({
        data: {
          ...typeData,
          isActive: true,
          organizationId,
        },
      });
      cancelTypes.push(cancelType);
    }

    console.log(`✅ Created ${cancelTypes.length} appointment cancel types`);

    return {
      appointmentCancelTypes: cancelTypes,
      skipped: false,
    };
  }

  async seedAll(organizationId: string) {
    const appointmentTypesResult =
      await this.seedAppointmentTypes(organizationId);
    const cancelTypesResult =
      await this.seedAppointmentCancelTypes(organizationId);

    return {
      appointmentTypes: appointmentTypesResult.appointmentTypes,
      appointmentCancelTypes: cancelTypesResult.appointmentCancelTypes,
    };
  }
}
