import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { StatsService } from "./stats.service";
import { StatsQueryDto } from "./dto/stats-query.dto";
import { StatsResponseDto } from "./dto/stat-response.dto";
import {
  RequirePermission,
  PermissionGuard,
} from "@/common/guards/permission.guard";

@ApiTags("Statistics")
@Controller("stats")
@UseGuards(AuthGuard("jwt"), PermissionGuard)
@ApiBearerAuth()
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get()
  @RequirePermission({ resource: "stats", action: "READ" })
  @ApiOperation({ summary: "Get all statistics for date range" })
  @ApiResponse({
    status: 200,
    description: "All statistics data",
    type: StatsResponseDto,
  })
  getStats(@Query() query: StatsQueryDto): Promise<StatsResponseDto> {
    return this.statsService.getStats(query);
  }
}
