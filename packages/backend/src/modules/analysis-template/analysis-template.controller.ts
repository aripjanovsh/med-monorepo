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
import { AnalysisTemplateService } from "./analysis-template.service";
import { CreateAnalysisTemplateDto } from "./dto/create-analysis-template.dto";
import { UpdateAnalysisTemplateDto } from "./dto/update-analysis-template.dto";
import { FindAllAnalysisTemplateDto } from "./dto/find-all-analysis-template.dto";
import { AnalysisTemplateResponseDto } from "./dto/analysis-template-response.dto";
import {
  RequirePermission,
  PermissionGuard,
} from "../../common/guards/permission.guard";
import {
  CurrentUser,
  CurrentUserData,
} from "../../common/decorators/current-user.decorator";

@ApiTags("Analysis Templates")
@Controller("analysis-templates")
@UseGuards(AuthGuard("jwt"), PermissionGuard)
@ApiBearerAuth()
export class AnalysisTemplateController {
  constructor(
    private readonly analysisTemplateService: AnalysisTemplateService,
  ) {}

  @Post()
  @RequirePermission({ resource: "analysis-templates", action: "CREATE" })
  @ApiOperation({ summary: "Create new analysis template" })
  @ApiResponse({
    status: 201,
    description: "Analysis template created successfully",
    type: AnalysisTemplateResponseDto,
  })
  @ApiResponse({ status: 400, description: "Validation error" })
  @ApiResponse({ status: 409, description: "Template code already exists" })
  create(
    @Body() createDto: CreateAnalysisTemplateDto,
    @CurrentUser() currentUser: CurrentUserData,
  ) {
    return this.analysisTemplateService.create(createDto, currentUser.id);
  }

  @Get()
  @RequirePermission({ resource: "analysis-templates", action: "READ" })
  @ApiOperation({ summary: "Get all analysis templates with pagination" })
  @ApiResponse({
    status: 200,
    description: "Analysis templates retrieved successfully",
  })
  findAll(@Query() query: FindAllAnalysisTemplateDto) {
    return this.analysisTemplateService.findAll(query);
  }

  @Get(":id")
  @RequirePermission({ resource: "analysis-templates", action: "READ" })
  @ApiOperation({ summary: "Get analysis template by ID" })
  @ApiResponse({
    status: 200,
    description: "Analysis template found",
    type: AnalysisTemplateResponseDto,
  })
  @ApiResponse({ status: 404, description: "Analysis template not found" })
  findOne(@Param("id") id: string) {
    return this.analysisTemplateService.findOne(id);
  }

  @Patch(":id")
  @RequirePermission({ resource: "analysis-templates", action: "UPDATE" })
  @ApiOperation({ summary: "Update analysis template" })
  @ApiResponse({
    status: 200,
    description: "Analysis template updated successfully",
    type: AnalysisTemplateResponseDto,
  })
  @ApiResponse({ status: 404, description: "Analysis template not found" })
  @ApiResponse({ status: 409, description: "Template code already exists" })
  update(
    @Param("id") id: string,
    @Body() updateDto: UpdateAnalysisTemplateDto,
    @CurrentUser() currentUser: CurrentUserData,
  ) {
    return this.analysisTemplateService.update(id, updateDto, currentUser.id);
  }

  @Delete(":id")
  @RequirePermission({ resource: "analysis-templates", action: "DELETE" })
  @ApiOperation({ summary: "Delete analysis template" })
  @ApiResponse({
    status: 200,
    description: "Analysis template deleted successfully",
  })
  @ApiResponse({ status: 404, description: "Analysis template not found" })
  remove(@Param("id") id: string) {
    return this.analysisTemplateService.remove(id);
  }
}
