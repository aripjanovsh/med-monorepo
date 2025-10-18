import { rootApi } from "@/store/api/root.api";
import { API_TAG_OPERATIONS_PRESCRIPTIONS } from "@/constants/api-tags.constants";
import type {
  CreatePrescriptionRequestDto,
  UpdatePrescriptionRequestDto,
  PrescriptionResponseDto,
  PrescriptionsListResponseDto,
  PrescriptionsQueryParamsDto,
} from "./prescription.dto";

export const prescriptionApi = rootApi.injectEndpoints({
  overrideExisting: false,
  endpoints: (builder) => ({
    getPrescriptions: builder.query<
      PrescriptionsListResponseDto,
      PrescriptionsQueryParamsDto
    >({
      query: (params) => ({
        url: "/api/v1/prescriptions",
        method: "GET",
        params,
      }),
      providesTags: [API_TAG_OPERATIONS_PRESCRIPTIONS],
    }),

    getPrescription: builder.query<PrescriptionResponseDto, string>({
      query: (id) => ({
        url: `/api/v1/prescriptions/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [
        { type: API_TAG_OPERATIONS_PRESCRIPTIONS, id },
      ],
    }),

    getPrescriptionsByVisit: builder.query<PrescriptionResponseDto[], string>({
      query: (visitId) => ({
        url: `/api/v1/prescriptions/visit/${visitId}`,
        method: "GET",
      }),
      providesTags: (result, error, visitId) => [
        { type: API_TAG_OPERATIONS_PRESCRIPTIONS, id: `visit-${visitId}` },
      ],
    }),

    createPrescription: builder.mutation<
      PrescriptionResponseDto,
      CreatePrescriptionRequestDto
    >({
      query: (data) => ({
        url: "/api/v1/prescriptions",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [API_TAG_OPERATIONS_PRESCRIPTIONS],
    }),

    updatePrescription: builder.mutation<
      PrescriptionResponseDto,
      UpdatePrescriptionRequestDto
    >({
      query: ({ id, ...data }) => ({
        url: `/api/v1/prescriptions/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: API_TAG_OPERATIONS_PRESCRIPTIONS, id },
        API_TAG_OPERATIONS_PRESCRIPTIONS,
      ],
    }),

    deletePrescription: builder.mutation<void, string>({
      query: (id) => ({
        url: `/api/v1/prescriptions/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: API_TAG_OPERATIONS_PRESCRIPTIONS, id },
        API_TAG_OPERATIONS_PRESCRIPTIONS,
      ],
    }),
  }),
});

export const {
  useGetPrescriptionsQuery,
  useGetPrescriptionQuery,
  useGetPrescriptionsByVisitQuery,
  useCreatePrescriptionMutation,
  useUpdatePrescriptionMutation,
  useDeletePrescriptionMutation,
} = prescriptionApi;
