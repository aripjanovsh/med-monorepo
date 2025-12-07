import {
  Injectable,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { plainToInstance } from "class-transformer";
import { PrismaService } from "../../../common/prisma/prisma.service";
import { PaginatedResponseDto } from "@/common/dto/pagination.dto";
import { CreateLeaveTypeDto } from "./dto/create-leave-type.dto";
import { UpdateLeaveTypeDto } from "./dto/update-leave-type.dto";
import { FindAllLeaveTypesDto } from "./dto/find-all-leave-types.dto";
import { LeaveTypeResponseDto } from "./dto/leave-type-response.dto";

@Injectable()
export class LeaveTypeService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    createLeaveTypeDto: CreateLeaveTypeDto
  ): Promise<LeaveTypeResponseDto> {
    try {
      const leaveType = await this.prisma.leaveType.create({
        data: createLeaveTypeDto,
      });

      return plainToInstance(LeaveTypeResponseDto, leaveType);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          throw new ConflictException(
            "Тип отпуска с таким названием или кодом уже существует"
          );
        }
      }
      throw error;
    }
  }

  async findAll(
    findAllDto: FindAllLeaveTypesDto
  ): Promise<PaginatedResponseDto<LeaveTypeResponseDto>> {
    const {
      organizationId,
      search,
      isActive,
      isPaid,
      page = 1,
      limit = 10,
    } = findAllDto;
    const skip = (page - 1) * limit;

    const where: Prisma.LeaveTypeWhereInput = {
      organizationId,
      ...(isActive !== undefined && { isActive }),
      ...(isPaid !== undefined && { isPaid }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { code: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ],
      }),
    };

    const [leaveTypes, total] = await Promise.all([
      this.prisma.leaveType.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      }),
      this.prisma.leaveType.count({ where }),
    ]);

    return {
      data: plainToInstance(LeaveTypeResponseDto, leaveTypes),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<LeaveTypeResponseDto> {
    const leaveType = await this.prisma.leaveType.findFirst({
      where: { id },
    });

    if (!leaveType) {
      throw new NotFoundException("Тип отпуска не найден");
    }

    return plainToInstance(LeaveTypeResponseDto, leaveType);
  }

  async update(
    id: string,
    updateLeaveTypeDto: UpdateLeaveTypeDto
  ): Promise<LeaveTypeResponseDto> {
    await this.findOne(id);

    try {
      const leaveType = await this.prisma.leaveType.update({
        where: { id },
        data: updateLeaveTypeDto,
      });

      return plainToInstance(LeaveTypeResponseDto, leaveType);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          throw new ConflictException(
            "Тип отпуска с таким названием или кодом уже существует"
          );
        }
      }
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);

    await this.prisma.leaveType.delete({
      where: { id },
    });
  }

  async toggleStatus(id: string): Promise<LeaveTypeResponseDto> {
    const existingLeaveType = await this.findOne(id);

    const leaveType = await this.prisma.leaveType.update({
      where: { id },
      data: { isActive: !existingLeaveType.isActive },
    });

    return plainToInstance(LeaveTypeResponseDto, leaveType);
  }
}
