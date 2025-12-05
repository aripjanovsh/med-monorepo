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
import { generateMemorableId } from "../../common/utils/id-generator.util";

@Injectable()
export class EmployeeService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create or update a user account for the employee.
   * - If user does not exist and credentials provided -> create user and return userId
   * - If user exists -> update phone (if provided) and replace role assignments
   * - If no credentials provided -> return existing userId untouched
   */
  private async upsertUserAccount(
    tx: Prisma.TransactionClient,
    params: {
      existingUserId?: string;
      organizationId: string;
      userAccountPhone?: string;
      userAccountRoleIds?: string[];
    }
  ): Promise<string | undefined> {
    const {
      existingUserId,
      organizationId,
      userAccountPhone,
      userAccountRoleIds,
    } = params;

    // If no account data provided, keep current state
    if (!userAccountPhone || !userAccountRoleIds) {
      return existingUserId;
    }

    // Create new user account
    if (!existingUserId) {
      const hashedPassword = await bcrypt.hash("TempPass123!", 10);
      const user = await tx.user.create({
        data: {
          phone: userAccountPhone,
          password: hashedPassword,
          role: UserRole.USER,
          isActive: true,
          organizationId,
          roleAssignments: {
            create: userAccountRoleIds.map((roleId) => ({
              role: { connect: { id: roleId } },
            })),
          },
        },
      });
      return user.id;
    }

    // Update existing user: phone + roles
    await tx.user.update({
      where: { id: existingUserId },
      data: userAccountPhone ? { phone: userAccountPhone } : {},
    });

    await tx.userRole_Assignment.deleteMany({
      where: { userId: existingUserId },
    });

    if (userAccountRoleIds.length > 0) {
      await tx.userRole_Assignment.createMany({
        data: userAccountRoleIds.map((roleId) => ({
          userId: existingUserId,
          roleId,
        })),
      });
    }

    return existingUserId;
  }

  async create(
    createEmployeeDto: CreateEmployeeDto
  ): Promise<EmployeeResponseDto> {
    const { userAccountPhone, userAccountRoleIds, ...employeeData } =
      createEmployeeDto;

    return await this.prisma.$transaction(async (tx) => {
      const userId = await this.upsertUserAccount(tx, {
        existingUserId: undefined,
        organizationId: createEmployeeDto.organizationId,
        userAccountPhone,
        userAccountRoleIds,
      });

      const { ...employeeCore } = employeeData;

      // Auto-generate employeeId if not provided
      let employeeId = generateMemorableId("E");

      const created = await tx.employee.create({
        data: {
          ...employeeCore,
          employeeId,
          userId,
        },
      });

      return plainToInstance(EmployeeResponseDto, created);
    });
  }

  async findAll(
    query: FindAllEmployeeDto
  ): Promise<PaginatedResponseDto<EmployeeResponseDto>> {
    const {
      page,
      limit,
      search,
      sortBy,
      sortOrder,
      status,
      organizationId,
      patientId,
      titleId,
      departmentId,
    } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.EmployeeWhereInput = {};

    // Filter by organizationId if provided
    if (organizationId) {
      where.organizationId = organizationId;
    }

    if (status) {
      where.status = status;
    }

    if (patientId) {
      where.patientDoctors = {
        some: {
          patientId: patientId,
          isActive: true,
        },
      };
    }

    if (titleId) {
      where.titleId = titleId.includes(",")
        ? { in: titleId.split(",") }
        : titleId;
    }

    if (departmentId) {
      where.departmentId = departmentId.includes(",")
        ? { in: departmentId.split(",") }
        : departmentId;
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
          organization: true,
          title: true,
          avatar: true,
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

    return {
      data: plainToInstance(EmployeeResponseDto, employeesRaw),
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
        user: {
          include: {
            roleAssignments: {
              include: {
                role: true,
              },
            },
          },
        },
        organization: true,
        title: true,
        avatar: true,
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

    return plainToInstance(EmployeeResponseDto, employee);
  }

  async update(
    id: string,
    updateEmployeeDto: UpdateEmployeeDto
  ): Promise<EmployeeResponseDto> {
    // Check if employee exists with user relation
    const existingEmployee = await this.prisma.employee.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!existingEmployee) {
      throw new NotFoundException("Employee not found");
    }

    return await this.prisma.$transaction(async (tx) => {
      const where: Prisma.EmployeeWhereUniqueInput = { id };
      if (updateEmployeeDto.organizationId) {
        where.organizationId = updateEmployeeDto.organizationId;
      }

      const { userAccountPhone, userAccountRoleIds, ...coreUpdate } =
        updateEmployeeDto;

      // Create or update user account if payload provided
      const userId = await this.upsertUserAccount(tx, {
        existingUserId: existingEmployee.userId,
        organizationId: existingEmployee.organizationId,
        userAccountPhone,
        userAccountRoleIds,
      });

      await tx.employee.update({
        where,
        data: {
          ...coreUpdate,
          // Attach newly created user to employee if it was absent before
          ...(userId ? { userId } : {}),
        } as any,
      });

      const updatedEmployee = await tx.employee.findUnique({
        where: { id },
        include: {
          user: {
            include: {
              roleAssignments: {
                include: { role: true },
              },
            },
          },
        },
      });

      return plainToInstance(EmployeeResponseDto, updatedEmployee);
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
      });

      return plainToInstance(EmployeeResponseDto, employee);
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
