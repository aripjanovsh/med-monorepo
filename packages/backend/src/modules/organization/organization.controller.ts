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
import { OrganizationService } from "./organization.service";
import { CreateOrganizationDto } from "./dto/create-organization.dto";
import { UpdateOrganizationDto } from "./dto/update-organization.dto";
import { FindAllOrganizationDto } from "./dto/find-all-organization.dto";
import { RolesSeed } from "../../common/seeds/roles.seed";
import { PrismaService } from "../../common/prisma/prisma.service";
import {
  CurrentUser,
  CurrentUserData,
} from "../../common/decorators/current-user.decorator";

@ApiTags("Organizations")
@Controller("organizations")
@UseGuards(AuthGuard("jwt"))
@ApiBearerAuth()
export class OrganizationController {
  constructor(
    private readonly organizationService: OrganizationService,
    private readonly prisma: PrismaService
  ) {}

  @Post()
  @ApiOperation({ summary: "Create new organization" })
  @ApiResponse({
    status: 201,
    description: "Organization created successfully",
  })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 409, description: "Organization already exists" })
  create(@Body() createOrganizationDto: CreateOrganizationDto) {
    return this.organizationService.create(createOrganizationDto);
  }

  @Get("my")
  @ApiOperation({ summary: "Get current user's organization" })
  @ApiResponse({
    status: 200,
    description: "Organization found",
  })
  @ApiResponse({ status: 404, description: "Organization not found" })
  getMyOrganization(@CurrentUser() currentUser: CurrentUserData) {
    return this.organizationService.getMyOrganization(currentUser);
  }

  @Patch("my")
  @ApiOperation({ summary: "Update current user's organization" })
  @ApiResponse({
    status: 200,
    description: "Organization updated successfully",
  })
  @ApiResponse({ status: 404, description: "Organization not found" })
  updateMyOrganization(
    @CurrentUser() currentUser: CurrentUserData,
    @Body() updateOrganizationDto: UpdateOrganizationDto
  ) {
    return this.organizationService.updateMyOrganization(
      currentUser,
      updateOrganizationDto
    );
  }

  @Get()
  @ApiOperation({ summary: "Get all organizations with pagination" })
  @ApiResponse({
    status: 200,
    description: "Organizations retrieved successfully",
  })
  findAll(
    @Query() query: FindAllOrganizationDto,
    @CurrentUser() currentUser: CurrentUserData
  ) {
    return this.organizationService.findAll(query, currentUser);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get organization by ID" })
  @ApiResponse({ status: 200, description: "Organization found" })
  @ApiResponse({ status: 404, description: "Organization not found" })
  findOne(@Param("id") id: string) {
    return this.organizationService.findById(id);
  }

  @Get("slug/:slug")
  @ApiOperation({ summary: "Get organization by slug" })
  @ApiResponse({ status: 200, description: "Organization found" })
  @ApiResponse({ status: 404, description: "Organization not found" })
  findBySlug(@Param("slug") slug: string) {
    return this.organizationService.findBySlug(slug);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update organization" })
  @ApiResponse({
    status: 200,
    description: "Organization updated successfully",
  })
  @ApiResponse({ status: 404, description: "Organization not found" })
  @ApiResponse({ status: 409, description: "Slug already exists" })
  update(
    @Param("id") id: string,
    @Body() updateOrganizationDto: UpdateOrganizationDto
  ) {
    return this.organizationService.update(id, updateOrganizationDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete organization" })
  @ApiResponse({
    status: 200,
    description: "Organization deleted successfully",
  })
  @ApiResponse({ status: 404, description: "Organization not found" })
  remove(@Param("id") id: string) {
    return this.organizationService.remove(id);
  }

  @Post(":id/seed-roles")
  @ApiOperation({ summary: "Seed default roles for organization" })
  @ApiResponse({
    status: 200,
    description: "Default roles seeded successfully",
  })
  @ApiResponse({ status: 404, description: "Organization not found" })
  async seedRoles(@Param("id") organizationId: string) {
    // Verify organization exists
    await this.organizationService.findById(organizationId);

    const rolesSeed = new RolesSeed(this.prisma);
    return rolesSeed.seedDefaultRoles(organizationId);
  }
}
