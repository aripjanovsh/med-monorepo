import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { PermissionGuard } from "../../common/guards/permission.guard";
import { EmployeeAvailabilityService } from "./employee-availability.service";
import { CreateEmployeeAvailabilityDto } from "./dto/create-employee-availability.dto";
import { UpdateEmployeeAvailabilityDto } from "./dto/update-employee-availability.dto";
import { FindAllEmployeeAvailabilityDto } from "./dto/find-all-employee-availability.dto";
import { EmployeeAvailabilityResponseDto } from "./dto/employee-availability-response.dto";

@ApiTags("Employee Availability")
@ApiBearerAuth()
@Controller("employee-availability")
@UseGuards(AuthGuard("jwt"), PermissionGuard)
export class EmployeeAvailabilityController {
  constructor(private readonly service: EmployeeAvailabilityService) {}

  @Post()
  @ApiOperation({ summary: "Создать расписание доступности сотрудника" })
  @ApiResponse({
    status: 201,
    description: "Расписание успешно создано",
    type: EmployeeAvailabilityResponseDto,
  })
  async create(
    @Body() dto: CreateEmployeeAvailabilityDto
  ): Promise<EmployeeAvailabilityResponseDto> {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: "Получить все расписания доступности" })
  @ApiResponse({
    status: 200,
    description: "Список расписаний получен",
    type: [EmployeeAvailabilityResponseDto],
  })
  async findAll(@Query() dto: FindAllEmployeeAvailabilityDto) {
    return this.service.findAll(dto);
  }

  @Get(":id")
  @ApiOperation({ summary: "Получить расписание по ID" })
  @ApiResponse({
    status: 200,
    description: "Расписание найдено",
    type: EmployeeAvailabilityResponseDto,
  })
  async findOne(
    @Param("id") id: string
  ): Promise<EmployeeAvailabilityResponseDto> {
    return this.service.findOne(id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Обновить расписание" })
  @ApiResponse({
    status: 200,
    description: "Расписание обновлено",
    type: EmployeeAvailabilityResponseDto,
  })
  async update(
    @Param("id") id: string,
    @Body() dto: UpdateEmployeeAvailabilityDto
  ): Promise<EmployeeAvailabilityResponseDto> {
    return this.service.update(id, dto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Удалить расписание" })
  @ApiResponse({ status: 200, description: "Расписание успешно удалено" })
  async remove(@Param("id") id: string): Promise<{ message: string }> {
    await this.service.remove(id);
    return { message: "Расписание успешно удалено" };
  }

  @Patch(":id/toggle-status")
  @ApiOperation({ summary: "Изменить статус расписания" })
  @ApiResponse({
    status: 200,
    description: "Статус расписания изменен",
    type: EmployeeAvailabilityResponseDto,
  })
  async toggleStatus(
    @Param("id") id: string
  ): Promise<EmployeeAvailabilityResponseDto> {
    return this.service.toggleStatus(id);
  }
}
