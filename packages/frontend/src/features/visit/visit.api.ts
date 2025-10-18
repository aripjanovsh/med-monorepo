import { rootApi } from "@/store/api/root.api";
import { API_TAG_OPERATIONS_VISITS } from "@/constants/api-tags.constants";
import type {
  CreateVisitRequestDto,
  UpdateVisitRequestDto,
  UpdateVisitStatusRequestDto,
  VisitResponseDto,
  VisitsListResponseDto,
  VisitsQueryParamsDto,
} from "./visit.dto";

export const visitApi = rootApi.injectEndpoints({
  overrideExisting: false,
  endpoints: (builder) => ({
    getVisits: builder.query<VisitsListResponseDto, VisitsQueryParamsDto>({
      query: (params) => ({
        url: "/api/v1/visits",
        method: "GET",
        params,
      }),
      providesTags: [API_TAG_OPERATIONS_VISITS],
    }),

    getVisit: builder.query<VisitResponseDto, string>({
      query: (id) => ({
        url: `/api/v1/visits/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [
        { type: API_TAG_OPERATIONS_VISITS, id },
      ],
    }),

    createVisit: builder.mutation<VisitResponseDto, CreateVisitRequestDto>({
      query: (data) => ({
        url: "/api/v1/visits",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [API_TAG_OPERATIONS_VISITS],
    }),

    updateVisit: builder.mutation<VisitResponseDto, UpdateVisitRequestDto>({
      query: ({ id, ...data }) => ({
        url: `/api/v1/visits/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: API_TAG_OPERATIONS_VISITS, id },
        API_TAG_OPERATIONS_VISITS,
      ],
    }),

    updateVisitStatus: builder.mutation<
      VisitResponseDto,
      { id: string } & UpdateVisitStatusRequestDto
    >({
      query: ({ id, ...data }) => ({
        url: `/api/v1/visits/${id}/status`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: API_TAG_OPERATIONS_VISITS, id },
        API_TAG_OPERATIONS_VISITS,
      ],
    }),

    deleteVisit: builder.mutation<void, string>({
      query: (id) => ({
        url: `/api/v1/visits/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: API_TAG_OPERATIONS_VISITS, id },
        API_TAG_OPERATIONS_VISITS,
      ],
    }),
  }),
});

export const {
  useGetVisitsQuery,
  useGetVisitQuery,
  useCreateVisitMutation,
  useUpdateVisitMutation,
  useUpdateVisitStatusMutation,
  useDeleteVisitMutation,
} = visitApi;
