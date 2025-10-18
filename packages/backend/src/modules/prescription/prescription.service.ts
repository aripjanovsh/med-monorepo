import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { Prisma, VisitStatus } from "@prisma/client";
import { PrismaService } from "@/common/prisma/prisma.service";
import { CreatePrescriptionDto } from "./dto/create-prescription.dto";
import { UpdatePrescriptionDto } from "./dto/update-prescription.dto";
import { FindAllPrescriptionDto } from "./dto/find-all-prescription.dto";
import { PaginatedResponseDto } from "@/common/dto/pagination.dto";
import { PrescriptionResponseDto } from "./dto/prescription-response.dto";
import { plainToInstance } from "class-transformer";

@Injectable()
export class PrescriptionService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    createPrescriptionDto: CreatePrescriptionDto,
  ): Promise<PrescriptionResponseDto> {
    const { visitId, createdById, ...prescriptionData } = createPrescriptionDto;

    // Validate visit exists
    const visit = await this.prisma.visit.findUnique({
      where: { id: visitId },
    });

    if (!visit) {
      throw new NotFoundException(`Visit with ID ${visitId} not found`);
    }

    // Check if visit is not completed
    if (visit.status === VisitStatus.COMPLETED) {
      throw new BadRequestException(
        "Cannot add prescriptions to a completed visit",
      );
    }

    // Validate employee (doctor) exists
    const employee = await this.prisma.employee.findUnique({
      where: { id: createdById },
    });

    if (!employee) {
      throw new NotFoundException(
        `Employee (Doctor) with ID ${createdById} not found`,
      );
    }

    // Create prescription
    const created = await this.prisma.prescription.create({
      data: {
        ...prescriptionData,
        visitId,
        createdById,
      },
      include: {
        visit: {
          select: {
            id: true,
            visitDate: true,
            status: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            employeeId: true,
            firstName: true,
            middleName: true,
            lastName: true,
          },
        },
      },
    });

    return plainToInstance(PrescriptionResponseDto, created);
  }

  async findAll(
    query: FindAllPrescriptionDto,
  ): Promise<PaginatedResponseDto<PrescriptionResponseDto>> {
    const { page, limit, sortBy, sortOrder, visitId, patientId, employeeId } =
      query;

    const skip = (page - 1) * limit;

    const where: Prisma.PrescriptionWhereInput = {};

    if (visitId) {
      where.visitId = visitId;
    }

    if (patientId) {
      where.visit = {
        patientId,
      };
    }

    if (employeeId) {
      where.createdById = employeeId;
    }

    const orderBy: Prisma.PrescriptionOrderByWithRelationInput = sortBy
      ? { [sortBy]: sortOrder }
      : { createdAt: "desc" };

    const [data, total] = await Promise.all([
      this.prisma.prescription.findMany({
        where,
        include: {
          visit: {
            select: {
              id: true,
              visitDate: true,
              status: true,
            },
          },
          createdBy: {
            select: {
              id: true,
              employeeId: true,
              firstName: true,
              middleName: true,
              lastName: true,
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.prescription.count({ where }),
    ]);

    return {
      data: plainToInstance(PrescriptionResponseDto, data),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<PrescriptionResponseDto> {
    const prescription = await this.prisma.prescription.findUnique({
      where: { id },
      include: {
        visit: {
          select: {
            id: true,
            visitDate: true,
            status: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            employeeId: true,
            firstName: true,
            middleName: true,
            lastName: true,
          },
        },
      },
    });

    if (!prescription) {
      throw new NotFoundException(`Prescription with ID ${id} not found`);
    }

    return plainToInstance(PrescriptionResponseDto, prescription);
  }

  async findByVisit(visitId: string): Promise<PrescriptionResponseDto[]> {
    const prescriptions = await this.prisma.prescription.findMany({
      where: { visitId },
      include: {
        visit: {
          select: {
            id: true,
            visitDate: true,
            status: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            employeeId: true,
            firstName: true,
            middleName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return plainToInstance(PrescriptionResponseDto, prescriptions);
  }

  async update(
    id: string,
    updatePrescriptionDto: UpdatePrescriptionDto,
  ): Promise<PrescriptionResponseDto> {
    // Check if prescription exists
    const existing = await this.prisma.prescription.findUnique({
      where: { id },
      include: {
        visit: true,
      },
    });

    if (!existing) {
      throw new NotFoundException(`Prescription with ID ${id} not found`);
    }

    // Check if visit is not completed
    if (existing.visit.status === VisitStatus.COMPLETED) {
      throw new BadRequestException(
        "Cannot update prescriptions of a completed visit",
      );
    }

    const updated = await this.prisma.prescription.update({
      where: { id },
      data: updatePrescriptionDto,
      include: {
        visit: {
          select: {
            id: true,
            visitDate: true,
            status: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            employeeId: true,
            firstName: true,
            middleName: true,
            lastName: true,
          },
        },
      },
    });

    return plainToInstance(PrescriptionResponseDto, updated);
  }

  async remove(id: string): Promise<{ message: string }> {
    try {
      // Check if prescription exists
      const existing = await this.prisma.prescription.findUnique({
        where: { id },
        include: {
          visit: true,
        },
      });

      if (!existing) {
        throw new NotFoundException(`Prescription with ID ${id} not found`);
      }

      // Check if visit is not completed
      if (existing.visit.status === VisitStatus.COMPLETED) {
        throw new BadRequestException(
          "Cannot delete prescriptions of a completed visit",
        );
      }

      await this.prisma.prescription.delete({ where: { id } });

      return { message: "Prescription deleted successfully" };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          throw new NotFoundException(`Prescription with ID ${id} not found`);
        }
        throw new BadRequestException(
          `Cannot delete prescription: ${error.message}`,
        );
      }
      throw error;
    }
  }
}
