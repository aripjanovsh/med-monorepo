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
import { EmployeeLeaveDaysService } from "./employee-leave-days.service";
import { CreateEmployeeLeaveDaysDto } from "./dto/create-employee-leave-days.dto";
import { UpdateEmployeeLeaveDaysDto } from "./dto/update-employee-leave-days.dto";
import { FindAllEmployeeLeaveDaysDto } from "./dto/find-all-employee-leave-days.dto";
import { EmployeeLeaveDaysResponseDto } from "./dto/employee-leave-days-response.dto";

@ApiTags("Employee Leave Days")
@ApiBearerAuth()
@Controller("employee-leave-days")
@UseGuards(AuthGuard("jwt"), PermissionGuard)
export class EmployeeLeaveDaysController {
  constructor(private readonly service: EmployeeLeaveDaysService) {}

  @Post()
  @ApiOperation({ summary: "Создать запись об отпуске сотрудника" })
  @ApiResponse({
    status: 201,
    description: "Запись об отпуске успешно создана",
    type: EmployeeLeaveDaysResponseDto,
  })
  async create(
    @Body() dto: CreateEmployeeLeaveDaysDto
  ): Promise<EmployeeLeaveDaysResponseDto> {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: "Получить все записи об отпусках" })
  @ApiResponse({
    status: 200,
    description: "Список записей получен",
    type: [EmployeeLeaveDaysResponseDto],
  })
  async findAll(@Query() dto: FindAllEmployeeLeaveDaysDto) {
    return this.service.findAll(dto);
  }

  @Get(":id")
  @ApiOperation({ summary: "Получить запись об отпуске по ID" })
  @ApiResponse({
    status: 200,
    description: "Запись найдена",
    type: EmployeeLeaveDaysResponseDto,
  })
  async findOne(
    @Param("id") id: string
  ): Promise<EmployeeLeaveDaysResponseDto> {
    return this.service.findOne(id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Обновить запись об отпуске" })
  @ApiResponse({
    status: 200,
    description: "Запись обновлена",
    type: EmployeeLeaveDaysResponseDto,
  })
  async update(
    @Param("id") id: string,
    @Body() dto: UpdateEmployeeLeaveDaysDto
  ): Promise<EmployeeLeaveDaysResponseDto> {
    return this.service.update(id, dto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Удалить запись об отпуске" })
  @ApiResponse({ status: 200, description: "Запись успешно удалена" })
  async remove(@Param("id") id: string): Promise<{ message: string }> {
    await this.service.remove(id);
    return { message: "Запись об отпуске успешно удалена" };
  }
}
