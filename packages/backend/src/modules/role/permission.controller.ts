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
import { PermissionAction } from "@prisma/client";
import { PermissionService } from "./permission.service";
import { CreatePermissionDto } from "./dto/create-permission.dto";
import { FindAllPermissionDto } from "./dto/find-all-permission.dto";
import {
  CurrentUser,
  CurrentUserData,
} from "../../common/decorators/current-user.decorator";

@ApiTags("Permissions")
@Controller("permissions")
@UseGuards(AuthGuard("jwt"))
@ApiBearerAuth()
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Post()
  @ApiOperation({ summary: "Create new permission" })
  @ApiResponse({ status: 201, description: "Permission created successfully" })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 409, description: "Permission already exists" })
  create(@Body() createPermissionDto: CreatePermissionDto) {
    return this.permissionService.create(createPermissionDto);
  }

  @Get()
  @ApiOperation({ summary: "Get all permissions with pagination" })
  @ApiResponse({
    status: 200,
    description: "Permissions retrieved successfully",
  })
  findAll(
    @Query() query: FindAllPermissionDto,
    @CurrentUser() currentUser: CurrentUserData,
  ) {
    return this.permissionService.findAll(query, currentUser);
  }

  @Get("resources")
  @ApiOperation({ summary: "Get list of all resources" })
  @ApiResponse({
    status: 200,
    description: "Resource list retrieved successfully",
  })
  getResources() {
    return this.permissionService.getResourceList();
  }

  @Get("grouped")
  @ApiOperation({ summary: "Get permissions grouped by resource" })
  @ApiResponse({
    status: 200,
    description: "Grouped permissions retrieved successfully",
  })
  getGroupedPermissions() {
    return this.permissionService.getPermissionsByResource();
  }

  @Get("seed")
  @ApiOperation({ summary: "Seed default permissions" })
  @ApiResponse({
    status: 200,
    description: "Default permissions seeded successfully",
  })
  seedDefaultPermissions() {
    return this.permissionService.seedDefaultPermissions();
  }

  @Get(":id")
  @ApiOperation({ summary: "Get permission by ID" })
  @ApiResponse({ status: 200, description: "Permission found" })
  @ApiResponse({ status: 404, description: "Permission not found" })
  findOne(@Param("id") id: string) {
    return this.permissionService.findById(id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update permission" })
  @ApiResponse({ status: 200, description: "Permission updated successfully" })
  @ApiResponse({ status: 404, description: "Permission not found" })
  @ApiResponse({ status: 409, description: "Permission already exists" })
  update(
    @Param("id") id: string,
    @Body() updateData: Partial<CreatePermissionDto>,
  ) {
    return this.permissionService.update(id, updateData);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete permission" })
  @ApiResponse({ status: 200, description: "Permission deleted successfully" })
  @ApiResponse({ status: 404, description: "Permission not found" })
  remove(@Param("id") id: string) {
    return this.permissionService.remove(id);
  }
}
