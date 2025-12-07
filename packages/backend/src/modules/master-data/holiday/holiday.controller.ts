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
import { HolidayService } from "./holiday.service";
import { CreateHolidayDto } from "./dto/create-holiday.dto";
import { UpdateHolidayDto } from "./dto/update-holiday.dto";
import { FindAllHolidaysDto } from "./dto/find-all-holidays.dto";
import { HolidayResponseDto } from "./dto/holiday-response.dto";

@ApiTags("Holidays")
@ApiBearerAuth()
@Controller("master-data/holidays")
@UseGuards(AuthGuard("jwt"), PermissionGuard)
export class HolidayController {
  constructor(private readonly holidayService: HolidayService) {}

  @Post()
  @ApiOperation({ summary: "Создать праздник" })
  @ApiResponse({
    status: 201,
    description: "Праздник успешно создан",
    type: HolidayResponseDto,
  })
  async create(
    @Body() createHolidayDto: CreateHolidayDto
  ): Promise<HolidayResponseDto> {
    return this.holidayService.create(createHolidayDto);
  }

  @Get()
  @ApiOperation({ summary: "Получить все праздники" })
  @ApiResponse({
    status: 200,
    description: "Список праздников получен",
    type: [HolidayResponseDto],
  })
  async findAll(@Query() findAllDto: FindAllHolidaysDto) {
    return this.holidayService.findAll(findAllDto);
  }

  @Get(":id")
  @ApiOperation({ summary: "Получить праздник по ID" })
  @ApiResponse({
    status: 200,
    description: "Праздник найден",
    type: HolidayResponseDto,
  })
  async findOne(@Param("id") id: string): Promise<HolidayResponseDto> {
    return this.holidayService.findOne(id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Обновить праздник" })
  @ApiResponse({
    status: 200,
    description: "Праздник обновлен",
    type: HolidayResponseDto,
  })
  async update(
    @Param("id") id: string,
    @Body() updateHolidayDto: UpdateHolidayDto
  ): Promise<HolidayResponseDto> {
    return this.holidayService.update(id, updateHolidayDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Удалить праздник" })
  @ApiResponse({ status: 200, description: "Праздник успешно удален" })
  async remove(@Param("id") id: string): Promise<{ message: string }> {
    await this.holidayService.remove(id);
    return { message: "Праздник успешно удален" };
  }

  @Patch(":id/toggle-status")
  @ApiOperation({ summary: "Изменить статус праздника" })
  @ApiResponse({
    status: 200,
    description: "Статус праздника изменен",
    type: HolidayResponseDto,
  })
  async toggleStatus(@Param("id") id: string): Promise<HolidayResponseDto> {
    return this.holidayService.toggleStatus(id);
  }
}
