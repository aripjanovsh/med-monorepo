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
import { ServiceService } from "./service.service";
import { CreateServiceDto } from "./dto/create-service.dto";
import { UpdateServiceDto } from "./dto/update-service.dto";
import { FindAllServicesDto } from "./dto/find-all-services.dto";
import { ServiceResponseDto } from "./dto/service-response.dto";
import {
  RequirePermission,
  PermissionGuard,
} from "../../../common/guards/permission.guard";

@ApiTags("Services")
@ApiBearerAuth()
@Controller("master-data/services")
@UseGuards(AuthGuard("jwt"), PermissionGuard)
export class ServiceController {
  constructor(private readonly serviceService: ServiceService) {}

  @Post()
  @ApiOperation({ summary: "Создать услугу" })
  @ApiResponse({
    status: 201,
    description: "Услуга успешно создана",
    type: ServiceResponseDto,
  })
  async create(
    @Body() createServiceDto: CreateServiceDto,
  ): Promise<ServiceResponseDto> {
    return this.serviceService.create(createServiceDto);
  }

  @Get()
  @ApiOperation({ summary: "Получить все услуги" })
  @ApiResponse({
    status: 200,
    description: "Список услуг получен",
    type: [ServiceResponseDto],
  })
  async findAll(@Query() findAllDto: FindAllServicesDto) {
    return this.serviceService.findAll(findAllDto);
  }

  @Get(":id")
  @ApiOperation({ summary: "Получить услугу по ID" })
  @ApiResponse({
    status: 200,
    description: "Услуга найдена",
    type: ServiceResponseDto,
  })
  async findOne(@Param("id") id: string): Promise<ServiceResponseDto> {
    return this.serviceService.findOne(id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Обновить услугу" })
  @ApiResponse({
    status: 200,
    description: "Услуга обновлена",
    type: ServiceResponseDto,
  })
  async update(
    @Param("id") id: string,
    @Body() updateServiceDto: UpdateServiceDto,
  ): Promise<ServiceResponseDto> {
    return this.serviceService.update(id, updateServiceDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Удалить услугу" })
  @ApiResponse({ status: 200, description: "Услуга успешно удалена" })
  async remove(@Param("id") id: string): Promise<{ message: string }> {
    await this.serviceService.remove(id);
    return { message: "Услуга успешно удалена" };
  }

  @Patch(":id/toggle-status")
  @ApiOperation({ summary: "Изменить статус услуги (активная/неактивная)" })
  @ApiResponse({
    status: 200,
    description: "Статус услуги изменен",
    type: ServiceResponseDto,
  })
  async toggleStatus(@Param("id") id: string): Promise<ServiceResponseDto> {
    return this.serviceService.toggleStatus(id);
  }
}
