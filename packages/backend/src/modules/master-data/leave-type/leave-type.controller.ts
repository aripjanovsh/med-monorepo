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
import { PermissionGuard } from "../../../common/guards/permission.guard";
import { LeaveTypeService } from "./leave-type.service";
import { CreateLeaveTypeDto } from "./dto/create-leave-type.dto";
import { UpdateLeaveTypeDto } from "./dto/update-leave-type.dto";
import { FindAllLeaveTypesDto } from "./dto/find-all-leave-types.dto";
import { LeaveTypeResponseDto } from "./dto/leave-type-response.dto";

@ApiTags("Leave Types")
@ApiBearerAuth()
@Controller("master-data/leave-types")
@UseGuards(AuthGuard("jwt"), PermissionGuard)
export class LeaveTypeController {
  constructor(private readonly leaveTypeService: LeaveTypeService) {}

  @Post()
  @ApiOperation({ summary: "Создать тип отпуска" })
  @ApiResponse({
    status: 201,
    description: "Тип отпуска успешно создан",
    type: LeaveTypeResponseDto,
  })
  async create(
    @Body() createLeaveTypeDto: CreateLeaveTypeDto
  ): Promise<LeaveTypeResponseDto> {
    return this.leaveTypeService.create(createLeaveTypeDto);
  }

  @Get()
  @ApiOperation({ summary: "Получить все типы отпусков" })
  @ApiResponse({
    status: 200,
    description: "Список типов отпусков получен",
    type: [LeaveTypeResponseDto],
  })
  async findAll(@Query() findAllDto: FindAllLeaveTypesDto) {
    return this.leaveTypeService.findAll(findAllDto);
  }

  @Get(":id")
  @ApiOperation({ summary: "Получить тип отпуска по ID" })
  @ApiResponse({
    status: 200,
    description: "Тип отпуска найден",
    type: LeaveTypeResponseDto,
  })
  async findOne(@Param("id") id: string): Promise<LeaveTypeResponseDto> {
    return this.leaveTypeService.findOne(id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Обновить тип отпуска" })
  @ApiResponse({
    status: 200,
    description: "Тип отпуска обновлен",
    type: LeaveTypeResponseDto,
  })
  async update(
    @Param("id") id: string,
    @Body() updateLeaveTypeDto: UpdateLeaveTypeDto
  ): Promise<LeaveTypeResponseDto> {
    return this.leaveTypeService.update(id, updateLeaveTypeDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Удалить тип отпуска" })
  @ApiResponse({ status: 200, description: "Тип отпуска успешно удален" })
  async remove(@Param("id") id: string): Promise<{ message: string }> {
    await this.leaveTypeService.remove(id);
    return { message: "Тип отпуска успешно удален" };
  }

  @Patch(":id/toggle-status")
  @ApiOperation({ summary: "Изменить статус типа отпуска" })
  @ApiResponse({
    status: 200,
    description: "Статус типа отпуска изменен",
    type: LeaveTypeResponseDto,
  })
  async toggleStatus(@Param("id") id: string): Promise<LeaveTypeResponseDto> {
    return this.leaveTypeService.toggleStatus(id);
  }
}
