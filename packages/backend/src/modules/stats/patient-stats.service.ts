import { Injectable } from "@nestjs/common";
import { plainToInstance } from "class-transformer";
import { PrismaService } from "@/common/prisma/prisma.service";
import { PatientStatsQueryDto } from "./dto/patient-stats-query.dto";
import {
  PatientStatsResponseDto,
  GenderDistributionDto,
  AgeGroupDto,
  MonthlyTrendDto,
} from "./dto/patient-stats-response.dto";
import { Gender, PatientStatus } from "@prisma/client";

const MONTHS_RU = [
  "Январь",
  "Февраль",
  "Март",
  "Апрель",
  "Май",
  "Июнь",
  "Июль",
  "Август",
  "Сентябрь",
  "Октябрь",
  "Ноябрь",
  "Декабрь",
];

const MONTHS_SHORT_RU = [
  "Янв",
  "Фев",
  "Мар",
  "Апр",
  "Май",
  "Июн",
  "Июл",
  "Авг",
  "Сен",
  "Окт",
  "Ноя",
  "Дек",
];

const AGE_GROUPS = [
  { label: "0-17", minAge: 0, maxAge: 17 },
  { label: "18-30", minAge: 18, maxAge: 30 },
  { label: "31-45", minAge: 31, maxAge: 45 },
  { label: "46-60", minAge: 46, maxAge: 60 },
  { label: "60+", minAge: 61, maxAge: null },
];

@Injectable()
export class PatientStatsService {
  constructor(private readonly prisma: PrismaService) {}

  async getPatientStats(
    dto: PatientStatsQueryDto
  ): Promise<PatientStatsResponseDto> {
    const { organizationId } = dto;

    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const [
      totalPatients,
      activePatients,
      newPatientsThisMonth,
      newPatientsLastMonth,
      genderCounts,
      patients,
      returningPatients,
      monthlyTrends,
    ] = await Promise.all([
      this.getTotalPatients(organizationId),
      this.getActivePatients(organizationId),
      this.getNewPatients(organizationId, startOfThisMonth, now),
      this.getNewPatients(organizationId, startOfLastMonth, endOfLastMonth),
      this.getGenderCounts(organizationId),
      this.getPatientsBirthDates(organizationId),
      this.getReturningPatients(organizationId),
      this.getMonthlyTrends(organizationId),
    ]);

    const growthPercent =
      newPatientsLastMonth > 0
        ? Math.round(
            ((newPatientsThisMonth - newPatientsLastMonth) /
              newPatientsLastMonth) *
              100
          )
        : newPatientsThisMonth > 0
          ? 100
          : 0;

    const genderDistribution = this.calculateGenderDistribution(
      genderCounts,
      totalPatients
    );
    const ageDistribution = this.calculateAgeDistribution(
      patients,
      totalPatients
    );
    const returningPatientsPercent =
      totalPatients > 0
        ? Math.round((returningPatients / totalPatients) * 100)
        : 0;

    return plainToInstance(PatientStatsResponseDto, {
      totalPatients,
      activePatients,
      newPatientsThisMonth,
      newPatientsLastMonth,
      growthPercent,
      genderDistribution,
      ageDistribution,
      returningPatients,
      returningPatientsPercent,
      monthlyTrends,
    });
  }

  private async getTotalPatients(organizationId: string): Promise<number> {
    return this.prisma.patient.count({
      where: { organizationId },
    });
  }

  private async getActivePatients(organizationId: string): Promise<number> {
    return this.prisma.patient.count({
      where: {
        organizationId,
        status: PatientStatus.ACTIVE,
      },
    });
  }

