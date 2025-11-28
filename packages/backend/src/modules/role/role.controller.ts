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
import { RoleService } from "./role.service";
import { CreateRoleDto } from "./dto/create-role.dto";
import { UpdateRoleDto } from "./dto/update-role.dto";
import { AssignRoleDto } from "./dto/assign-role.dto";
import { FindAllRoleDto } from "./dto/find-all-role.dto";
import { RequireTenant } from "../../common/guards/tenant.guard";
import {
  CurrentUser,
  CurrentUserData,
} from "../../common/decorators/current-user.decorator";

@ApiTags("Roles")
@Controller("roles")
@UseGuards(AuthGuard("jwt"))
@ApiBearerAuth()
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post()
  @RequireTenant(true)
  @ApiOperation({ summary: "Create new role" })
  @ApiResponse({ status: 201, description: "Role created successfully" })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 409, description: "Role already exists" })
  create(
    @Body() createRoleDto: CreateRoleDto,
    @CurrentUser() currentUser: CurrentUserData,
  ) {
    return this.roleService.create(createRoleDto, currentUser);
  }

  @Get()
  @RequireTenant(true)
  @ApiOperation({ summary: "Get all roles with pagination" })
  @ApiResponse({ status: 200, description: "Roles retrieved successfully" })
  findAll(
    @Query() query: FindAllRoleDto,
    @CurrentUser() currentUser: CurrentUserData,
  ) {
    return this.roleService.findAll(query, currentUser);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get role by ID" })
  @ApiResponse({ status: 200, description: "Role found" })
  @ApiResponse({ status: 404, description: "Role not found" })
  findOne(@Param("id") id: string) {
    return this.roleService.findById(id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update role" })
  @ApiResponse({ status: 200, description: "Role updated successfully" })
  @ApiResponse({ status: 404, description: "Role not found" })
  @ApiResponse({ status: 409, description: "Role name already exists" })
  @ApiResponse({ status: 403, description: "Cannot modify system role" })
  update(@Param("id") id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return this.roleService.update(id, updateRoleDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete role" })
  @ApiResponse({ status: 200, description: "Role deleted successfully" })
  @ApiResponse({ status: 404, description: "Role not found" })
  @ApiResponse({ status: 403, description: "Cannot delete system role" })
  remove(@Param("id") id: string) {
    return this.roleService.remove(id);
  }

  @Post("assign")
  @ApiOperation({ summary: "Assign role to user" })
  @ApiResponse({ status: 201, description: "Role assigned successfully" })
  @ApiResponse({ status: 409, description: "User already has this role" })
  assignRole(@Body() assignRoleDto: AssignRoleDto) {
    return this.roleService.assignUserRole(assignRoleDto);
  }

  @Delete("users/:userId/roles/:roleId")
  @ApiOperation({ summary: "Remove role from user" })
  @ApiResponse({ status: 200, description: "Role removed successfully" })
  @ApiResponse({ status: 404, description: "Role assignment not found" })
  removeUserRole(
    @Param("userId") userId: string,
    @Param("roleId") roleId: string,
  ) {
    return this.roleService.removeUserRole(userId, roleId);
  }

  @Get("users/:userId/roles")
  @ApiOperation({ summary: "Get user roles" })
  @ApiResponse({
    status: 200,
    description: "User roles retrieved successfully",
  })
  getUserRoles(@Param("userId") userId: string) {
    return this.roleService.getUserRoles(userId);
  }

  @Get("users/:userId/permissions")
  @ApiOperation({ summary: "Get user permissions" })
  @ApiResponse({
    status: 200,
    description: "User permissions retrieved successfully",
  })
  getUserPermissions(@Param("userId") userId: string) {
    return this.roleService.getUserPermissions(userId);
  }

  @Get("users/:userId/check/:permission")
  @ApiOperation({ summary: "Check user permission" })
  @ApiResponse({ status: 200, description: "Permission check result" })
  async checkUserPermission(
    @Param("userId") userId: string,
    @Param("permission") permission: string,
  ) {
    const hasPermission = await this.roleService.checkUserPermission(
      userId,
      permission,
    );
    return { hasPermission };
  }
}
