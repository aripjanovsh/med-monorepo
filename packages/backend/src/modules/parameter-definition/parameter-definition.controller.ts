import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger";
import { ParameterDefinitionService } from "./parameter-definition.service";
import { CreateParameterDefinitionDto } from "./dto/create-parameter-definition.dto";
import { UpdateParameterDefinitionDto } from "./dto/update-parameter-definition.dto";
import { FindAllParameterDefinitionDto } from "./dto/find-all-parameter-definition.dto";
import { ParameterDefinitionResponseDto } from "./dto/parameter-definition-response.dto";
import { PaginatedResponseDto } from "@/common/dto/pagination.dto";
import { PermissionGuard } from "@/common/guards/permission.guard";

@ApiTags("Parameter Definitions")
@ApiBearerAuth()
@UseGuards(AuthGuard("jwt"), PermissionGuard)
@Controller("parameter-definitions")
export class ParameterDefinitionController {
  constructor(private readonly service: ParameterDefinitionService) {}

  @Post()
  @ApiOperation({ summary: "Create parameter definition" })
  @ApiResponse({ status: 201, type: ParameterDefinitionResponseDto })
  create(@Body() dto: CreateParameterDefinitionDto): Promise<ParameterDefinitionResponseDto> {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: "Get all parameter definitions" })
  @ApiResponse({ status: 200, type: PaginatedResponseDto })
  findAll(
    @Query() query: FindAllParameterDefinitionDto,
    @Req() req: any
  ): Promise<PaginatedResponseDto<ParameterDefinitionResponseDto>> {
    return this.service.findAll(query, req.user.organizationId);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get parameter definition by ID" })
  @ApiResponse({ status: 200, type: ParameterDefinitionResponseDto })
  findOne(@Param("id") id: string, @Req() req: any): Promise<ParameterDefinitionResponseDto> {
    return this.service.findOne(id, req.user.organizationId);
  }

  @Get("by-code/:code")
  @ApiOperation({ summary: "Get parameter definition by code" })
  @ApiResponse({ status: 200, type: ParameterDefinitionResponseDto })
  findByCode(@Param("code") code: string, @Req() req: any): Promise<ParameterDefinitionResponseDto | null> {
    return this.service.findByCode(code, req.user.organizationId);
  }

  @Put(":id")
  @ApiOperation({ summary: "Update parameter definition" })
  @ApiResponse({ status: 200, type: ParameterDefinitionResponseDto })
  update(
    @Param("id") id: string,
    @Body() dto: UpdateParameterDefinitionDto,
    @Req() req: any
  ): Promise<ParameterDefinitionResponseDto> {
    return this.service.update(id, dto, req.user.organizationId);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete parameter definition" })
  @ApiResponse({ status: 200 })
  remove(@Param("id") id: string, @Req() req: any): Promise<void> {
    return this.service.remove(id, req.user.organizationId);
  }
}
