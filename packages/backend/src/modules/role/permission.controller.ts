import { Controller, Get, Post, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { PermissionService } from "./permission.service";
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

  @Get("available")
  @ApiOperation({ summary: "Get list of all available permissions" })
  @ApiResponse({
    status: 200,
    description: "Available permissions retrieved successfully",
  })
  getAvailablePermissions() {
    return this.permissionService.getAvailablePermissions();
  }

  @Get("default-roles")
  @ApiOperation({ summary: "Get default role configurations" })
  @ApiResponse({
    status: 200,
    description: "Default roles retrieved successfully",
  })
  getDefaultRoles() {
    return this.permissionService.getDefaultRoles();
  }

  @Post("seed-roles")
  @ApiOperation({ summary: "Seed default roles for organization" })
  @ApiResponse({
    status: 200,
    description: "Default roles seeded successfully",
  })
  seedDefaultRoles(@CurrentUser() currentUser: CurrentUserData) {
    return this.permissionService.seedDefaultRoles(currentUser.organizationId);
  }
}
