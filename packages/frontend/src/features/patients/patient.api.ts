import { rootApi } from "@/store/api/root.api";
import {
  API_TAG_OPERATIONS_PATIENTS,
  API_TAG_OPERATIONS_PATIENT_STATS,
} from "@/constants/api-tags.constants";

import type {
  CreatePatientRequestDto,
  PatientResponseDto,
  UpdatePatientRequestDto,
  UpdatePatientStatusRequestDto,
  PatientsListResponseDto,
  PatientStatsDto,
  PatientsQueryParamsDto,
  PatientByIdQueryDto,
} from "./patient.dto";

export const patientApi = rootApi.injectEndpoints({
  overrideExisting: false,
  endpoints: (builder) => ({
    // Get all patients with pagination
    getPatients: builder.query<PatientsListResponseDto, PatientsQueryParamsDto>(
      {
        query: (params) => ({
          url: "/api/v1/patients",
          method: "GET",
          params, // DTO matches domain params
        }),
        providesTags: [API_TAG_OPERATIONS_PATIENTS],
      }
    ),

    // Get patient by ID
    getPatient: builder.query<
      PatientResponseDto,
      { id: string; params?: PatientByIdQueryDto }
    >({
      query: ({ id, params }) => ({
        url: `/api/v1/patients/${id}`,
        method: "GET",
        params,
      }),
      providesTags: (result, error, { id }) => [
        { type: API_TAG_OPERATIONS_PATIENTS, id },
      ],
    }),

    // Get patient statistics
    getPatientStats: builder.query<PatientStatsDto, PatientsQueryParamsDto>({
      query: (params) => ({
        url: "/api/v1/patients/stats",
        method: "GET",
        params,
      }),
      providesTags: [API_TAG_OPERATIONS_PATIENT_STATS],
    }),

    // Create new patient
    createPatient: builder.mutation<
      PatientResponseDto,
      CreatePatientRequestDto
    >({
      query: (data) => ({
        url: "/api/v1/patients",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [
        API_TAG_OPERATIONS_PATIENTS,
        API_TAG_OPERATIONS_PATIENT_STATS,
      ],
    }),

    // Update patient
    updatePatient: builder.mutation<
      PatientResponseDto,
      UpdatePatientRequestDto
    >({
      query: (data) => ({
        url: `/api/v1/patients/${data.id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: API_TAG_OPERATIONS_PATIENTS, id },
        API_TAG_OPERATIONS_PATIENTS,
        API_TAG_OPERATIONS_PATIENT_STATS,
      ],
    }),

    // Update patient status
    updatePatientStatus: builder.mutation<
      PatientResponseDto,
      { id: string; data: UpdatePatientStatusRequestDto }
    >({
      query: ({ id, data }) => ({
        url: `/api/v1/patients/${id}/status`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: API_TAG_OPERATIONS_PATIENTS, id },
        API_TAG_OPERATIONS_PATIENTS,
        API_TAG_OPERATIONS_PATIENT_STATS,
      ],
    }),

    // Delete patient
    deletePatient: builder.mutation<
      { message: string },
      { id: string; params?: PatientByIdQueryDto }
    >({
      query: ({ id, params }) => ({
        url: `/api/v1/patients/${id}`,
        method: "DELETE",
        params,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: API_TAG_OPERATIONS_PATIENTS, id },
        API_TAG_OPERATIONS_PATIENTS,
        API_TAG_OPERATIONS_PATIENT_STATS,
      ],
    }),
  }),
});

export const {
  useGetPatientsQuery,
  useGetPatientQuery,
  useGetPatientStatsQuery,
  useCreatePatientMutation,
  useUpdatePatientMutation,
  useUpdatePatientStatusMutation,
  useDeletePatientMutation,
} = patientApi;
