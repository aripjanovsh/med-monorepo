import { rootApi } from "@/store/api/root.api";
import type {
  Holiday,
  CreateHolidayRequest,
  UpdateHolidayRequest,
  MasterDataPaginatedResponse,
  MasterDataQueryParams,
} from "@/features/master-data/master-data.types";
import { API_TAG_OPERATIONS_HOLIDAYS } from "@/constants/api-tags.constants";

export const holidaysApi = rootApi.injectEndpoints({
  overrideExisting: false,
  endpoints: (builder) => ({
    getHolidays: builder.query<
      MasterDataPaginatedResponse<Holiday>,
      MasterDataQueryParams
    >({
      query: (params) => ({
        url: "/api/v1/master-data/holidays",
        method: "GET",
        params,
      }),
      providesTags: [API_TAG_OPERATIONS_HOLIDAYS],
    }),

    getHoliday: builder.query<Holiday, string>({
      query: (id) => ({
        url: `/api/v1/master-data/holidays/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [
        { type: API_TAG_OPERATIONS_HOLIDAYS, id },
      ],
    }),

    createHoliday: builder.mutation<Holiday, CreateHolidayRequest>({
      query: (data) => ({
        url: "/api/v1/master-data/holidays",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [API_TAG_OPERATIONS_HOLIDAYS],
    }),

    updateHoliday: builder.mutation<
      Holiday,
      { id: string; data: UpdateHolidayRequest }
    >({
      query: ({ id, data }) => ({
        url: `/api/v1/master-data/holidays/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: API_TAG_OPERATIONS_HOLIDAYS, id },
        API_TAG_OPERATIONS_HOLIDAYS,
      ],
    }),

    deleteHoliday: builder.mutation<void, string>({
      query: (id) => ({
        url: `/api/v1/master-data/holidays/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: API_TAG_OPERATIONS_HOLIDAYS, id },
        API_TAG_OPERATIONS_HOLIDAYS,
      ],
    }),
  }),
});

export const {
  useGetHolidaysQuery,
  useGetHolidayQuery,
  useCreateHolidayMutation,
  useUpdateHolidayMutation,
  useDeleteHolidayMutation,
} = holidaysApi;
