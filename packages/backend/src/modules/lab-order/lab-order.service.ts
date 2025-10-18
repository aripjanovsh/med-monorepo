import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { Prisma, VisitStatus } from "@prisma/client";
import { PrismaService } from "@/common/prisma/prisma.service";
import { CreateLabOrderDto } from "./dto/create-lab-order.dto";
import { UpdateLabOrderDto } from "./dto/update-lab-order.dto";
import { UpdateLabOrderStatusDto } from "./dto/update-lab-order-status.dto";
import { FindAllLabOrderDto } from "./dto/find-all-lab-order.dto";
import { PaginatedResponseDto } from "@/common/dto/pagination.dto";
import { LabOrderResponseDto } from "./dto/lab-order-response.dto";
import { plainToInstance } from "class-transformer";

@Injectable()
export class LabOrderService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    createLabOrderDto: CreateLabOrderDto,
  ): Promise<LabOrderResponseDto> {
    const { visitId, createdById, ...labOrderData } = createLabOrderDto;

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
        "Cannot add lab orders to a completed visit",
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

    // Create lab order
    const created = await this.prisma.labOrder.create({
      data: {
        ...labOrderData,
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

    return plainToInstance(LabOrderResponseDto, created);
  }

  async findAll(
    query: FindAllLabOrderDto,
  ): Promise<PaginatedResponseDto<LabOrderResponseDto>> {
    const {
      page,
      limit,
      sortBy,
      sortOrder,
      status,
      visitId,
      patientId,
      employeeId,
    } = query;

    const skip = (page - 1) * limit;

    const where: Prisma.LabOrderWhereInput = {};

    if (status) {
      where.status = status;
    }

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

    const orderBy: Prisma.LabOrderOrderByWithRelationInput = sortBy
      ? { [sortBy]: sortOrder }
      : { createdAt: "desc" };

    const [data, total] = await Promise.all([
      this.prisma.labOrder.findMany({
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
      this.prisma.labOrder.count({ where }),
    ]);

    return {
      data: plainToInstance(LabOrderResponseDto, data),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<LabOrderResponseDto> {
    const labOrder = await this.prisma.labOrder.findUnique({
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

    if (!labOrder) {
      throw new NotFoundException(`Lab order with ID ${id} not found`);
    }

    return plainToInstance(LabOrderResponseDto, labOrder);
  }

  async findByVisit(visitId: string): Promise<LabOrderResponseDto[]> {
    const labOrders = await this.prisma.labOrder.findMany({
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

    return plainToInstance(LabOrderResponseDto, labOrders);
  }

  async update(
    id: string,
    updateLabOrderDto: UpdateLabOrderDto,
  ): Promise<LabOrderResponseDto> {
    // Check if lab order exists
    const existing = await this.prisma.labOrder.findUnique({
      where: { id },
      include: {
        visit: true,
      },
    });

    if (!existing) {
      throw new NotFoundException(`Lab order with ID ${id} not found`);
    }

    // Check if visit is not completed
    if (existing.visit.status === VisitStatus.COMPLETED) {
      throw new BadRequestException(
        "Cannot update lab orders of a completed visit",
      );
    }

    const updated = await this.prisma.labOrder.update({
      where: { id },
      data: updateLabOrderDto,
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

    return plainToInstance(LabOrderResponseDto, updated);
  }

  async updateStatus(
    id: string,
    updateStatusDto: UpdateLabOrderStatusDto,
  ): Promise<LabOrderResponseDto> {
    const { status } = updateStatusDto;

    // Check if lab order exists
    const existing = await this.prisma.labOrder.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Lab order with ID ${id} not found`);
    }

    const updated = await this.prisma.labOrder.update({
      where: { id },
      data: { status },
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

    return plainToInstance(LabOrderResponseDto, updated);
  }

  async remove(id: string): Promise<{ message: string }> {
    try {
      // Check if lab order exists
      const existing = await this.prisma.labOrder.findUnique({
        where: { id },
        include: {
          visit: true,
        },
      });

      if (!existing) {
        throw new NotFoundException(`Lab order with ID ${id} not found`);
      }

      // Check if visit is not completed
      if (existing.visit.status === VisitStatus.COMPLETED) {
        throw new BadRequestException(
          "Cannot delete lab orders of a completed visit",
        );
      }

      await this.prisma.labOrder.delete({ where: { id } });

      return { message: "Lab order deleted successfully" };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          throw new NotFoundException(`Lab order with ID ${id} not found`);
        }
        throw new BadRequestException(
          `Cannot delete lab order: ${error.message}`,
        );
      }
      throw error;
    }
  }
}
