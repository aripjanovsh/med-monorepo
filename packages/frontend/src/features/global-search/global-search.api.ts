import { rootApi } from "@/store/api/root.api";
import type {
  GlobalSearchResponseDto,
  GlobalSearchQueryParams,
} from "./global-search.dto";

export const globalSearchApi = rootApi.injectEndpoints({
  overrideExisting: false,
  endpoints: (builder) => ({
    globalSearch: builder.query<
      GlobalSearchResponseDto,
      GlobalSearchQueryParams
    >({
      query: (params) => ({
        url: "/api/v1/global-search",
        method: "GET",
        params,
      }),
    }),
  }),
});

export const { useGlobalSearchQuery, useLazyGlobalSearchQuery } =
  globalSearchApi;