  private async getNewPatients(
    organizationId: string,
    startDate: Date,
    endDate: Date
  ): Promise<number> {
    return this.prisma.patient.count({
      where: {
        organizationId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });
  }

  private async getGenderCounts(
    organizationId: string
  ): Promise<{ gender: Gender; count: number }[]> {
    const result = await this.prisma.patient.groupBy({
      by: ["gender"],
      where: { organizationId },
      _count: { gender: true },
    });

    return result.map((r) => ({
      gender: r.gender,
      count: r._count.gender,
    }));
  }

  private async getPatientsBirthDates(
    organizationId: string
  ): Promise<{ dateOfBirth: Date }[]> {
    return this.prisma.patient.findMany({
      where: { organizationId },
      select: { dateOfBirth: true },
    });
  }

  private async getReturningPatients(organizationId: string): Promise<number> {
    const result = await this.prisma.patient.count({
      where: {
        organizationId,
        visits: {
          some: {},
        },
        AND: {
          visits: {
            some: {
              id: {
                not: undefined,
              },
            },
          },
        },
      },
    });

    // Get patients with more than 1 visit
    const patientsWithMultipleVisits = await this.prisma.$queryRaw<
      { count: bigint }[]
    >`
      SELECT COUNT(*) as count FROM (
        SELECT p.id
        FROM patients p
        JOIN visits v ON v."patientId" = p.id
        WHERE p."organizationId" = ${organizationId}
        GROUP BY p.id
        HAVING COUNT(v.id) > 1
      ) as returning_patients
    `;

    return Number(patientsWithMultipleVisits[0]?.count ?? 0);
  }

  private async getMonthlyTrends(
    organizationId: string
  ): Promise<MonthlyTrendDto[]> {
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const trends: MonthlyTrendDto[] = [];

    for (let i = 0; i < 6; i++) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
      const monthStart = new Date(
        monthDate.getFullYear(),
        monthDate.getMonth(),
        1
      );
      const monthEnd = new Date(
        monthDate.getFullYear(),
        monthDate.getMonth() + 1,
        0,
        23,
        59,
        59,
        999
      );

      const [newPatients, visits] = await Promise.all([
        this.prisma.patient.count({
          where: {
            organizationId,
            createdAt: {
              gte: monthStart,
              lte: monthEnd,
            },
          },
        }),
        this.prisma.visit.count({
          where: {
            organizationId,
            visitDate: {
              gte: monthStart,
              lte: monthEnd,
            },
          },
        }),
      ]);

      trends.push(
        plainToInstance(MonthlyTrendDto, {
          month: MONTHS_RU[monthDate.getMonth()],
          monthShort: MONTHS_SHORT_RU[monthDate.getMonth()],
          year: monthDate.getFullYear(),
          newPatients,
          visits,
        })
      );
    }

    return trends;
  }

  private calculateGenderDistribution(
    genderCounts: { gender: Gender; count: number }[],
    total: number
  ): GenderDistributionDto {
    const male = genderCounts.find((g) => g.gender === Gender.MALE)?.count ?? 0;
    const female =
      genderCounts.find((g) => g.gender === Gender.FEMALE)?.count ?? 0;

    return plainToInstance(GenderDistributionDto, {
      male,
      female,
      malePercent: total > 0 ? Math.round((male / total) * 100) : 0,
      femalePercent: total > 0 ? Math.round((female / total) * 100) : 0,
    });
  }

  private calculateAgeDistribution(
    patients: { dateOfBirth: Date }[],
    total: number
  ): AgeGroupDto[] {
    const now = new Date();

    const ageCounts = AGE_GROUPS.map((group) => {
      const count = patients.filter((p) => {
        const age = this.calculateAge(p.dateOfBirth, now);
        if (group.maxAge === null) {
          return age >= group.minAge;
        }
        return age >= group.minAge && age <= group.maxAge;
      }).length;

      return plainToInstance(AgeGroupDto, {
        label: group.label,
        minAge: group.minAge,
        maxAge: group.maxAge,
        count,
        percent: total > 0 ? Math.round((count / total) * 100) : 0,
      });
    });

    return ageCounts;
  }

  private calculateAge(birthDate: Date, referenceDate: Date): number {
    let age = referenceDate.getFullYear() - birthDate.getFullYear();
    const monthDiff = referenceDate.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && referenceDate.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  }
}
