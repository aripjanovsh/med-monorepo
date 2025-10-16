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
import { ServiceTypeService } from "./service-type.service";
import { CreateServiceTypeDto } from "./dto/create-service-type.dto";
import { UpdateServiceTypeDto } from "./dto/update-service-type.dto";
import { FindAllServiceTypesDto } from "./dto/find-all-service-types.dto";
import { ServiceTypeResponseDto } from "./dto/service-type-response.dto";
import {
  RequirePermission,
  PermissionGuard,
} from "../../../common/guards/permission.guard";

@ApiTags("Service Types")
@ApiBearerAuth()
@Controller("master-data/service-types")
@UseGuards(AuthGuard("jwt"), PermissionGuard)
export class ServiceTypeController {
  constructor(private readonly serviceTypeService: ServiceTypeService) {}

  @Post()
  @ApiOperation({ summary: "Создать новый тип услуги" })
  @ApiResponse({
    status: 201,
    description: "Тип услуги успешно создан",
    type: ServiceTypeResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: "Тип услуги с таким названием или кодом уже существует",
  })
  async create(
    @Body() createServiceTypeDto: CreateServiceTypeDto,
  ): Promise<ServiceTypeResponseDto> {
    return this.serviceTypeService.create(createServiceTypeDto);
  }

  @Get()
  @ApiOperation({ summary: "Получить список всех типов услуг с фильтрацией" })
  @ApiResponse({ status: 200, description: "Список типов услуг получен" })
  async findAll(@Query() findAllDto: FindAllServiceTypesDto) {
    return this.serviceTypeService.findAll(findAllDto);
  }

  @Get(":id")
  @ApiOperation({ summary: "Получить тип услуги по ID" })
  @ApiResponse({
    status: 200,
    description: "Тип услуги найден",
    type: ServiceTypeResponseDto,
  })
  @ApiResponse({ status: 404, description: "Тип услуги не найден" })
  async findOne(@Param("id") id: string): Promise<ServiceTypeResponseDto> {
    return this.serviceTypeService.findOne(id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Обновить тип услуги" })
  @ApiResponse({
    status: 200,
    description: "Тип услуги успешно обновлен",
    type: ServiceTypeResponseDto,
  })
  @ApiResponse({ status: 404, description: "Тип услуги не найден" })
  @ApiResponse({
    status: 409,
    description: "Тип услуги с таким названием или кодом уже существует",
  })
  async update(
    @Param("id") id: string,
    @Body() updateServiceTypeDto: UpdateServiceTypeDto,
  ): Promise<ServiceTypeResponseDto> {
    return this.serviceTypeService.update(id, updateServiceTypeDto);
  }

  @Delete(":id")
  @ApiResponse({ status: 200, description: "Тип услуги успешно удален" })
  @ApiResponse({ status: 404, description: "Тип услуги не найден" })
  async remove(@Param("id") id: string): Promise<{ message: string }> {
    await this.serviceTypeService.remove(id);
    return { message: "Тип услуги успешно удален" };
  }

  @Patch(":id/toggle-status")
  @ApiResponse({
    status: 200,
    description: "Статус типа услуги изменен",
    type: ServiceTypeResponseDto,
  })
  @ApiResponse({ status: 404, description: "Тип услуги не найден" })
  async toggleStatus(@Param("id") id: string): Promise<ServiceTypeResponseDto> {
    return this.serviceTypeService.toggleStatus(id);
  }
}
