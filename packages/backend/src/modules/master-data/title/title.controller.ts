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
import { TitleService } from "./title.service";
import { CreateTitleDto } from "./dto/create-title.dto";
import { UpdateTitleDto } from "./dto/update-title.dto";
import { FindAllTitlesDto } from "./dto/find-all-titles.dto";
import { TitleResponseDto } from "./dto/title-response.dto";
import {
  RequirePermission,
  PermissionGuard,
} from "../../../common/guards/permission.guard";

@ApiTags("Titles")
@ApiBearerAuth()
@Controller("master-data/titles")
@UseGuards(AuthGuard("jwt"), PermissionGuard)
export class TitleController {
  constructor(private readonly titleService: TitleService) {}

  @Post()
  @ApiOperation({ summary: "Создать должность сотрудника" })
  @ApiResponse({
    status: 201,
    description: "Должность успешно создана",
    type: TitleResponseDto,
  })
  async create(
    @Body() createTitleDto: CreateTitleDto,
  ): Promise<TitleResponseDto> {
    return this.titleService.create(createTitleDto);
  }

  @Get()
  @ApiOperation({ summary: "Получить все должности сотрудников" })
  @ApiResponse({
    status: 200,
    description: "Список должностей получен",
    type: [TitleResponseDto],
  })
  async findAll(@Query() findAllDto: FindAllTitlesDto) {
    return this.titleService.findAll(findAllDto);
  }

  @Get(":id")
  @ApiOperation({ summary: "Получить должность по ID" })
  @ApiResponse({
    status: 200,
    description: "Должность найдена",
    type: TitleResponseDto,
  })
  async findOne(@Param("id") id: string): Promise<TitleResponseDto> {
    return this.titleService.findOne(id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Обновить должность" })
  @ApiResponse({
    status: 200,
    description: "Должность обновлена",
    type: TitleResponseDto,
  })
  async update(
    @Param("id") id: string,
    @Body() updateTitleDto: UpdateTitleDto,
  ): Promise<TitleResponseDto> {
    return this.titleService.update(id, updateTitleDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Удалить должность" })
  @ApiResponse({ status: 200, description: "Должность успешно удалена" })
  async remove(@Param("id") id: string): Promise<{ message: string }> {
    await this.titleService.remove(id);
    return { message: "Должность успешно удалена" };
  }

  @Patch(":id/toggle-status")
  @ApiOperation({ summary: "Изменить статус должности (активная/неактивная)" })
  @ApiResponse({
    status: 200,
    description: "Статус должности изменен",
    type: TitleResponseDto,
  })
  async toggleStatus(@Param("id") id: string): Promise<TitleResponseDto> {
    return this.titleService.toggleStatus(id);
  }
}
