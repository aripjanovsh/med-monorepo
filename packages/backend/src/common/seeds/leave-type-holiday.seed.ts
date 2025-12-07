import type { PrismaClient } from "@prisma/client";

export class LeaveTypeHolidaySeed {
  constructor(private readonly prisma: PrismaClient) {}

  async seedLeaveTypes(organizationId: string) {
    console.log("🏖️ Seeding leave types...");

    // Check if leave types already exist for this organization
    const existingTypes = await this.prisma.leaveType.findMany({
      where: { organizationId },
    });

    if (existingTypes.length > 0) {
      console.log(
        "ℹ️  Leave types already exist for this organization, skipping..."
      );
      return {
        leaveTypes: existingTypes,
        skipped: true,
      };
    }

    const leaveTypesData = [
      {
        name: "Ежегодный отпуск",
        code: "ANNUAL",
        description: "Ежегодный оплачиваемый отпуск",
        color: "#4CAF50",
        isPaid: true,
        order: 1,
      },
      {
        name: "Больничный",
        code: "SICK",
        description: "Отпуск по болезни",
        color: "#F44336",
        isPaid: true,
        order: 2,
      },
      {
        name: "Отпуск за свой счёт",
        code: "UNPAID",
        description: "Неоплачиваемый отпуск по личным обстоятельствам",
        color: "#9E9E9E",
        isPaid: false,
        order: 3,
      },
      {
        name: "Декретный отпуск",
        code: "MATERNITY",
        description: "Отпуск по беременности и родам",
        color: "#E91E63",
        isPaid: true,
        order: 4,
      },
      {
        name: "Отпуск по уходу за ребёнком",
        code: "PARENTAL",
        description: "Отпуск по уходу за ребёнком до 3 лет",
        color: "#FF9800",
        isPaid: true,
        order: 5,
      },
      {
        name: "Учебный отпуск",
        code: "STUDY",
        description: "Отпуск для сдачи экзаменов или защиты диссертации",
        color: "#2196F3",
        isPaid: true,
        order: 6,
      },
      {
        name: "Отпуск в связи с бракосочетанием",
        code: "WEDDING",
        description: "Отпуск по случаю бракосочетания (3 дня)",
        color: "#9C27B0",
        isPaid: true,
        order: 7,
      },
      {
        name: "Отпуск в связи со смертью родственника",
        code: "BEREAVEMENT",
        description: "Отпуск в связи со смертью близкого родственника (3 дня)",
        color: "#607D8B",
        isPaid: true,
        order: 8,
      },
      {
        name: "Отгул",
        code: "COMP_OFF",
        description: "Компенсационный выходной за переработку",
        color: "#00BCD4",
        isPaid: true,
        order: 9,
      },
      {
        name: "Командировка",
        code: "BUSINESS_TRIP",
        description: "Служебная командировка",
        color: "#795548",
        isPaid: true,
        order: 10,
      },
    ];

    const leaveTypes = [];

    for (const typeData of leaveTypesData) {
      const leaveType = await this.prisma.leaveType.create({
        data: {
          ...typeData,
          isActive: true,
          organizationId,
        },
      });
      leaveTypes.push(leaveType);
    }

    console.log(`✅ Created ${leaveTypes.length} leave types`);

    return {
      leaveTypes,
      skipped: false,
    };
  }

