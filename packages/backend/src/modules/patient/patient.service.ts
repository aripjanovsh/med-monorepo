import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma, PatientStatus } from "@prisma/client";
import { PrismaService } from "../../common/prisma/prisma.service";
import { CreatePatientDto } from "./dto/create-patient.dto";
import { UpdatePatientDto } from "./dto/update-patient.dto";
import { FindAllPatientDto } from "./dto/find-all-patient.dto";
import { PaginatedResponseDto } from "../../common/dto/pagination.dto";
import { PatientResponseDto } from "./dto/patient-response.dto";
import { plainToInstance } from "class-transformer";
import { generateMemorableId } from "../../common/utils/id-generator.util";

@Injectable()
export class PatientService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    createPatientDto: CreatePatientDto
  ): Promise<PatientResponseDto> {
    const { contacts, doctorIds, ...patientData } = createPatientDto;

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

      // Create contacts if provided
      if (contacts && contacts.length > 0) {
        await tx.patientContact.createMany({
          data: contacts.map((contact) => ({
            patientId: created.id,
            ...contact,
          })),
        });
      }

      // Assign doctors if provided
      if (doctorIds && doctorIds.length > 0) {
        await tx.patientDoctor.createMany({
          data: doctorIds.map((employeeId) => ({
            patientId: created.id,
            employeeId,
          })),
          skipDuplicates: true,
        });
      }

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
          contacts: true,
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
        {
          contacts: {
            some: {
              primaryPhone: { contains: search, mode: "insensitive" },
            },
          },
        },
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
          contacts: true,
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
        contacts: true,
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
        contacts: true,
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

      const { contacts, doctorIds, excludePatientId, ...coreUpdate } =
        updatePatientDto;

      // Update core patient data
      await tx.patient.update({
        where,
        data: coreUpdate,
      });

      // Update contacts if provided
      if (contacts) {
        // Delete existing contacts and create new ones
        await tx.patientContact.deleteMany({
          where: { patientId: id },
        });

        if (contacts.length > 0) {
          await tx.patientContact.createMany({
            data: contacts.map((contact) => ({
              patientId: id,
              ...contact,
            })),
          });
        }
      }

      // Update doctor assignments if provided
      if (doctorIds) {
        const existing = await tx.patientDoctor.findMany({
          where: { patientId: id },
          select: { employeeId: true },
        });
        const existingIds = new Set(existing.map((e) => e.employeeId));
        const incomingIds = new Set(doctorIds);

        const toAdd = doctorIds.filter((sid) => !existingIds.has(sid));
        const toRemove = [...existingIds].filter(
          (sid) => !incomingIds.has(sid)
        );

        if (toAdd.length > 0) {
          await tx.patientDoctor.createMany({
            data: toAdd.map((employeeId) => ({
              patientId: id,
              employeeId,
            })),
            skipDuplicates: true,
          });
        }
        if (toRemove.length > 0) {
          await tx.patientDoctor.deleteMany({
            where: { patientId: id, employeeId: { in: toRemove } },
          });
        }
      }

      const updatedPatient = await tx.patient.findUnique({
        where: { id },
        include: {
          primaryLanguage: true,
          secondaryLanguage: true,
          country: true,
          region: true,
          city: true,
          district: true,
          contacts: true,
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
          contacts: true,
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
}
