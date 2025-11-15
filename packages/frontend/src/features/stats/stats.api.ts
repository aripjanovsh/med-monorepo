import { rootApi } from "@/store/api/root.api";
import { API_TAG_OPERATIONS_STATS } from "@/constants/api-tags.constants";
import type { StatsQueryDto, StatsResponseDto } from "./stats.dto";

export const STATS_API_TAG = API_TAG_OPERATIONS_STATS;

export const statsApi = rootApi.injectEndpoints({
  endpoints: (builder) => ({
    getStats: builder.query<StatsResponseDto, StatsQueryDto | void>({
      query: (params) => {
        const queryParams = params ? { ...params } : undefined;
        // Convert types array to comma-separated string for query params
        if (queryParams?.types) {
          queryParams.types = queryParams.types.join(",") as any;
        }
        return {
          url: "/api/v1/stats",
          params: queryParams,
        };
      },
      providesTags: [STATS_API_TAG],
    }),
  }),
});

export const { useGetStatsQuery } = statsApi;