  async seedHolidays(organizationId: string) {
    console.log("🎉 Seeding Uzbekistan holidays...");

    // Check if holidays already exist for this organization
    const existingHolidays = await this.prisma.holiday.findMany({
      where: { organizationId },
    });

    if (existingHolidays.length > 0) {
      console.log(
        "ℹ️  Holidays already exist for this organization, skipping..."
      );
      return {
        holidays: existingHolidays,
        skipped: true,
      };
    }

    // Uzbekistan official holidays for 2024-2025
    const holidaysData = [
      // 2024 Holidays
      {
        name: "Новый год",
        startsOn: new Date("2024-01-01"),
        until: new Date("2024-01-01"),
        note: "Государственный праздник",
      },
      {
        name: "День защитников Родины",
        startsOn: new Date("2024-01-14"),
        until: new Date("2024-01-14"),
        note: "Государственный праздник",
      },
      {
        name: "Международный женский день",
        startsOn: new Date("2024-03-08"),
        until: new Date("2024-03-08"),
        note: "Государственный праздник",
      },
      {
        name: "Навруз",
        startsOn: new Date("2024-03-21"),
        until: new Date("2024-03-21"),
        note: "Праздник весны и нового года по восточному календарю",
      },
      {
        name: "Рамазон хайит (Ураза-байрам)",
        startsOn: new Date("2024-04-10"),
        until: new Date("2024-04-11"),
        note: "Исламский праздник завершения поста",
      },
      {
        name: "День памяти и почестей",
        startsOn: new Date("2024-05-09"),
        until: new Date("2024-05-09"),
        note: "День памяти жертв Второй мировой войны",
      },
      {
        name: "Курбон хайит (Курбан-байрам)",
        startsOn: new Date("2024-06-16"),
        until: new Date("2024-06-17"),
        note: "Исламский праздник жертвоприношения",
      },
      {
        name: "День независимости",
        startsOn: new Date("2024-09-01"),
        until: new Date("2024-09-01"),
        note: "Главный государственный праздник Узбекистана",
      },
      {
        name: "День учителей и наставников",
        startsOn: new Date("2024-10-01"),
        until: new Date("2024-10-01"),
        note: "День почитания учителей",
      },
      {
        name: "День Конституции",
        startsOn: new Date("2024-12-08"),
        until: new Date("2024-12-08"),
        note: "День принятия Конституции Республики Узбекистан",
      },

      // 2025 Holidays
      {
        name: "Новый год 2025",
        startsOn: new Date("2025-01-01"),
        until: new Date("2025-01-01"),
        note: "Государственный праздник",
      },
      {
        name: "День защитников Родины 2025",
        startsOn: new Date("2025-01-14"),
        until: new Date("2025-01-14"),
        note: "Государственный праздник",
      },
      {
        name: "Международный женский день 2025",
        startsOn: new Date("2025-03-08"),
        until: new Date("2025-03-08"),
        note: "Государственный праздник",
      },
      {
        name: "Навруз 2025",
        startsOn: new Date("2025-03-21"),
        until: new Date("2025-03-21"),
        note: "Праздник весны и нового года по восточному календарю",
      },
      {
        name: "Рамазон хайит 2025 (Ураза-байрам)",
        startsOn: new Date("2025-03-30"),
        until: new Date("2025-03-31"),
        note: "Исламский праздник завершения поста",
      },
      {
        name: "День памяти и почестей 2025",
        startsOn: new Date("2025-05-09"),
        until: new Date("2025-05-09"),
        note: "День памяти жертв Второй мировой войны",
      },
      {
        name: "Курбон хайит 2025 (Курбан-байрам)",
        startsOn: new Date("2025-06-06"),
        until: new Date("2025-06-07"),
        note: "Исламский праздник жертвоприношения",
      },
      {
        name: "День независимости 2025",
        startsOn: new Date("2025-09-01"),
        until: new Date("2025-09-01"),
        note: "Главный государственный праздник Узбекистана",
      },
      {
        name: "День учителей и наставников 2025",
        startsOn: new Date("2025-10-01"),
        until: new Date("2025-10-01"),
        note: "День почитания учителей",
      },
      {
        name: "День Конституции 2025",
        startsOn: new Date("2025-12-08"),
        until: new Date("2025-12-08"),
        note: "День принятия Конституции Республики Узбекистан",
      },
    ];

    const holidays = [];

    for (const holidayData of holidaysData) {
      const holiday = await this.prisma.holiday.create({
        data: {
          ...holidayData,
          isActive: true,
          organizationId,
        },
      });
      holidays.push(holiday);
    }

    console.log(`✅ Created ${holidays.length} holidays`);

    return {
      holidays,
      skipped: false,
    };
  }

  async seedAll(organizationId: string) {
    const leaveTypesResult = await this.seedLeaveTypes(organizationId);
    const holidaysResult = await this.seedHolidays(organizationId);

    return {
      leaveTypes: leaveTypesResult.leaveTypes,
      holidays: holidaysResult.holidays,
    };
  }
}
