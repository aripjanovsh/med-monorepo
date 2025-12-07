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
import { AppointmentCancelTypeService } from "./appointment-cancel-type.service";
import { CreateAppointmentCancelTypeDto } from "./dto/create-appointment-cancel-type.dto";
import { UpdateAppointmentCancelTypeDto } from "./dto/update-appointment-cancel-type.dto";
import { FindAllAppointmentCancelTypesDto } from "./dto/find-all-appointment-cancel-types.dto";
import { AppointmentCancelTypeResponseDto } from "./dto/appointment-cancel-type-response.dto";
import { PermissionGuard } from "../../../common/guards/permission.guard";

@ApiTags("Appointment Cancel Types")
@ApiBearerAuth()
@Controller("master-data/appointment-cancel-types")
@UseGuards(AuthGuard("jwt"), PermissionGuard)
export class AppointmentCancelTypeController {
  constructor(
    private readonly appointmentCancelTypeService: AppointmentCancelTypeService
  ) {}

  @Post()
  @ApiOperation({ summary: "Создать причину отмены приёма" })
  @ApiResponse({
    status: 201,
    description: "Причина отмены успешно создана",
    type: AppointmentCancelTypeResponseDto,
  })
  async create(
    @Body() createDto: CreateAppointmentCancelTypeDto
  ): Promise<AppointmentCancelTypeResponseDto> {
    return this.appointmentCancelTypeService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: "Получить все причины отмены приёма" })
  @ApiResponse({
    status: 200,
    description: "Список причин отмены получен",
    type: [AppointmentCancelTypeResponseDto],
  })
  async findAll(@Query() findAllDto: FindAllAppointmentCancelTypesDto) {
    return this.appointmentCancelTypeService.findAll(findAllDto);
  }

  @Get(":id")
  @ApiOperation({ summary: "Получить причину отмены по ID" })
  @ApiResponse({
    status: 200,
    description: "Причина отмены найдена",
    type: AppointmentCancelTypeResponseDto,
  })
  async findOne(
    @Param("id") id: string
  ): Promise<AppointmentCancelTypeResponseDto> {
    return this.appointmentCancelTypeService.findOne(id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Обновить причину отмены" })
  @ApiResponse({
    status: 200,
    description: "Причина отмены обновлена",
    type: AppointmentCancelTypeResponseDto,
  })
  async update(
    @Param("id") id: string,
    @Body() updateDto: UpdateAppointmentCancelTypeDto
  ): Promise<AppointmentCancelTypeResponseDto> {
    return this.appointmentCancelTypeService.update(id, updateDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Удалить причину отмены" })
  @ApiResponse({ status: 200, description: "Причина отмены успешно удалена" })
  async remove(@Param("id") id: string): Promise<{ message: string }> {
    await this.appointmentCancelTypeService.remove(id);
    return { message: "Причина отмены успешно удалена" };
  }

  @Patch(":id/toggle-status")
  @ApiOperation({ summary: "Изменить статус причины отмены" })
  @ApiResponse({
    status: 200,
    description: "Статус причины отмены изменен",
    type: AppointmentCancelTypeResponseDto,
  })
  async toggleStatus(
    @Param("id") id: string
  ): Promise<AppointmentCancelTypeResponseDto> {
    return this.appointmentCancelTypeService.toggleStatus(id);
  }
}
