import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from "@nestjs/swagger";
import { plainToInstance } from "class-transformer";

import { LocationService } from "./location.service";
import {
  CreateLocationDto,
  UpdateLocationDto,
  LocationResponseDto,
  FindAllLocationsDto,
  LocationTreeDto,
  SuggestLocationsDto,
} from "./dto";

@ApiTags("Locations")
@Controller("master-data/locations")
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  @Post()
  @ApiOperation({ summary: "Create a new location" })
  @ApiResponse({
    status: 201,
    description: "Location created successfully",
    type: LocationResponseDto,
  })
  @ApiResponse({ status: 400, description: "Bad request" })
  create(@Body() createLocationDto: CreateLocationDto) {
    return this.locationService.create(createLocationDto);
  }

  @Get()
  @ApiOperation({ summary: "Get all locations with filtering and pagination" })
  @ApiResponse({
    status: 200,
    description: "Locations retrieved successfully",
    type: [LocationResponseDto],
  })
  findAll(@Query() query: FindAllLocationsDto) {
    return this.locationService.findAll(query);
  }

  @Get("suggest")
  @ApiOperation({ summary: "Suggest locations" })
  @ApiResponse({ status: 200, type: [LocationResponseDto] })
  suggest(@Query() query: SuggestLocationsDto) {
    return this.locationService.suggest(query);
  }

  @Get("tree")
  @ApiOperation({
    summary: "Get complete location hierarchy as tree structure",
    description:
      "Returns all locations organized in hierarchical tree structure: Country -> Region -> City -> District",
  })
  @ApiResponse({
    status: 200,
    description: "Location tree retrieved successfully",
    type: [LocationTreeDto],
  })
  findLocationTree() {
    return this.locationService.findLocationTree();
  }

  @Get(":id")
  @ApiOperation({ summary: "Get location by ID" })
  @ApiParam({ name: "id", description: "Location ID" })
  @ApiQuery({
    name: "includeRelations",
    required: false,
    type: Boolean,
    description: "Include parent and children relations",
  })
  @ApiResponse({
    status: 200,
    description: "Location retrieved successfully",
    type: LocationResponseDto,
  })
  @ApiResponse({ status: 404, description: "Location not found" })
  async findOne(
    @Param("id", ParseUUIDPipe) id: string,
    @Query("includeRelations") includeRelations: boolean = true
  ) {
    const location = await this.locationService.findOne(id, includeRelations);
    return plainToInstance(LocationResponseDto, location);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update location" })
  @ApiParam({ name: "id", description: "Location ID" })
  @ApiResponse({
    status: 200,
    description: "Location updated successfully",
    type: LocationResponseDto,
  })
  @ApiResponse({ status: 404, description: "Location not found" })
  @ApiResponse({ status: 400, description: "Bad request" })
  async update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() updateLocationDto: UpdateLocationDto
  ) {
    const location = await this.locationService.update(id, updateLocationDto);
    return plainToInstance(LocationResponseDto, location);
  }

  @Patch(":id/toggle-status")
  @ApiOperation({
    summary: "Toggle location active status",
    description: "Activate or deactivate a location",
  })
  @ApiParam({ name: "id", description: "Location ID" })
  @ApiResponse({
    status: 200,
    description: "Location status toggled successfully",
    type: LocationResponseDto,
  })
  @ApiResponse({ status: 404, description: "Location not found" })
  async toggleStatus(@Param("id", ParseUUIDPipe) id: string) {
    const location = await this.locationService.toggleStatus(id);
    return plainToInstance(LocationResponseDto, location);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete location" })
  @ApiParam({ name: "id", description: "Location ID" })
  @ApiResponse({ status: 200, description: "Location deleted successfully" })
  @ApiResponse({ status: 404, description: "Location not found" })
  @ApiResponse({
    status: 400,
    description: "Cannot delete location with active children",
  })
  async remove(@Param("id", ParseUUIDPipe) id: string) {
    await this.locationService.remove(id);
    return { message: "Location deleted successfully" };
  }
}
