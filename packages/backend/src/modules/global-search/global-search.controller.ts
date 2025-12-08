import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { GlobalSearchService } from "./global-search.service";
import {
  GlobalSearchQueryDto,
  GlobalSearchResponseDto,
} from "./dto/global-search.dto";
import { AuthGuard } from "@nestjs/passport";

@ApiTags("Global Search")
@ApiBearerAuth()
@UseGuards(AuthGuard("jwt"))
@Controller("global-search")
export class GlobalSearchController {
  constructor(private readonly globalSearchService: GlobalSearchService) {}

  @Get()
  @ApiOperation({
    summary: "Search patients and employees",
    description:
      "Performs a unified search across patients and employees, returning grouped results.",
  })
  @ApiResponse({
    status: 200,
    description: "Search results grouped by type",
    type: GlobalSearchResponseDto,
  })
  async search(
    @Query() query: GlobalSearchQueryDto
  ): Promise<GlobalSearchResponseDto> {
    return this.globalSearchService.search(query);
  }
}
