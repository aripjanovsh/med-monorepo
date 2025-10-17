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
import { ProtocolTemplateService } from "./protocol-template.service";
import { CreateProtocolTemplateDto } from "./dto/create-protocol-template.dto";
import { UpdateProtocolTemplateDto } from "./dto/update-protocol-template.dto";
import { FindAllProtocolTemplateDto } from "./dto/find-all-protocol-template.dto";
import { ProtocolTemplateResponseDto } from "./dto/protocol-template-response.dto";
import {
  RequirePermission,
  PermissionGuard,
} from "../../common/guards/permission.guard";
import {
  CurrentUser,
  CurrentUserData,
} from "../../common/decorators/current-user.decorator";

@ApiTags("Protocol Templates")
@Controller("protocol-templates")
@UseGuards(AuthGuard("jwt"), PermissionGuard)
@ApiBearerAuth()
export class ProtocolTemplateController {
  constructor(
    private readonly protocolTemplateService: ProtocolTemplateService,
  ) {}

  @Post()
  @RequirePermission({ resource: "protocol-templates", action: "CREATE" })
  @ApiOperation({ summary: "Create new protocol template" })
  @ApiResponse({
    status: 201,
    description: "Protocol template created successfully",
    type: ProtocolTemplateResponseDto,
  })
  @ApiResponse({ status: 400, description: "Validation error" })
  create(
    @Body() createDto: CreateProtocolTemplateDto,
    @CurrentUser() currentUser: CurrentUserData,
  ) {
    return this.protocolTemplateService.create(createDto, currentUser.id);
  }

  @Get()
  @RequirePermission({ resource: "protocol-templates", action: "READ" })
  @ApiOperation({ summary: "Get all protocol templates with pagination" })
  @ApiResponse({
    status: 200,
    description: "Protocol templates retrieved successfully",
  })
  findAll(@Query() query: FindAllProtocolTemplateDto) {
    return this.protocolTemplateService.findAll(query);
  }

  @Get(":id")
  @RequirePermission({ resource: "protocol-templates", action: "READ" })
  @ApiOperation({ summary: "Get protocol template by ID" })
  @ApiResponse({
    status: 200,
    description: "Protocol template found",
    type: ProtocolTemplateResponseDto,
  })
  @ApiResponse({ status: 404, description: "Protocol template not found" })
  findOne(@Param("id") id: string) {
    return this.protocolTemplateService.findOne(id);
  }

  @Patch(":id")
  @RequirePermission({ resource: "protocol-templates", action: "UPDATE" })
  @ApiOperation({ summary: "Update protocol template" })
  @ApiResponse({
    status: 200,
    description: "Protocol template updated successfully",
    type: ProtocolTemplateResponseDto,
  })
  @ApiResponse({ status: 404, description: "Protocol template not found" })
  update(
    @Param("id") id: string,
    @Body() updateDto: UpdateProtocolTemplateDto,
    @CurrentUser() currentUser: CurrentUserData,
  ) {
    return this.protocolTemplateService.update(id, updateDto, currentUser.id);
  }

  @Delete(":id")
  @RequirePermission({ resource: "protocol-templates", action: "DELETE" })
  @ApiOperation({ summary: "Delete protocol template" })
  @ApiResponse({
    status: 200,
    description: "Protocol template deleted successfully",
  })
  @ApiResponse({ status: 404, description: "Protocol template not found" })
  remove(@Param("id") id: string) {
    return this.protocolTemplateService.remove(id);
  }
}
