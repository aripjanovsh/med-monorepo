import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { Prisma, OrderStatus, PaymentStatus, ServiceTypeEnum } from "@prisma/client";
import { PrismaService } from "@/common/prisma/prisma.service";
import { CreateServiceOrderDto } from "./dto/create-service-order.dto";
import { UpdateServiceOrderDto } from "./dto/update-service-order.dto";
import { FindAllServiceOrderDto } from "./dto/find-all-service-order.dto";
import { PaginatedResponseDto } from "@/common/dto/pagination.dto";
import { ServiceOrderResponseDto } from "./dto/service-order-response.dto";
import { plainToInstance } from "class-transformer";

@Injectable()
export class ServiceOrderService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    createDto: CreateServiceOrderDto
  ): Promise<ServiceOrderResponseDto[]> {
    const {
      visitId,
      patientId,
      doctorId,
      services,
      organizationId,
      protocolTemplateId,
    } = createDto;

    return await this.prisma.$transaction(async (tx) => {
      // Validate visit exists
      if (visitId) {
        const visit = await tx.visit.findUnique({
          where: { id: visitId, organizationId },
        });

        if (!visit) {
          throw new NotFoundException(`Visit with ID ${visitId} not found`);
        }
      }

      // Validate patient exists
      const patient = await tx.patient.findUnique({
        where: { id: patientId, organizationId },
      });

      if (!patient) {
        throw new NotFoundException(`Patient with ID ${patientId} not found`);
      }

      const employee = await tx.employee.findUnique({
        where: { id: doctorId, organizationId },
      });

      if (!employee) {
        throw new NotFoundException(
          `Employee with ID ${doctorId} not found in organization ${organizationId}`
        );
      }

      // Validate protocol template if provided
      if (protocolTemplateId) {
        const protocol = await tx.protocolTemplate.findUnique({
          where: { id: protocolTemplateId, organizationId },
        });

        if (!protocol) {
          throw new NotFoundException(
            `Protocol template with ID ${protocolTemplateId} not found`
          );
        }
      }

      // Create service orders
      const createdOrders = [];

      for (const serviceItem of services) {
        // Validate service exists
        const service = await tx.service.findUnique({
          where: { id: serviceItem.serviceId },
        });

        if (!service) {
          throw new NotFoundException(
            `Service with ID ${serviceItem.serviceId} not found`
          );
        }

        // Create service order
        const order = await tx.serviceOrder.create({
          data: {
            patientId,
            visitId: visitId ?? null,
            doctorId, // Employee ID
            serviceId: serviceItem.serviceId,
            departmentId: service.departmentId,
            protocolTemplateId: protocolTemplateId ?? null,
            status: OrderStatus.ORDERED,
            paymentStatus: PaymentStatus.UNPAID,
            organizationId,
          },
          include: {
            patient: {
              select: {
                id: true,
                patientId: true,
                firstName: true,
                middleName: true,
                lastName: true,
              },
            },
            doctor: {
              select: {
                id: true,
                employeeId: true,
                firstName: true,
                middleName: true,
                lastName: true,
              },
            },
            service: {
              select: {
                id: true,
                name: true,
                code: true,
                price: true,
                type: true,
              },
            },
            department: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
            protocolTemplate: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        });

        createdOrders.push(order);
      }

      return plainToInstance(ServiceOrderResponseDto, createdOrders);
    });
  }

  async findAll(
    query: FindAllServiceOrderDto
  ): Promise<PaginatedResponseDto<ServiceOrderResponseDto>> {
    const {
      page,
      limit,
      sortBy,
      sortOrder,
      organizationId,
      visitId,
      doctorId,
      serviceId,
      departmentId,
      status,
      paymentStatus,
      serviceType,
      search,
      dateFrom,
      dateTo,
    } = query;

    const pageNumber = page ?? 1;
    const pageSize = limit ?? 10;
    const skip = (pageNumber - 1) * pageSize;

    const where: Prisma.ServiceOrderWhereInput = {};

    if (organizationId) {
      where.organizationId = organizationId;
    }

    if (visitId) {
      where.visitId = visitId;
    }

    if (doctorId) {
      where.doctorId = doctorId;
    }

    if (serviceId) {
      where.serviceId = serviceId;
    }

    if (departmentId) {
      where.departmentId = departmentId.includes(",")
        ? { in: departmentId.split(",") }
        : departmentId;
    }

    if (status) {
      where.status = status.includes(",")
        ? { in: status.split(",") as OrderStatus[] }
        : status as OrderStatus;
    }

    if (paymentStatus) {
      where.paymentStatus = paymentStatus.includes(",")
        ? { in: paymentStatus.split(",") as PaymentStatus[] }
        : paymentStatus as PaymentStatus;
    }

    // Build service filter conditions
    const serviceConditions: Prisma.ServiceWhereInput = {};
    if (serviceType) {
      serviceConditions.type = serviceType as ServiceTypeEnum;
    }

    // Build search conditions
    if (search) {
      const searchConditions: Prisma.ServiceOrderWhereInput[] = [
        {
          service: {
            name: {
              contains: search,
              mode: "insensitive" as Prisma.QueryMode,
            },
            ...serviceConditions,
          },
        },
        {
          patient: {
            firstName: {
              contains: search,
              mode: "insensitive" as Prisma.QueryMode,
            },
          },
        },
        {
          patient: {
            lastName: {
              contains: search,
              mode: "insensitive" as Prisma.QueryMode,
            },
          },
        },
      ];
      
      if (Object.keys(serviceConditions).length > 0) {
        where.AND = [
          { OR: searchConditions },
        ];
      } else {
        where.OR = searchConditions;
      }
    } else if (Object.keys(serviceConditions).length > 0) {
      where.service = serviceConditions;
    }

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) {
        where.createdAt.gte = new Date(dateFrom);
      }
      if (dateTo) {
        where.createdAt.lte = new Date(dateTo);
      }
    }

    const orderBy: Prisma.ServiceOrderOrderByWithRelationInput = sortBy
      ? { [sortBy]: sortOrder }
      : { createdAt: "desc" };

    const [data, total] = await Promise.all([
      this.prisma.serviceOrder.findMany({
        where,
        include: {
          patient: {
            select: {
              id: true,
              patientId: true,
              firstName: true,
              middleName: true,
              lastName: true,
            },
          },
          doctor: {
            select: {
              id: true,
              employeeId: true,
              firstName: true,
              middleName: true,
              lastName: true,
            },
          },
          service: {
            select: {
              id: true,
              name: true,
              code: true,
              price: true,
              type: true,
            },
          },
          department: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          protocolTemplate: {
            select: {
              id: true,
              name: true,
            },
          },
          performedBy: {
            select: {
              id: true,
              employee: {
                select: {
                  firstName: true,
                  middleName: true,
                  lastName: true,
                },
              },
            },
          },
        },
        orderBy,
        skip,
        take: pageSize,
      }),
      this.prisma.serviceOrder.count({ where }),
    ]);

    return {
      data: plainToInstance(ServiceOrderResponseDto, data),
      meta: {
        page: pageNumber,
        limit: pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  async findOne(
    id: string,
    organizationId?: string
  ): Promise<ServiceOrderResponseDto> {
    const where: Prisma.ServiceOrderWhereUniqueInput = { id };

    const order = await this.prisma.serviceOrder.findUnique({
      where,
      include: {
        patient: {
          select: {
            id: true,
            patientId: true,
            firstName: true,
            middleName: true,
            lastName: true,
          },
        },
        doctor: {
          select: {
            id: true,
            employeeId: true,
            firstName: true,
            middleName: true,
            lastName: true,
          },
        },
        service: {
          select: {
            id: true,
            name: true,
            code: true,
            price: true,
            type: true,
          },
        },
        department: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        protocolTemplate: {
          select: {
            id: true,
            name: true,
          },
        },
        performedBy: {
          select: {
            id: true,
            employee: {
              select: {
                firstName: true,
                middleName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException(`Service order with ID ${id} not found`);
    }

    // Validate organization if provided
    if (organizationId && order.organizationId !== organizationId) {
      throw new NotFoundException(`Service order with ID ${id} not found`);
    }

    return plainToInstance(ServiceOrderResponseDto, order);
  }

  async update(
    id: string,
    updateDto: UpdateServiceOrderDto
  ): Promise<ServiceOrderResponseDto> {
    const { organizationId, ...updateData } = updateDto;

    // Check if order exists
    const existing = await this.prisma.serviceOrder.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Service order with ID ${id} not found`);
    }

    // Validate organization
    if (organizationId && existing.organizationId !== organizationId) {
      throw new NotFoundException(`Service order with ID ${id} not found`);
    }

    // Check if order is paid and trying to modify critical fields
    if (
      existing.paymentStatus === PaymentStatus.PAID &&
      (updateData.status === OrderStatus.CANCELLED ||
        updateData.paymentStatus === PaymentStatus.UNPAID)
    ) {
      throw new BadRequestException(
        "Cannot cancel or modify payment status of a paid order"
      );
    }

    // Auto-set timestamps based on status changes
    if (updateData.status === OrderStatus.IN_PROGRESS && !existing.startedAt) {
      updateData.startedAt = new Date();
    }

    if (updateData.status === OrderStatus.COMPLETED) {
      if (!updateData.resultAt) {
        updateData.resultAt = new Date();
      }
      if (!existing.finishedAt) {
        updateData.finishedAt = new Date();
      }
    }

    const updated = await this.prisma.serviceOrder.update({
      where: { id },
      data: updateData,
      include: {
        patient: {
          select: {
            id: true,
            patientId: true,
            firstName: true,
            middleName: true,
            lastName: true,
          },
        },
        doctor: {
          select: {
            id: true,
            employeeId: true,
            firstName: true,
            middleName: true,
            lastName: true,
          },
        },
        service: {
          select: {
            id: true,
            name: true,
            code: true,
            price: true,
            type: true,
          },
        },
        department: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        protocolTemplate: {
          select: {
            id: true,
            name: true,
          },
        },
        performedBy: {
          select: {
            id: true,
            employee: {
              select: {
                firstName: true,
                middleName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    return plainToInstance(ServiceOrderResponseDto, updated);
  }

  async remove(
    id: string,
    organizationId?: string
  ): Promise<{ message: string }> {
    try {
      // Check if order exists
      const existing = await this.prisma.serviceOrder.findUnique({
        where: { id },
      });

      if (!existing) {
        throw new NotFoundException(`Service order with ID ${id} not found`);
      }

      // Validate organization
      if (organizationId && existing.organizationId !== organizationId) {
        throw new NotFoundException(`Service order with ID ${id} not found`);
      }

      // Check if order is paid
      if (existing.paymentStatus === PaymentStatus.PAID) {
        throw new BadRequestException("Cannot delete a paid order");
      }

      await this.prisma.serviceOrder.delete({ where: { id } });

      return { message: "Service order deleted successfully" };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          throw new NotFoundException(`Service order with ID ${id} not found`);
        }
        throw new BadRequestException(
          `Cannot delete service order: ${error.message}`
        );
      }
      throw error;
    }
  }
}
