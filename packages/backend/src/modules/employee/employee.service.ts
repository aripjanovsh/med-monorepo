import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma, EmployeeStatus, UserRole } from "@prisma/client";
import { PrismaService } from "../../common/prisma/prisma.service";
import { CreateEmployeeDto } from "./dto/create-employee.dto";
import { UpdateEmployeeDto } from "./dto/update-employee.dto";
import { FindAllEmployeeDto } from "./dto/find-all-employee.dto";
import { PaginatedResponseDto } from "../../common/dto/pagination.dto";
import { EmployeeResponseDto } from "./dto/employee-response.dto";
import { plainToInstance } from "class-transformer";
import * as bcrypt from "bcrypt";

@Injectable()
export class EmployeeService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    createEmployeeDto: CreateEmployeeDto
  ): Promise<EmployeeResponseDto> {
    const { userAccountPhone, userAccountRoleIds, ...employeeData } =
      createEmployeeDto;

    return await this.prisma.$transaction(async (tx) => {
      let userId: string | undefined;

      // Create user account within transaction if requested
      if (userAccountPhone && userAccountRoleIds) {
        const hashedPassword = await bcrypt.hash("TempPass123!", 10);
        const user = await tx.user.create({
          data: {
            phone: userAccountPhone,
            password: hashedPassword,
            role: UserRole.DOCTOR,
            isActive: true,
            organizationId: createEmployeeDto.organizationId,
            roleAssignments: {
              create: userAccountRoleIds.map((roleId) => ({
                role: { connect: { id: roleId } },
              })),
            },
          },
        });
        userId = user.id;
      }

      const { serviceTypeIds, ...employeeCore } = employeeData;

      const created = await tx.employee.create({
        data: {
          ...employeeCore,
          userId,
        },
      });

      if (serviceTypeIds && serviceTypeIds.length > 0) {
        await tx.employeeServiceType.createMany({
          data: serviceTypeIds.map((serviceTypeId) => ({
            employeeId: created.id,
            serviceTypeId,
          })),
          skipDuplicates: true,
        });
      }

      const employeeWithRelations = await tx.employee.findUnique({
        where: { id: created.id },
        include: {
          user: true,
          organization: true,
          title: true,
          serviceTypes: { include: { serviceType: true } },
          primaryLanguage: true,
          secondaryLanguage: true,
          country: true,
          region: true,
          city: true,
          district: true,
        },
      });

      const response = employeeWithRelations
        ? {
            ...employeeWithRelations,
            serviceTypes: employeeWithRelations.serviceTypes.map(
              (st) => st.serviceType
            ),
          }
        : null;

      return plainToInstance(EmployeeResponseDto, response);
    });
  }

  async findAll(
    query: FindAllEmployeeDto
  ): Promise<PaginatedResponseDto<EmployeeResponseDto>> {
    const { page, limit, search, sortBy, sortOrder, status, organizationId } =
      query;
    const skip = (page - 1) * limit;

    const where: Prisma.EmployeeWhereInput = {};

    // Filter by organizationId if provided
    if (organizationId) {
      where.organizationId = organizationId;
    }

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { employeeId: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    // Build order by
    const orderBy: Prisma.EmployeeOrderByWithRelationInput = {};
    if (sortBy) {
      orderBy[sortBy] = sortOrder;
    } else {
      orderBy.createdAt = "desc";
    }

    const [employeesRaw, total] = await Promise.all([
      this.prisma.employee.findMany({
        where,
        include: {
          user: true,
          organization: true,
          title: true,
          serviceTypes: { include: { serviceType: true } },
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
      this.prisma.employee.count({ where }),
    ]);

    const employees = employeesRaw.map((e) => ({
      ...e,
      serviceTypes: e.serviceTypes.map((st) => st.serviceType),
    }));

    return {
      data: plainToInstance(EmployeeResponseDto, employees),
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
  ): Promise<EmployeeResponseDto> {
    const where: Prisma.EmployeeWhereUniqueInput = { id };

    // Filter by organizationId if provided
    if (organizationId) {
      where.organizationId = organizationId;
    }

    const employee = await this.prisma.employee.findUnique({
      where,
      include: {
        user: true,
        organization: true,
        title: true,
        serviceTypes: { include: { serviceType: true } },
        primaryLanguage: true,
        secondaryLanguage: true,
        country: true,
        region: true,
        city: true,
        district: true,
      },
    });

    if (!employee) {
      throw new NotFoundException("Employee not found");
    }

    const response = employee
      ? {
          ...employee,
          serviceTypes: employee.serviceTypes.map((st) => st.serviceType),
        }
      : null;
    return plainToInstance(EmployeeResponseDto, response);
  }

  async update(
    id: string,
    updateEmployeeDto: UpdateEmployeeDto
  ): Promise<EmployeeResponseDto> {
    // Check if employee exists
    const existingEmployee = await this.prisma.employee.findUnique({
      where: { id },
      include: {
        serviceTypes: true,
      },
    });

    if (!existingEmployee) {
      throw new NotFoundException("Employee not found");
    }

    return await this.prisma.$transaction(async (tx) => {
      const where: Prisma.EmployeeWhereUniqueInput = { id };
      if (updateEmployeeDto.organizationId) {
        where.organizationId = updateEmployeeDto.organizationId;
      }

      const {
        serviceTypeIds,
        userAccountPhone,
        userAccountRoleIds,
        ...coreUpdate
      } = updateEmployeeDto as UpdateEmployeeDto & {
        serviceTypeIds?: string[];
      };

      await tx.employee.update({
        where,
        data: coreUpdate,
      });

      if (serviceTypeIds) {
        const existing = await tx.employeeServiceType.findMany({
          where: { employeeId: id },
          select: { serviceTypeId: true },
        });
        const existingIds = new Set(existing.map((e) => e.serviceTypeId));
        const incomingIds = new Set(serviceTypeIds);

        const toAdd = serviceTypeIds.filter((sid) => !existingIds.has(sid));
        const toRemove = [...existingIds].filter(
          (sid) => !incomingIds.has(sid)
        );

        if (toAdd.length > 0) {
          await tx.employeeServiceType.createMany({
            data: toAdd.map((serviceTypeId) => ({
              employeeId: id,
              serviceTypeId,
            })),
            skipDuplicates: true,
          });
        }
        if (toRemove.length > 0) {
          await tx.employeeServiceType.deleteMany({
            where: { employeeId: id, serviceTypeId: { in: toRemove } },
          });
        }
      }

      const updatedEmployee = await tx.employee.findUnique({
        where: { id },
        include: {
          user: true,
          organization: true,
          title: true,
          serviceTypes: { include: { serviceType: true } },
          primaryLanguage: true,
          secondaryLanguage: true,
          country: true,
          region: true,
          city: true,
          district: true,
        },
      });

      const response = updatedEmployee
        ? {
            ...updatedEmployee,
            serviceTypes: updatedEmployee.serviceTypes.map(
              (st) => st.serviceType
            ),
          }
        : null;
      return plainToInstance(EmployeeResponseDto, response);
    });
  }

  async updateStatus(
    id: string,
    status: EmployeeStatus,
    organizationId?: string
  ): Promise<EmployeeResponseDto> {
    try {
      // Build where clause with organizationId filter if provided
      const where: Prisma.EmployeeWhereUniqueInput = { id };

      if (organizationId) {
        where.organizationId = organizationId;
      }

      const employee = await this.prisma.employee.update({
        where,
        data: { status },
        include: {
          user: true,
          organization: true,
          title: true,
          serviceTypes: { include: { serviceType: true } },
          primaryLanguage: true,
          secondaryLanguage: true,
          country: true,
          region: true,
          city: true,
          district: true,
        },
      });

      const response = employee
        ? {
            ...employee,
            serviceTypes: employee.serviceTypes.map((st) => st.serviceType),
          }
        : null;
      return plainToInstance(EmployeeResponseDto, response);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          throw new NotFoundException("Employee not found");
        }
      }
      throw error;
    }
  }

  async remove(id: string, organizationId?: string) {
    try {
      // Build where clause with organizationId filter if provided
      const where: Prisma.EmployeeWhereUniqueInput = { id };
      if (organizationId) {
        where.organizationId = organizationId;
      }

      await this.prisma.employee.delete({
        where,
      });
      return { message: "Employee deleted successfully" };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          throw new NotFoundException("Employee not found");
        }
      }
      throw error;
    }
  }

  async getEmployeeStats(organizationId?: string) {
    const where: Prisma.EmployeeWhereInput = {};

    // Filter by organizationId if provided
    if (organizationId) {
      where.organizationId = organizationId;
    }

    const [total, active, inactive, onLeave, terminated] = await Promise.all([
      this.prisma.employee.count({ where }),
      this.prisma.employee.count({
        where: { ...where, status: EmployeeStatus.ACTIVE },
      }),
      this.prisma.employee.count({
        where: { ...where, status: EmployeeStatus.INACTIVE },
      }),
      this.prisma.employee.count({
        where: { ...where, status: EmployeeStatus.ON_LEAVE },
      }),
      this.prisma.employee.count({
        where: { ...where, status: EmployeeStatus.TERMINATED },
      }),
    ]);

    return {
      total,
      byStatus: {
        active,
        inactive,
        onLeave,
        terminated,
      },
    };
  }
}
