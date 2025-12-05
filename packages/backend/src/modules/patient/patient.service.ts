import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma, PatientStatus, VisitStatus } from "@prisma/client";
import { PrismaService } from "../../common/prisma/prisma.service";
import { CreatePatientDto } from "./dto/create-patient.dto";
import { UpdatePatientDto } from "./dto/update-patient.dto";
import { FindAllPatientDto } from "./dto/find-all-patient.dto";
import { PaginatedResponseDto } from "../../common/dto/pagination.dto";
import { PatientResponseDto } from "./dto/patient-response.dto";
import { PatientHistoryResponseDto } from "./dto/patient-history.dto";
import { plainToInstance } from "class-transformer";
import {
  generateEntityId,
  ENTITY_PREFIXES,
} from "../../common/utils/id-generator.util";

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
        patientId = await generateEntityId(
          tx,
          ENTITY_PREFIXES.PATIENT,
          patientData.organizationId
        );
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
      const patient = await tx.patient.findUnique({
        where: { id: created.id },
      });

      return plainToInstance(PatientResponseDto, patient);
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
          doctors: {
            where: { isActive: true },
            include: {
              employee: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  avatarId: true,
                  title: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.patient.count({ where }),
    ]);

    // Transform doctors to match DTO format
    const transformedPatients = patients.map((patient) => ({
      ...patient,
      doctors: patient.doctors.map((pd) => ({
        id: pd.id,
        employeeId: pd.employeeId,
        firstName: pd.employee.firstName,
        lastName: pd.employee.lastName,
        avatarId: pd.employee.avatarId,
        title: pd.employee.title
          ? {
              id: pd.employee.title.id,
              name: pd.employee.title.name,
            }
          : undefined,
        assignedAt: pd.assignedAt,
        isActive: pd.isActive,
      })),
    }));

    return {
      data: plainToInstance(PatientResponseDto, transformedPatients),
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
                avatarId: true,
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
        avatarId: pd.employee.avatarId,
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
      });

      return plainToInstance(PatientResponseDto, updatedPatient);
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
      });

      return plainToInstance(PatientResponseDto, patient);
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

  async getPatientHistory(
    patientId: string,
    organizationId: string
  ): Promise<PatientHistoryResponseDto> {
    // Check if patient exists
    const patient = await this.prisma.patient.findFirst({
      where: { id: patientId, organizationId },
    });

    if (!patient) {
      throw new NotFoundException("Patient not found");
    }

    // Fetch all related data in parallel
    const [visits, allergies, parameters] = await Promise.all([
      // Visits with all related data
      this.prisma.visit.findMany({
        where: { patientId, organizationId },
        orderBy: { visitDate: "desc" },
        include: {
          employee: {
            select: {
              id: true,
              firstName: true,
              middleName: true,
              lastName: true,
              title: { select: { name: true } },
            },
          },
          prescriptions: {
            orderBy: { createdAt: "desc" },
          },
          serviceOrders: {
            include: {
              service: {
                select: { name: true, type: true },
              },
            },
            orderBy: { createdAt: "desc" },
          },
        },
      }),

      // All allergies
      this.prisma.patientAllergy.findMany({
        where: { patientId, organizationId },
        orderBy: { createdAt: "desc" },
      }),

      // All patient parameters for charts
      this.prisma.patientParameter.findMany({
        where: { patientId, organizationId },
        orderBy: { measuredAt: "desc" },
      }),
    ]);

    // Transform visits
    const transformedVisits = visits.map((visit) => ({
      id: visit.id,
      visitDate: visit.visitDate,
      status: visit.status,
      complaint: visit.complaint,
      anamnesis: visit.anamnesis,
      diagnosis: visit.diagnosis,
      conclusion: visit.conclusion,
      notes: visit.notes,
      aiSummary: visit.aiSummary,
      doctor: {
        id: visit.employee.id,
        firstName: visit.employee.firstName,
        middleName: visit.employee.middleName ?? undefined,
        lastName: visit.employee.lastName,
        specialty: visit.employee.title?.name,
      },
      prescriptions: visit.prescriptions.map((p) => ({
        id: p.id,
        name: p.name,
        dosage: p.dosage ?? undefined,
        frequency: p.frequency ?? undefined,
        duration: p.duration ?? undefined,
        notes: p.notes ?? undefined,
        createdAt: p.createdAt,
      })),
      serviceOrders: visit.serviceOrders.map((so) => ({
        id: so.id,
        serviceName: so.service.name,
        serviceType: so.service.type,
        status: so.status,
        resultText: so.resultText ?? undefined,
        createdAt: so.createdAt,
      })),
    }));

    // Extract unique diagnoses from visits
    const diagnoses = visits
      .filter((v) => v.diagnosis)
      .map((v) => ({
        diagnosis: v.diagnosis!,
        visitDate: v.visitDate,
        doctorName: [
          v.employee.lastName,
          v.employee.firstName,
          v.employee.middleName,
        ]
          .filter(Boolean)
          .join(" "),
        visitId: v.id,
      }));

    // Get active medications (from recent visits - last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const activeMedications = visits
      .filter((v) => v.visitDate >= thirtyDaysAgo)
      .flatMap((v) =>
        v.prescriptions.map((p) => ({
          id: p.id,
          name: p.name,
          dosage: p.dosage ?? undefined,
          frequency: p.frequency ?? undefined,
          duration: p.duration ?? undefined,
          prescribedAt: p.createdAt,
          doctorName: [
            v.employee.lastName,
            v.employee.firstName,
            v.employee.middleName,
          ]
            .filter(Boolean)
            .join(" "),
        }))
      );

    // Transform allergies
    const transformedAllergies = allergies.map((a) => ({
      id: a.id,
      substance: a.substance,
      reaction: a.reaction ?? undefined,
      severity: a.severity ?? undefined,
      note: a.note ?? undefined,
      createdAt: a.createdAt,
    }));

    // Transform parameters
    const transformedParameters = parameters.map((p) => ({
      id: p.id,
      parameterCode: p.parameterCode,
      valueNumeric: p.valueNumeric ? Number(p.valueNumeric) : undefined,
      valueText: p.valueText ?? undefined,
      unit: p.unit ?? undefined,
      measuredAt: p.measuredAt,
    }));

    // Calculate stats
    const completedVisits = visits.filter(
      (v) => v.status === VisitStatus.COMPLETED
    );
    const uniqueDiagnoses = new Set(
      visits.map((v) => v.diagnosis).filter(Boolean)
    );

    const stats = {
      totalVisits: visits.length,
      completedVisits: completedVisits.length,
      totalAllergies: allergies.length,
      totalDiagnoses: uniqueDiagnoses.size,
      activeMedications: activeMedications.length,
      lastVisitDate: visits[0]?.visitDate,
    };

    return plainToInstance(PatientHistoryResponseDto, {
      visits: transformedVisits,
      allergies: transformedAllergies,
      parameters: transformedParameters,
      diagnoses,
      activeMedications,
      stats,
    });
  }
}
