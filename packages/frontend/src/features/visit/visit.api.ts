import { rootApi } from "@/store/api/root.api";
import { API_TAG_OPERATIONS_VISITS } from "@/constants/api-tags.constants";
import type {
  CreateVisitRequestDto,
  UpdateVisitRequestDto,
  StartVisitRequestDto,
  CompleteVisitRequestDto,
  VisitResponseDto,
  VisitsListResponseDto,
  VisitsQueryParamsDto,
} from "./visit.dto";
import { VisitIncludeRelation } from "./visit.dto";

export const visitApi = rootApi.injectEndpoints({
  overrideExisting: false,
  endpoints: (builder) => ({
    getVisits: builder.query<VisitsListResponseDto, VisitsQueryParamsDto>({
      query: (params) => ({
        url: "/api/v1/visits",
        method: "GET",
        params: {
          ...params,
          // Default include patient and employee if not specified
          include: params.include ?? [
            VisitIncludeRelation.PATIENT,
            VisitIncludeRelation.EMPLOYEE,
          ],
        },
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

    startVisit: builder.mutation<
      VisitResponseDto,
      { id: string } & StartVisitRequestDto
    >({
      query: ({ id, ...data }) => ({
        url: `/api/v1/visits/${id}/start`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: API_TAG_OPERATIONS_VISITS, id },
        API_TAG_OPERATIONS_VISITS,
      ],
    }),

    completeVisit: builder.mutation<
      VisitResponseDto,
      { id: string } & CompleteVisitRequestDto
    >({
      query: ({ id, ...data }) => ({
        url: `/api/v1/visits/${id}/complete`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: API_TAG_OPERATIONS_VISITS, id },
        API_TAG_OPERATIONS_VISITS,
      ],
    }),

    cancelVisit: builder.mutation<
      VisitResponseDto,
      { id: string; cancelReason?: string }
    >({
      query: ({ id, cancelReason }) => ({
        url: `/api/v1/visits/${id}/cancel`,
        method: "POST",
        body: { cancelReason },
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
  useStartVisitMutation,
  useCompleteVisitMutation,
  useCancelVisitMutation,
  useDeleteVisitMutation,
} = visitApi;
