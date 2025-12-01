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
  ActiveVisitResponseDto,
} from "./visit.dto";
import { VisitIncludeRelation } from "./visit.dto";
import type { DoctorQueueResponse } from "../doctor/types/doctor-queue";

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
      invalidatesTags: (result, error, { patientId }) => [
        API_TAG_OPERATIONS_VISITS,
        { type: API_TAG_OPERATIONS_VISITS, id: `patient-active-${patientId}` },
      ],
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
      {
        id: string;
        employeeId?: string;
        patientId?: string;
      } & StartVisitRequestDto
    >({
      query: ({ id, employeeId, patientId, ...data }) => ({
        url: `/api/v1/visits/${id}/start`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result, error, { id, employeeId, patientId }) => {
        const tags: Array<
          | { type: typeof API_TAG_OPERATIONS_VISITS; id?: string }
          | typeof API_TAG_OPERATIONS_VISITS
        > = [
          { type: API_TAG_OPERATIONS_VISITS, id },
          API_TAG_OPERATIONS_VISITS,
        ];
        if (employeeId) {
          tags.push({
            type: API_TAG_OPERATIONS_VISITS,
            id: `doctor-queue-${employeeId}`,
          });
        }
        if (patientId) {
          tags.push({
            type: API_TAG_OPERATIONS_VISITS,
            id: `patient-active-${patientId}`,
          });
        }
        return tags;
      },
    }),

    completeVisit: builder.mutation<
      VisitResponseDto,
      {
        id: string;
        employeeId?: string;
        patientId?: string;
      } & CompleteVisitRequestDto
    >({
      query: ({ id, employeeId, patientId, ...data }) => ({
        url: `/api/v1/visits/${id}/complete`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result, error, { id, employeeId, patientId }) => {
        const tags: Array<
          | { type: typeof API_TAG_OPERATIONS_VISITS; id?: string }
          | typeof API_TAG_OPERATIONS_VISITS
        > = [
          { type: API_TAG_OPERATIONS_VISITS, id },
          API_TAG_OPERATIONS_VISITS,
        ];
        if (employeeId) {
          tags.push({
            type: API_TAG_OPERATIONS_VISITS,
            id: `doctor-queue-${employeeId}`,
          });
        }
        if (patientId) {
          tags.push({
            type: API_TAG_OPERATIONS_VISITS,
            id: `patient-active-${patientId}`,
          });
        }
        return tags;
      },
    }),

    cancelVisit: builder.mutation<
      VisitResponseDto,
      { id: string; cancelReason?: string; patientId?: string }
    >({
      query: ({ id, cancelReason }) => ({
        url: `/api/v1/visits/${id}/cancel`,
        method: "POST",
        body: { cancelReason },
      }),
      invalidatesTags: (result, error, { id, patientId }) => {
        const tags: Array<
          | { type: typeof API_TAG_OPERATIONS_VISITS; id?: string }
          | typeof API_TAG_OPERATIONS_VISITS
        > = [
          { type: API_TAG_OPERATIONS_VISITS, id },
          API_TAG_OPERATIONS_VISITS,
        ];
        if (patientId) {
          tags.push({
            type: API_TAG_OPERATIONS_VISITS,
            id: `patient-active-${patientId}`,
          });
        }
        return tags;
      },
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

    getDoctorQueue: builder.query<
      DoctorQueueResponse,
      { employeeId: string; date?: string }
    >({
      query: ({ employeeId, date }) => {
        const params = new URLSearchParams();
        if (date) params.append("date", date);
        const queryString = params.toString();
        return `/api/v1/visits/doctor/${employeeId}/queue${queryString ? `?${queryString}` : ""}`;
      },
      providesTags: (result, error, { employeeId }) => [
        { type: API_TAG_OPERATIONS_VISITS, id: `doctor-queue-${employeeId}` },
      ],
    }),

    // Get active visit for patient
    getPatientActiveVisit: builder.query<
      ActiveVisitResponseDto | null,
      { patientId: string }
    >({
      query: ({ patientId }) => ({
        url: "/api/v1/visits/patient/active",
        method: "GET",
        params: { patientId },
      }),
      providesTags: (result, error, { patientId }) => [
        { type: API_TAG_OPERATIONS_VISITS, id: `patient-active-${patientId}` },
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
  useGetDoctorQueueQuery,
  useGetPatientActiveVisitQuery,
} = visitApi;
