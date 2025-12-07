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
import { AppointmentTypeService } from "./appointment-type.service";
import { CreateAppointmentTypeDto } from "./dto/create-appointment-type.dto";
import { UpdateAppointmentTypeDto } from "./dto/update-appointment-type.dto";
import { FindAllAppointmentTypesDto } from "./dto/find-all-appointment-types.dto";
import { AppointmentTypeResponseDto } from "./dto/appointment-type-response.dto";
import { PermissionGuard } from "../../../common/guards/permission.guard";

@ApiTags("Appointment Types")
@ApiBearerAuth()
@Controller("master-data/appointment-types")
@UseGuards(AuthGuard("jwt"), PermissionGuard)
export class AppointmentTypeController {
  constructor(
    private readonly appointmentTypeService: AppointmentTypeService
  ) {}

  @Post()
  @ApiOperation({ summary: "Создать тип приёма" })
  @ApiResponse({
    status: 201,
    description: "Тип приёма успешно создан",
    type: AppointmentTypeResponseDto,
  })
  async create(
    @Body() createDto: CreateAppointmentTypeDto
  ): Promise<AppointmentTypeResponseDto> {
    return this.appointmentTypeService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: "Получить все типы приёма" })
  @ApiResponse({
    status: 200,
    description: "Список типов приёма получен",
    type: [AppointmentTypeResponseDto],
  })
  async findAll(@Query() findAllDto: FindAllAppointmentTypesDto) {
    return this.appointmentTypeService.findAll(findAllDto);
  }

  @Get(":id")
  @ApiOperation({ summary: "Получить тип приёма по ID" })
  @ApiResponse({
    status: 200,
    description: "Тип приёма найден",
    type: AppointmentTypeResponseDto,
  })
  async findOne(@Param("id") id: string): Promise<AppointmentTypeResponseDto> {
    return this.appointmentTypeService.findOne(id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Обновить тип приёма" })
  @ApiResponse({
    status: 200,
    description: "Тип приёма обновлен",
    type: AppointmentTypeResponseDto,
  })
  async update(
    @Param("id") id: string,
    @Body() updateDto: UpdateAppointmentTypeDto
  ): Promise<AppointmentTypeResponseDto> {
    return this.appointmentTypeService.update(id, updateDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Удалить тип приёма" })
  @ApiResponse({ status: 200, description: "Тип приёма успешно удален" })
  async remove(@Param("id") id: string): Promise<{ message: string }> {
    await this.appointmentTypeService.remove(id);
    return { message: "Тип приёма успешно удален" };
  }

  @Patch(":id/toggle-status")
  @ApiOperation({ summary: "Изменить статус типа приёма" })
  @ApiResponse({
    status: 200,
    description: "Статус типа приёма изменен",
    type: AppointmentTypeResponseDto,
  })
  async toggleStatus(
    @Param("id") id: string
  ): Promise<AppointmentTypeResponseDto> {
    return this.appointmentTypeService.toggleStatus(id);
  }
}
