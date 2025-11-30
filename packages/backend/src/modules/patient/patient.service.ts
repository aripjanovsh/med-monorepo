import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma, PatientStatus, OrderStatus } from "@prisma/client";
import { PrismaService } from "../../common/prisma/prisma.service";
import { CreatePatientDto } from "./dto/create-patient.dto";
import { UpdatePatientDto } from "./dto/update-patient.dto";
import { FindAllPatientDto } from "./dto/find-all-patient.dto";
import { PaginatedResponseDto } from "../../common/dto/pagination.dto";
import { PatientResponseDto } from "./dto/patient-response.dto";
import { PatientDashboardStatsResponseDto } from "./dto/patient-dashboard-stats.dto";
import { plainToInstance } from "class-transformer";
import { generateMemorableId } from "../../common/utils/id-generator.util";

@Injectable()
export class PatientService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    createPatientDto: CreatePatientDto
  ): Promise<PatientResponseDto> {
    const { ...patientData } = createPatientDto;

    return await this.prisma.$transaction(async (tx) => {
      // Auto-generate patientId if not provided
      let patientId = patientData.patientId;
      if (!patientId) {
        patientId = generateMemorableId("P");
      }

      // Set status to ACTIVE if not provided
      const status = patientData.status || PatientStatus.ACTIVE;

      // Create patient
      const created = await tx.patient.create({
        data: {
          ...patientData,
          patientId,
          status,
        },
      });

      // Fetch the complete patient with relations
      const patientWithRelations = await tx.patient.findUnique({
        where: { id: created.id },
        include: {
          primaryLanguage: true,
          secondaryLanguage: true,
          country: true,
          region: true,
          city: true,
          district: true,
          doctors: {
            include: {
              employee: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
      });

      // Transform the response
      const response = patientWithRelations
        ? {
            ...patientWithRelations,
            doctors: patientWithRelations.doctors.map((pd) => ({
              id: pd.id,
              employeeId: pd.employeeId,
              firstName: pd.employee.firstName,
              lastName: pd.employee.lastName,
              assignedAt: pd.assignedAt,
              isActive: pd.isActive,
            })),
          }
        : null;

      return plainToInstance(PatientResponseDto, response);
    });
  }

  async findAll(
    query: FindAllPatientDto
  ): Promise<PaginatedResponseDto<PatientResponseDto>> {
    const {
      page,
      limit,
      search,
      sortBy,
      sortOrder,
      status,
      gender,
      organizationId,
      doctorId,
    } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.PatientWhereInput = {};

    // Filter by organizationId if provided
    if (organizationId) {
      where.organizationId = organizationId;
    }

    if (status) {
      where.status = status as PatientStatus;
    }

    if (gender) {
      where.gender = gender as any;
    }

    if (doctorId) {
      where.doctors = {
        some: {
          employeeId: doctorId,
          isActive: true,
        },
      };
    }

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { patientId: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
        { secondaryPhone: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    // Build order by
    const orderBy: Prisma.PatientOrderByWithRelationInput = {};
    if (sortBy) {
      orderBy[sortBy] = sortOrder;
    } else {
      orderBy.updatedAt = "desc";
    }

    const [patients, total] = await Promise.all([
      this.prisma.patient.findMany({
        where,
        include: {
          primaryLanguage: true,
          secondaryLanguage: true,
          country: true,
          region: true,
          city: true,
          district: true,
        },
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.patient.count({ where }),
    ]);

    return {
      data: plainToInstance(PatientResponseDto, patients),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(
    id: string,
    organizationId?: string
  ): Promise<PatientResponseDto> {
    const where: Prisma.PatientWhereUniqueInput = { id };

    // Filter by organizationId if provided
    if (organizationId) {
      where.organizationId = organizationId;
    }

    const patient = await this.prisma.patient.findUnique({
      where,
      include: {
        primaryLanguage: true,
        secondaryLanguage: true,
        country: true,
        region: true,
        city: true,
        district: true,
        doctors: {
          include: {
            employee: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    if (!patient) {
      throw new NotFoundException("Patient not found");
    }

    const response = {
      ...patient,
      doctors: patient.doctors.map((pd) => ({
        id: pd.id,
        employeeId: pd.employeeId,
        firstName: pd.employee.firstName,
        lastName: pd.employee.lastName,
        assignedAt: pd.assignedAt,
        isActive: pd.isActive,
      })),
    };

    return plainToInstance(PatientResponseDto, response);
  }

  async update(
    id: string,
    updatePatientDto: UpdatePatientDto
  ): Promise<PatientResponseDto> {
    // Check if patient exists
    const existingPatient = await this.prisma.patient.findUnique({
      where: { id },
      include: {
        doctors: true,
      },
    });

    if (!existingPatient) {
      throw new NotFoundException("Patient not found");
    }

    return await this.prisma.$transaction(async (tx) => {
      const where: Prisma.PatientWhereUniqueInput = { id };
      if (updatePatientDto.organizationId) {
        where.organizationId = updatePatientDto.organizationId;
      }

      const { excludePatientId, ...coreUpdate } = updatePatientDto;

      // Update core patient data
      await tx.patient.update({
        where,
        data: coreUpdate,
      });

      const updatedPatient = await tx.patient.findUnique({
        where: { id },
        include: {
          primaryLanguage: true,
          secondaryLanguage: true,
          country: true,
          region: true,
          city: true,
          district: true,
          doctors: {
            include: {
              employee: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
      });

      const response = updatedPatient
        ? {
            ...updatedPatient,
            doctors: updatedPatient.doctors.map((pd) => ({
              id: pd.id,
              employeeId: pd.employeeId,
              firstName: pd.employee.firstName,
              lastName: pd.employee.lastName,
              assignedAt: pd.assignedAt,
              isActive: pd.isActive,
            })),
          }
        : null;

      return plainToInstance(PatientResponseDto, response);
    });
  }

  async updateStatus(
    id: string,
    status: PatientStatus,
    organizationId?: string
  ): Promise<PatientResponseDto> {
    try {
      // Build where clause with organizationId filter if provided
      const where: Prisma.PatientWhereUniqueInput = { id };

      if (organizationId) {
        where.organizationId = organizationId;
      }

      const patient = await this.prisma.patient.update({
        where,
        data: { status },
        include: {
          primaryLanguage: true,
          secondaryLanguage: true,
          country: true,
          region: true,
          city: true,
          district: true,
          doctors: {
            include: {
              employee: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
      });

      const response = {
        ...patient,
        doctors: patient.doctors.map((pd) => ({
          id: pd.id,
          employeeId: pd.employeeId,
          firstName: pd.employee.firstName,
          lastName: pd.employee.lastName,
          assignedAt: pd.assignedAt,
          isActive: pd.isActive,
        })),
      };

      return plainToInstance(PatientResponseDto, response);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          throw new NotFoundException("Patient not found");
        }
      }
      throw error;
    }
  }

  async remove(id: string, organizationId?: string) {
    try {
      // Build where clause with organizationId filter if provided
      const where: Prisma.PatientWhereUniqueInput = { id };
      if (organizationId) {
        where.organizationId = organizationId;
      }

      await this.prisma.patient.delete({
        where,
      });
      return { message: "Patient deleted successfully" };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          throw new NotFoundException("Patient not found");
        }
      }
      throw error;
    }
  }

  async getPatientStats(organizationId?: string) {
    const where: Prisma.PatientWhereInput = {};

    // Filter by organizationId if provided
    if (organizationId) {
      where.organizationId = organizationId;
    }

    const [total, active, inactive, deceased] = await Promise.all([
      this.prisma.patient.count({ where }),
      this.prisma.patient.count({
        where: { ...where, status: PatientStatus.ACTIVE },
      }),
      this.prisma.patient.count({
        where: { ...where, status: PatientStatus.INACTIVE },
      }),
      this.prisma.patient.count({
        where: { ...where, status: PatientStatus.DECEASED },
      }),
    ]);

    return {
      total,
      byStatus: {
        active,
        inactive,
        deceased,
      },
    };
  }

  async getDashboardStats(
    patientId: string,
    organizationId?: string
  ): Promise<PatientDashboardStatsResponseDto> {
    // Verify patient exists
    const patientWhere: Prisma.PatientWhereUniqueInput = { id: patientId };
    if (organizationId) {
      patientWhere.organizationId = organizationId;
    }

    const patient = await this.prisma.patient.findUnique({
      where: patientWhere,
      include: {
        doctors: {
          include: {
            employee: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                department: {
                  select: { name: true },
                },
              },
            },
          },
        },
      },
    });

    if (!patient) {
      throw new NotFoundException("Patient not found");
    }

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const visitWhere: Prisma.VisitWhereInput = {
      patientId,
      ...(organizationId && { organizationId }),
    };

    const orderWhere: Prisma.ServiceOrderWhereInput = {
      patientId,
      ...(organizationId && { organizationId }),
    };

    // Fetch all data in parallel
    const [
      totalVisits,
      visitsLastMonth,
      activeOrdersCount,
      recentVisitsData,
      activeOrdersData,
      allOrdersByStatus,
      visitsLast6Months,
    ] = await Promise.all([
      // Total visits
      this.prisma.visit.count({ where: visitWhere }),

      // Visits in last month
      this.prisma.visit.count({
        where: {
          ...visitWhere,
          visitDate: { gte: oneMonthAgo },
        },
      }),

      // Active orders count
      this.prisma.serviceOrder.count({
        where: {
          ...orderWhere,
          status: { in: [OrderStatus.ORDERED, OrderStatus.IN_PROGRESS] },
        },
      }),

      // Recent visits (last 5)
      this.prisma.visit.findMany({
        where: visitWhere,
        include: {
          employee: {
            select: {
              firstName: true,
              lastName: true,
              department: { select: { name: true } },
            },
          },
        },
        orderBy: { visitDate: "desc" },
        take: 5,
      }),

      // Active orders
      this.prisma.serviceOrder.findMany({
        where: {
          ...orderWhere,
          status: { in: [OrderStatus.ORDERED, OrderStatus.IN_PROGRESS] },
        },
        include: {
          service: { select: { name: true } },
          department: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),

      // Orders grouped by status
      this.prisma.serviceOrder.groupBy({
        by: ["status"],
        where: orderWhere,
        _count: { id: true },
      }),

      // Visits in last 6 months for chart
      this.prisma.visit.findMany({
        where: {
          ...visitWhere,
          visitDate: { gte: sixMonthsAgo },
        },
        select: { visitDate: true },
        orderBy: { visitDate: "asc" },
      }),
    ]);

    // Calculate visits by department
    const visitsByDepartmentRaw = await this.prisma.visit.groupBy({
      by: ["employeeId"],
      where: visitWhere,
      _count: { id: true },
    });

    // Get department names for visits
    const employeeIds = visitsByDepartmentRaw.map((v) => v.employeeId);
    const employeesWithDepts = await this.prisma.employee.findMany({
      where: { id: { in: employeeIds } },
      select: { id: true, department: { select: { name: true } } },
    });

    const deptMap = new Map(
      employeesWithDepts.map((e) => [e.id, e.department?.name ?? "Без отдела"])
    );

    // Aggregate visits by department
    const visitsByDeptMap = new Map<string, number>();
    for (const v of visitsByDepartmentRaw) {
      const deptName = deptMap.get(v.employeeId) ?? "Без отдела";
      visitsByDeptMap.set(
        deptName,
        (visitsByDeptMap.get(deptName) ?? 0) + v._count.id
      );
    }

    // Get last visit date
    const lastVisit = recentVisitsData[0];

    // Build visits by month (last 6 months)
    const monthNames = [
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
    const visitsByMonthMap = new Map<string, number>();

    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      visitsByMonthMap.set(key, 0);
    }

    // Count visits per month
    for (const visit of visitsLast6Months) {
      const date = new Date(visit.visitDate);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      if (visitsByMonthMap.has(key)) {
        visitsByMonthMap.set(key, (visitsByMonthMap.get(key) ?? 0) + 1);
      }
    }

    // Convert to array
    const visitsByMonth = Array.from(visitsByMonthMap.entries()).map(
      ([key, visits]) => {
        const [, monthIndex] = key.split("-");
        return {
          month: monthNames[Number.parseInt(monthIndex, 10)],
          visits,
        };
      }
    );

    // Map order statuses
    const statusMap: Record<string, string> = {
      ORDERED: "ordered",
      IN_PROGRESS: "inProgress",
      COMPLETED: "completed",
      CANCELLED: "cancelled",
    };

    const ordersByStatus = allOrdersByStatus.map((item) => ({
      status: statusMap[item.status] ?? item.status.toLowerCase(),
      count: item._count.id,
    }));

    // Map visit statuses
    const visitStatusMap: Record<string, string> = {
      WAITING: "waiting",
      IN_PROGRESS: "inProgress",
      COMPLETED: "completed",
      CANCELED: "cancelled",
    };

    // Build response
    const response: PatientDashboardStatsResponseDto = {
      metrics: {
        totalVisits,
        visitsLastMonth,
        activeOrders: activeOrdersCount,
        totalDoctors: patient.doctors.length,
        activeDoctors: patient.doctors.filter((d) => d.isActive).length,
        lastVisitDate: lastVisit?.visitDate,
      },
      visitsByMonth,
      ordersByStatus,
      visitsByDepartment: Array.from(visitsByDeptMap.entries()).map(
        ([department, visits]) => ({
          department,
          visits,
        })
      ),
      recentVisits: recentVisitsData.map((v) => ({
        id: v.id,
        date: v.visitDate,
        doctor: `${v.employee.firstName} ${v.employee.lastName}`,
        department: v.employee.department?.name ?? "—",
        status: visitStatusMap[v.status] ?? v.status.toLowerCase(),
      })),
      activeOrders: activeOrdersData.map((o) => ({
        id: o.id,
        name: o.service.name,
        department: o.department?.name ?? "—",
        status: statusMap[o.status] ?? o.status.toLowerCase(),
        date: o.createdAt,
      })),
      treatingDoctors: patient.doctors.map((pd) => ({
        id: pd.id,
        name: `${pd.employee.firstName} ${pd.employee.lastName}`,
        specialty: pd.employee.department?.name ?? "—",
        status: pd.isActive ? "active" : "inactive",
      })),
    };

    return plainToInstance(PatientDashboardStatsResponseDto, response);
  }
}
