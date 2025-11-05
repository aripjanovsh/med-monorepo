import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
  forwardRef,
} from "@nestjs/common";
import { PrismaService } from "@/common/prisma/prisma.service";
import { CreateInvoiceDto } from "./dto/create-invoice.dto";
import { CreateInvoiceFromVisitDto } from "./dto/create-invoice-from-visit.dto";
import { UpdateInvoiceDto } from "./dto/update-invoice.dto";
import { CreatePaymentDto } from "./dto/create-payment.dto";
import { FindAllInvoiceDto } from "./dto/find-all-invoice.dto";
import { AddInvoiceItemDto } from "./dto/add-invoice-item.dto";
import { Decimal } from "@prisma/client/runtime/library";
import { PaymentStatus } from "@prisma/client";
import { ServiceOrderQueueService } from "../service-order/service-order-queue.service";
import { generateMemorableId } from "@/common/utils/id-generator.util";

@Injectable()
export class InvoiceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly queueService: ServiceOrderQueueService
  ) {}

  async create(dto: CreateInvoiceDto, createdById: string) {
    const organizationId = dto.organizationId;

    if (!createdById) {
      throw new BadRequestException(
        "User must have an associated employee record to create invoices"
      );
    }

    // Validate patient exists
    const patient = await this.prisma.patient.findUnique({
      where: { id: dto.patientId, organizationId },
    });

    if (!patient) {
      throw new NotFoundException("Patient not found");
    }

    // Validate visit if provided
    if (dto.visitId) {
      const visit = await this.prisma.visit.findFirst({
        where: {
          id: dto.visitId,
          patientId: dto.patientId,
          organizationId,
        },
      });

      if (!visit) {
        throw new NotFoundException("Visit not found");
      }

      // Check if there's already an unpaid invoice for this visit with same serviceOrders
      const serviceOrderIds = dto.items
        .map((item) => item.serviceOrderId)
        .filter(Boolean);

      if (serviceOrderIds.length > 0) {
        const existingInvoice = await this.prisma.invoice.findFirst({
          where: {
            visitId: dto.visitId,
            status: {
              in: [PaymentStatus.UNPAID, PaymentStatus.PARTIALLY_PAID],
            },
            organizationId,
            items: {
              some: {
                serviceOrderId: { in: serviceOrderIds },
              },
            },
          },
          include: {
            patient: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                middleName: true,
              },
            },
            visit: true,
            items: {
              include: {
                service: true,
              },
            },
            payments: {
              orderBy: {
                createdAt: "asc",
              },
            },
          },
        });

        if (existingInvoice) {
          // Return existing unpaid/partially paid invoice instead of creating new one
          return existingInvoice;
        }
      }
    }

    // Validate services exist and get department info
    const serviceIds = dto.items.map((item) => item.serviceId);
    const services = await this.prisma.service.findMany({
      where: {
        id: { in: serviceIds },
        organizationId,
        isActive: true,
      },
      include: {
        department: true,
      },
    });

    if (services.length !== serviceIds.length) {
      throw new BadRequestException(
        "One or more services not found or inactive"
      );
    }

    // Get doctor ID from visit or use creator as fallback
    let doctorId = createdById;
    if (dto.visitId) {
      const visit = await this.prisma.visit.findUnique({
        where: { id: dto.visitId },
        select: { employeeId: true },
      });
      if (visit?.employeeId) {
        doctorId = visit.employeeId;
      }
    }

    // Calculate total amount and prepare items data
    let totalAmount = new Decimal(0);
    const itemsData: Array<{
      serviceId: string;
      serviceOrderId?: string;
      description?: string;
      quantity: number;
      unitPrice: Decimal;
      discount: Decimal;
      totalPrice: Decimal;
    }> = [];

    // Create ServiceOrders for items without one
    const serviceOrdersToCreate: Array<{
      itemIndex: number;
      serviceId: string;
      departmentId: string | null;
    }> = [];

    dto.items.forEach((item, index) => {
      const service = services.find((s) => s.id === item.serviceId);
      const unitPrice = item.unitPrice ?? service.price;

      if (!unitPrice) {
        throw new BadRequestException(
          `Service ${service.name} has no price defined`
        );
      }

      const discount = item.discount ?? 0;
      const totalPrice = new Decimal(unitPrice)
        .mul(item.quantity)
        .sub(discount);

      totalAmount = totalAmount.add(totalPrice);

      // Track items that need ServiceOrder creation
      if (!item.serviceOrderId) {
        serviceOrdersToCreate.push({
          itemIndex: index,
          serviceId: item.serviceId,
          departmentId: service.departmentId,
        });
      }

      itemsData.push({
        serviceId: item.serviceId,
        serviceOrderId: item.serviceOrderId,
        description: item.description,
        quantity: item.quantity,
        unitPrice: new Decimal(unitPrice),
        discount: new Decimal(discount),
        totalPrice,
      });
    });

    // Create invoice with items and ServiceOrders in a transaction
    const invoice = await this.prisma.$transaction(async (tx) => {
      const invoiceNumber = generateMemorableId("INV");

      // Create ServiceOrders for items without them
      const createdServiceOrders = await Promise.all(
        serviceOrdersToCreate.map((so) =>
          tx.serviceOrder.create({
            data: {
              patientId: dto.patientId,
              visitId: dto.visitId,
              doctorId,
              serviceId: so.serviceId,
              departmentId: so.departmentId,
              status: "ORDERED",
              paymentStatus: PaymentStatus.UNPAID,
              organizationId,
            },
          })
        )
      );

      // Update itemsData with created ServiceOrder IDs
      createdServiceOrders.forEach((serviceOrder, idx) => {
        const itemIndex = serviceOrdersToCreate[idx].itemIndex;
        itemsData[itemIndex].serviceOrderId = serviceOrder.id;
      });

      // Create invoice with all items
      return tx.invoice.create({
        data: {
          invoiceNumber,
          patientId: dto.patientId,
          visitId: dto.visitId,
          totalAmount,
          paidAmount: new Decimal(0),
          status: PaymentStatus.UNPAID,
          notes: dto.notes,
          dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
          createdById,
          organizationId,
          items: {
            create: itemsData,
          },
        },
        include: {
          patient: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              middleName: true,
            },
          },
          visit: {
            select: {
              id: true,
              visitDate: true,
            },
          },
          items: {
            include: {
              service: {
                select: {
                  id: true,
                  name: true,
                  code: true,
                },
              },
            },
          },
          payments: true,
        },
      });
    });

    return invoice;
  }

  async createFromVisit(dto: CreateInvoiceFromVisitDto, createdById: string) {
    const {
      organizationId,
      visitId,
      additionalServices = [],
      notes,
      dueDate,
    } = dto;

    if (!createdById) {
      throw new BadRequestException(
        "User must have an associated employee record to create invoices"
      );
    }

    // Validate visit exists
    const visit = await this.prisma.visit.findFirst({
      where: { id: visitId, organizationId },
      include: {
        patient: true,
        serviceOrders: {
          where: { paymentStatus: PaymentStatus.UNPAID },
          include: { service: true },
        },
      },
    });

    if (!visit) {
      throw new NotFoundException("Visit not found");
    }

    if (visit.serviceOrders.length === 0 && additionalServices.length === 0) {
      throw new BadRequestException(
        "No unpaid services found for this visit and no additional services provided"
      );
    }

    // Build invoice items from unpaid service orders
    const itemsData = [];
    let totalAmount = new Decimal(0);

    for (const order of visit.serviceOrders) {
      const unitPrice = order.service.price;
      if (!unitPrice) {
        throw new BadRequestException(
          `Service ${order.service.name} has no price defined`
        );
      }

      const totalPrice = new Decimal(unitPrice);
      totalAmount = totalAmount.add(totalPrice);

      itemsData.push({
        serviceId: order.serviceId,
        serviceOrderId: order.id,
        quantity: 1,
        unitPrice,
        discount: new Decimal(0),
        totalPrice,
      });
    }

    // Add additional services if provided
    if (additionalServices.length > 0) {
      const additionalServiceIds = additionalServices.map((s) => s.serviceId);
      const services = await this.prisma.service.findMany({
        where: {
          id: { in: additionalServiceIds },
          organizationId,
          isActive: true,
        },
      });

      if (services.length !== additionalServiceIds.length) {
        throw new BadRequestException(
          "One or more additional services not found or inactive"
        );
      }

      for (const item of additionalServices) {
        const service = services.find((s) => s.id === item.serviceId);
        const unitPrice = item.unitPrice ?? service.price;

        if (!unitPrice) {
          throw new BadRequestException(
            `Service ${service.name} has no price defined`
          );
        }

        const discount = item.discount ?? 0;
        const totalPrice = new Decimal(unitPrice)
          .mul(item.quantity)
          .sub(discount);

        totalAmount = totalAmount.add(totalPrice);

        itemsData.push({
          serviceId: item.serviceId,
          serviceOrderId: item.serviceOrderId,
          description: item.description,
          quantity: item.quantity,
          unitPrice: new Decimal(unitPrice),
          discount: new Decimal(discount),
          totalPrice,
        });
      }
    }

    // Generate invoice number
    const invoiceNumber = await this.generateInvoiceNumber(organizationId);

    // Create invoice with items
    const invoice = await this.prisma.invoice.create({
      data: {
        invoiceNumber,
        patientId: visit.patientId,
        visitId,
        totalAmount,
        paidAmount: new Decimal(0),
        status: PaymentStatus.UNPAID,
        notes,
        dueDate: dueDate ? new Date(dueDate) : null,
        createdById,
        organizationId,
        items: {
          create: itemsData,
        },
      },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            middleName: true,
          },
        },
        visit: {
          select: {
            id: true,
            visitDate: true,
          },
        },
        items: {
          include: {
            service: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
          },
        },
        payments: true,
      },
    });

    return invoice;
  }

  async findAll(query: FindAllInvoiceDto) {
    const {
      page = 1,
      limit = 20,
      dateFrom,
      dateTo,
      organizationId,
      search,
      ...filters
    } = query;
    const skip = (page - 1) * limit;

    const where = {
      organizationId,
      ...filters,
      ...(dateFrom || dateTo
        ? {
            createdAt: {
              ...(dateFrom && { gte: new Date(dateFrom) }),
              ...(dateTo && { lte: new Date(dateTo) }),
            },
          }
        : {}),
      ...(search
        ? {
            OR: [
              {
                invoiceNumber: {
                  contains: search,
                  mode: "insensitive" as const,
                },
              },
              {
                patient: {
                  OR: [
                    {
                      firstName: {
                        contains: search,
                        mode: "insensitive" as const,
                      },
                    },
                    {
                      lastName: {
                        contains: search,
                        mode: "insensitive" as const,
                      },
                    },
                    {
                      middleName: {
                        contains: search,
                        mode: "insensitive" as const,
                      },
                    },
                  ],
                },
              },
            ],
          }
        : {}),
    };

    const [data, total] = await Promise.all([
      this.prisma.invoice.findMany({
        where,
        skip,
        take: limit,
        include: {
          patient: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              middleName: true,
            },
          },
          visit: {
            select: {
              id: true,
              visitDate: true,
            },
          },
          items: {
            include: {
              service: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          payments: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.invoice.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, organizationId?: string) {
    const invoice = await this.prisma.invoice.findFirst({
      where: {
        id,
        ...(organizationId && { organizationId }),
      },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            middleName: true,
            contacts: true,
          },
        },
        visit: {
          select: {
            id: true,
            visitDate: true,
            status: true,
            employee: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                title: true,
              },
            },
          },
        },
        items: {
          include: {
            service: {
              select: {
                id: true,
                code: true,
                name: true,
                type: true,
              },
            },
            serviceOrder: {
              select: {
                id: true,
                status: true,
              },
            },
          },
        },
        payments: {
          include: {
            paidBy: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
          orderBy: { paidAt: "desc" },
        },
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!invoice) {
      throw new NotFoundException("Invoice not found");
    }

    return invoice;
  }

  async update(id: string, dto: UpdateInvoiceDto, organizationId: string) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id, organizationId },
    });

    if (!invoice) {
      throw new NotFoundException("Invoice not found");
    }

    if (invoice.status === PaymentStatus.PAID) {
      throw new BadRequestException("Cannot update paid invoice");
    }

    return this.prisma.invoice.update({
      where: { id },
      data: {
        notes: dto.notes,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
      },
      include: {
        patient: true,
        items: { include: { service: true } },
        payments: true,
      },
    });
  }

  async remove(id: string, organizationId: string) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id, organizationId },
      include: { payments: true },
    });

    if (!invoice) {
      throw new NotFoundException("Invoice not found");
    }

    if (invoice.payments.length > 0) {
      throw new BadRequestException(
        "Cannot delete invoice with payments. Consider refunding instead."
      );
    }

    await this.prisma.invoice.delete({ where: { id } });
    return { message: "Invoice deleted successfully" };
  }

  async addItem(
    invoiceId: string,
    dto: AddInvoiceItemDto,
    organizationId: string
  ) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id: invoiceId, organizationId },
      include: { items: true },
    });

    if (!invoice) {
      throw new NotFoundException("Invoice not found");
    }

    if (invoice.status === PaymentStatus.PAID) {
      throw new BadRequestException("Cannot add items to paid invoice");
    }

    // Validate service
    const service = await this.prisma.service.findFirst({
      where: { id: dto.serviceId, organizationId, isActive: true },
    });

    if (!service) {
      throw new NotFoundException("Service not found or inactive");
    }

    const unitPrice = dto.unitPrice ?? service.price;
    if (!unitPrice) {
      throw new BadRequestException("Service has no price defined");
    }

    const discount = dto.discount ?? 0;
    const totalPrice = new Decimal(unitPrice).mul(dto.quantity).sub(discount);

    // Create item
    const item = await this.prisma.invoiceItem.create({
      data: {
        invoiceId,
        serviceId: dto.serviceId,
        serviceOrderId: dto.serviceOrderId,
        description: dto.description,
        quantity: dto.quantity,
        unitPrice: new Decimal(unitPrice),
        discount: new Decimal(discount),
        totalPrice,
      },
      include: {
        service: true,
      },
    });

    // Recalculate invoice total
    const newTotalAmount = invoice.totalAmount.add(totalPrice);
    await this.prisma.invoice.update({
      where: { id: invoiceId },
      data: { totalAmount: newTotalAmount },
    });

    return item;
  }

  async removeItem(invoiceId: string, itemId: string, organizationId: string) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id: invoiceId, organizationId },
    });

    if (!invoice) {
      throw new NotFoundException("Invoice not found");
    }

    if (invoice.status === PaymentStatus.PAID) {
      throw new BadRequestException("Cannot remove items from paid invoice");
    }

    const item = await this.prisma.invoiceItem.findFirst({
      where: { id: itemId, invoiceId },
    });

    if (!item) {
      throw new NotFoundException("Invoice item not found");
    }

    // Remove item
    await this.prisma.invoiceItem.delete({ where: { id: itemId } });

    // Recalculate invoice total
    const newTotalAmount = invoice.totalAmount.sub(item.totalPrice);
    await this.prisma.invoice.update({
      where: { id: invoiceId },
      data: { totalAmount: newTotalAmount },
    });

    return { message: "Invoice item removed successfully" };
  }

  async addPayment(invoiceId: string, dto: CreatePaymentDto, paidById: string) {
    const { organizationId } = dto;

    if (!paidById) {
      throw new BadRequestException(
        "User must have an associated employee record to process payments"
      );
    }

    // Get invoice with current payments
    const invoice = await this.prisma.invoice.findFirst({
      where: { id: invoiceId, organizationId },
      include: { payments: true, items: true },
    });

    if (!invoice) {
      throw new NotFoundException("Invoice not found");
    }

    if (invoice.status === PaymentStatus.REFUNDED) {
      throw new BadRequestException("Cannot add payment to refunded invoice");
    }

    // Calculate remaining amount
    const remainingAmount = invoice.totalAmount.sub(invoice.paidAmount);

    if (new Decimal(dto.amount).gt(remainingAmount)) {
      throw new BadRequestException(
        `Payment amount (${dto.amount}) exceeds remaining invoice amount (${remainingAmount.toString()})`
      );
    }

    // Create payment
    const payment = await this.prisma.payment.create({
      data: {
        invoiceId,
        amount: new Decimal(dto.amount),
        paymentMethod: dto.paymentMethod,
        transactionId: dto.transactionId,
        notes: dto.notes,
        paidById,
        organizationId,
      },
      include: {
        paidBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Update invoice paid amount and status
    const newPaidAmount = invoice.paidAmount.add(dto.amount);
    const newStatus = newPaidAmount.gte(invoice.totalAmount)
      ? PaymentStatus.PAID
      : PaymentStatus.PARTIALLY_PAID;

    const updatedInvoice = await this.prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        paidAmount: newPaidAmount,
        status: newStatus,
      },
      include: {
        patient: true,
        visit: true,
        items: {
          include: { service: true },
        },
        payments: {
          include: {
            paidBy: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
          orderBy: { paidAt: "desc" },
        },
      },
    });

    // Update service orders if fully paid
    if (newStatus === PaymentStatus.PAID) {
      const serviceOrderIds = invoice.items
        .filter((item) => item.serviceOrderId)
        .map((item) => item.serviceOrderId);

      if (serviceOrderIds.length > 0) {
        // Mark as paid
        await this.prisma.serviceOrder.updateMany({
          where: { id: { in: serviceOrderIds } },
          data: { paymentStatus: PaymentStatus.PAID },
        });

        // Automatically add to department queue
        for (const serviceOrderId of serviceOrderIds) {
          try {
            await this.queueService.addToQueue(
              serviceOrderId,
              invoice.organizationId
            );
          } catch (error) {
            // Log error but don't fail the payment
            console.error(
              `Failed to add service order ${serviceOrderId} to queue:`,
              error
            );
          }
        }
      }
    }

    // Calculate remaining amount for response
    const remainingAmountAfter = updatedInvoice.totalAmount.sub(
      updatedInvoice.paidAmount
    );

    const result = {
      payment,
      invoice: {
        ...updatedInvoice,
        remainingAmount: remainingAmountAfter.toNumber(),
      },
    };

    return result;
  }

  async getPayments(invoiceId: string, organizationId: string) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id: invoiceId, organizationId },
    });

    if (!invoice) {
      throw new NotFoundException("Invoice not found");
    }

    return this.prisma.payment.findMany({
      where: { invoiceId },
      include: {
        paidBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { paidAt: "desc" },
    });
  }

  private async generateInvoiceNumber(organizationId: string): Promise<string> {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");

    // Get count of invoices for this month
    const count = await this.prisma.invoice.count({
      where: {
        organizationId,
        createdAt: {
          gte: new Date(year, now.getMonth(), 1),
          lt: new Date(year, now.getMonth() + 1, 1),
        },
      },
    });

    const nextNumber = String(count + 1).padStart(4, "0");
    return `INV-${year}${month}-${nextNumber}`;
  }
}
