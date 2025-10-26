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
import { DepartmentService } from "./department.service";
import { CreateDepartmentDto } from "./dto/create-department.dto";
import { UpdateDepartmentDto } from "./dto/update-department.dto";
import { FindAllDepartmentsDto } from "./dto/find-all-departments.dto";
import { DepartmentResponseDto } from "./dto/department-response.dto";
import {
  RequirePermission,
  PermissionGuard,
} from "../../../common/guards/permission.guard";

@ApiTags("Departments")
@ApiBearerAuth()
@Controller("master-data/departments")
@UseGuards(AuthGuard("jwt"), PermissionGuard)
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService) {}

  @Post()
  @ApiOperation({ summary: "Создать отделение" })
  @ApiResponse({
    status: 201,
    description: "Отделение успешно создано",
    type: DepartmentResponseDto,
  })
  async create(
    @Body() createDepartmentDto: CreateDepartmentDto,
  ): Promise<DepartmentResponseDto> {
    return this.departmentService.create(createDepartmentDto);
  }

  @Get()
  @ApiOperation({ summary: "Получить все отделения" })
  @ApiResponse({
    status: 200,
    description: "Список отделений получен",
    type: [DepartmentResponseDto],
  })
  async findAll(@Query() findAllDto: FindAllDepartmentsDto) {
    return this.departmentService.findAll(findAllDto);
  }

  @Get(":id")
  @ApiOperation({ summary: "Получить отделение по ID" })
  @ApiResponse({
    status: 200,
    description: "Отделение найдено",
    type: DepartmentResponseDto,
  })
  async findOne(@Param("id") id: string): Promise<DepartmentResponseDto> {
    return this.departmentService.findOne(id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Обновить отделение" })
  @ApiResponse({
    status: 200,
    description: "Отделение обновлено",
    type: DepartmentResponseDto,
  })
  async update(
    @Param("id") id: string,
    @Body() updateDepartmentDto: UpdateDepartmentDto,
  ): Promise<DepartmentResponseDto> {
    return this.departmentService.update(id, updateDepartmentDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Удалить отделение" })
  @ApiResponse({ status: 200, description: "Отделение успешно удалено" })
  async remove(@Param("id") id: string): Promise<{ message: string }> {
    await this.departmentService.remove(id);
    return { message: "Отделение успешно удалено" };
  }

  @Patch(":id/toggle-status")
  @ApiOperation({ summary: "Изменить статус отделения (активное/неактивное)" })
  @ApiResponse({
    status: 200,
    description: "Статус отделения изменен",
    type: DepartmentResponseDto,
  })
  async toggleStatus(@Param("id") id: string): Promise<DepartmentResponseDto> {
    return this.departmentService.toggleStatus(id);
  }
}
