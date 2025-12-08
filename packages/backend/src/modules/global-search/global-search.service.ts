import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../../common/prisma/prisma.service";
import { plainToInstance } from "class-transformer";
import {
  GlobalSearchQueryDto,
  GlobalSearchResponseDto,
  GlobalSearchPatientDto,
  GlobalSearchEmployeeDto,
} from "./dto/global-search.dto";

@Injectable()
export class GlobalSearchService {
  constructor(private readonly prisma: PrismaService) {}

  async search(query: GlobalSearchQueryDto): Promise<GlobalSearchResponseDto> {
    const { search, limit = 10, organizationId } = query;

    if (!search || search.trim().length === 0) {
      return {
        patients: [],
        employees: [],
      };
    }

    const searchTerm = search.trim();

    // Build patient search condition
    const patientWhere: Prisma.PatientWhereInput = {
      organizationId,
      OR: [
        { firstName: { contains: searchTerm, mode: "insensitive" } },
        { lastName: { contains: searchTerm, mode: "insensitive" } },
        { middleName: { contains: searchTerm, mode: "insensitive" } },
        { patientId: { contains: searchTerm, mode: "insensitive" } },
        { phone: { contains: searchTerm, mode: "insensitive" } },
        { email: { contains: searchTerm, mode: "insensitive" } },
      ],
    };

    // Build employee search condition
    const employeeWhere: Prisma.EmployeeWhereInput = {
      organizationId,
      OR: [
        { firstName: { contains: searchTerm, mode: "insensitive" } },
        { lastName: { contains: searchTerm, mode: "insensitive" } },
        { middleName: { contains: searchTerm, mode: "insensitive" } },
        { employeeId: { contains: searchTerm, mode: "insensitive" } },
        { email: { contains: searchTerm, mode: "insensitive" } },
      ],
    };

    // Execute both queries in parallel
    const [patients, employees] = await Promise.all([
      this.prisma.patient.findMany({
        where: patientWhere,
        select: {
          id: true,
          patientId: true,
          firstName: true,
          middleName: true,
          lastName: true,
          phone: true,
          dateOfBirth: true,
        },
        orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
        take: limit,
      }),
      this.prisma.employee.findMany({
        where: employeeWhere,
        select: {
          id: true,
          employeeId: true,
          firstName: true,
          middleName: true,
          lastName: true,
          avatarId: true,
          title: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
        take: limit,
      }),
    ]);

    return {
      patients: plainToInstance(GlobalSearchPatientDto, patients),
      employees: plainToInstance(GlobalSearchEmployeeDto, employees),
    };
  }
}
