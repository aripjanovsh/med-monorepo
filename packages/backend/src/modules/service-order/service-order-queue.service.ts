import { Injectable, BadRequestException } from "@nestjs/common";
import { PrismaService } from "@/common/prisma/prisma.service";
import { QueueStatus, OrderStatus } from "@prisma/client";

@Injectable()
export class ServiceOrderQueueService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Add service order to department queue after payment
   * Automatically assigns queue number and sets status to WAITING
   */
  async addToQueue(
    serviceOrderId: string,
    organizationId: string,
  ): Promise<void> {
    const serviceOrder = await this.prisma.serviceOrder.findFirst({
      where: { id: serviceOrderId, organizationId },
      include: { service: true },
    });

    if (!serviceOrder) {
      throw new BadRequestException("Service order not found");
    }

    if (serviceOrder.paymentStatus !== "PAID") {
      throw new BadRequestException("Service order must be paid first");
    }

    if (!serviceOrder.departmentId) {
      throw new BadRequestException("Service order must have department");
    }

    if (serviceOrder.queueStatus) {
      // Already in queue
      return;
    }

    // Get next queue number for this department today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const maxQueueNumber = await this.prisma.serviceOrder.findFirst({
      where: {
        departmentId: serviceOrder.departmentId,
        organizationId,
        queuedAt: {
          gte: today,
          lt: tomorrow,
        },
      },
      orderBy: { queueNumber: "desc" },
      select: { queueNumber: true },
    });

    const nextQueueNumber = (maxQueueNumber?.queueNumber ?? 0) + 1;

    // Add to queue
    await this.prisma.serviceOrder.update({
      where: { id: serviceOrderId },
      data: {
        queueNumber: nextQueueNumber,
        queueStatus: QueueStatus.WAITING,
        queuedAt: new Date(),
      },
    });
  }

  /**
   * Start service (begin serving patient)
   */
  async startService(
    serviceOrderId: string,
    organizationId: string,
    performedById?: string,
  ): Promise<void> {
    const serviceOrder = await this.prisma.serviceOrder.findFirst({
      where: { id: serviceOrderId, organizationId },
    });

    if (!serviceOrder) {
      throw new BadRequestException("Service order not found");
    }

    if (serviceOrder.queueStatus !== QueueStatus.WAITING) {
      throw new BadRequestException(
        `Cannot start service with status ${serviceOrder.queueStatus}`,
      );
    }

    await this.prisma.serviceOrder.update({
      where: { id: serviceOrderId },
      data: {
        queueStatus: QueueStatus.IN_PROGRESS,
        status: OrderStatus.IN_PROGRESS,
        startedAt: new Date(),
        performedById,
      },
    });
  }

  /**
   * Complete service and save results
   */
  async completeService(
    serviceOrderId: string,
    organizationId: string,
    data: {
      resultText?: string;
      resultData?: any;
      resultFileUrl?: string;
    },
  ): Promise<void> {
    const serviceOrder = await this.prisma.serviceOrder.findFirst({
      where: { id: serviceOrderId, organizationId },
    });

    if (!serviceOrder) {
      throw new BadRequestException("Service order not found");
    }

    if (serviceOrder.queueStatus !== QueueStatus.IN_PROGRESS) {
      throw new BadRequestException(
        `Cannot complete service with status ${serviceOrder.queueStatus}`,
      );
    }

    await this.prisma.serviceOrder.update({
      where: { id: serviceOrderId },
      data: {
        queueStatus: QueueStatus.COMPLETED,
        status: OrderStatus.COMPLETED,
        finishedAt: new Date(),
        resultAt: new Date(),
        ...data,
      },
    });
  }

  /**
   * Skip patient temporarily (move to end of queue or remove from active queue)
   */
  async skipPatient(
    serviceOrderId: string,
    organizationId: string,
  ): Promise<void> {
    const serviceOrder = await this.prisma.serviceOrder.findFirst({
      where: { id: serviceOrderId, organizationId },
    });

    if (!serviceOrder) {
      throw new BadRequestException("Service order not found");
    }

    if (serviceOrder.queueStatus !== QueueStatus.WAITING) {
      throw new BadRequestException(
        `Cannot skip service with status ${serviceOrder.queueStatus}`,
      );
    }

    await this.prisma.serviceOrder.update({
      where: { id: serviceOrderId },
      data: {
        queueStatus: QueueStatus.SKIPPED,
      },
    });
  }

  /**
   * Return skipped patient back to queue
   */
  async returnToQueue(
    serviceOrderId: string,
    organizationId: string,
  ): Promise<void> {
    const serviceOrder = await this.prisma.serviceOrder.findFirst({
      where: { id: serviceOrderId, organizationId },
    });

    if (!serviceOrder) {
      throw new BadRequestException("Service order not found");
    }

    if (serviceOrder.queueStatus !== QueueStatus.SKIPPED) {
      throw new BadRequestException(
        `Can only return SKIPPED orders to queue`,
      );
    }

    await this.prisma.serviceOrder.update({
      where: { id: serviceOrderId },
      data: {
        queueStatus: QueueStatus.WAITING,
      },
    });
  }

  /**
   * Get queue for specific department
   */
  async getDepartmentQueue(departmentId: string, organizationId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const orders = await this.prisma.serviceOrder.findMany({
      where: {
        departmentId,
        organizationId,
        paymentStatus: "PAID",
        status: {
          in: [OrderStatus.ORDERED, OrderStatus.IN_PROGRESS],
        },
        queuedAt: {
          gte: today,
          lt: tomorrow,
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
        service: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
        doctor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: [{ queueNumber: "asc" }],
    });

    const waiting = orders.filter((o) => o.queueStatus === QueueStatus.WAITING);
    const inProgress = orders.find(
      (o) => o.queueStatus === QueueStatus.IN_PROGRESS,
    );
    const skipped = orders.filter((o) => o.queueStatus === QueueStatus.SKIPPED);

    // Calculate stats
    const completed = await this.prisma.serviceOrder.count({
      where: {
        departmentId,
        organizationId,
        queueStatus: QueueStatus.COMPLETED,
        queuedAt: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    return {
      waiting,
      inProgress,
      skipped,
      stats: {
        waiting: waiting.length,
        inProgress: inProgress ? 1 : 0,
        completed,
        skipped: skipped.length,
      },
    };
  }
}
