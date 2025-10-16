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
import { LanguageService } from "./language.service";
import { CreateLanguageDto } from "./dto/create-language.dto";
import { UpdateLanguageDto } from "./dto/update-language.dto";
import { FindAllLanguagesDto } from "./dto/find-all-languages.dto";
import { LanguageResponseDto } from "./dto/language-response.dto";
import {
  RequirePermission,
  PermissionGuard,
} from "../../../common/guards/permission.guard";

@ApiTags("Languages")
@ApiBearerAuth()
@Controller("master-data/languages")
@UseGuards(AuthGuard("jwt"), PermissionGuard)
export class LanguageController {
  constructor(private readonly languageService: LanguageService) {}

  @Post()
  @ApiOperation({ summary: "Создать язык" })
  @ApiResponse({
    status: 201,
    description: "Язык успешно создан",
    type: LanguageResponseDto,
  })
  async create(
    @Body() createLanguageDto: CreateLanguageDto,
  ): Promise<LanguageResponseDto> {
    return this.languageService.create(createLanguageDto);
  }

  @Get()
  @ApiOperation({ summary: "Получить все языки" })
  @ApiResponse({
    status: 200,
    description: "Список языков получен",
    type: [LanguageResponseDto],
  })
  async findAll(@Query() findAllDto: FindAllLanguagesDto) {
    return this.languageService.findAll(findAllDto);
  }

  @Get(":id")
  @ApiOperation({ summary: "Получить язык по ID" })
  @ApiResponse({
    status: 200,
    description: "Язык найден",
    type: LanguageResponseDto,
  })
  async findOne(@Param("id") id: string): Promise<LanguageResponseDto> {
    return this.languageService.findOne(id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Обновить язык" })
  @ApiResponse({
    status: 200,
    description: "Язык обновлен",
    type: LanguageResponseDto,
  })
  async update(
    @Param("id") id: string,
    @Body() updateLanguageDto: UpdateLanguageDto,
  ): Promise<LanguageResponseDto> {
    return this.languageService.update(id, updateLanguageDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Удалить язык" })
  @ApiResponse({ status: 200, description: "Язык успешно удален" })
  async remove(@Param("id") id: string): Promise<{ message: string }> {
    await this.languageService.remove(id);
    return { message: "Язык успешно удален" };
  }

  @Patch(":id/toggle-status")
  @ApiOperation({ summary: "Изменить статус языка (активный/неактивный)" })
  @ApiResponse({
    status: 200,
    description: "Статус языка изменен",
    type: LanguageResponseDto,
  })
  async toggleStatus(@Param("id") id: string): Promise<LanguageResponseDto> {
    return this.languageService.toggleStatus(id);
  }
}
