import { rootApi } from "@/store/api/root.api";
import type {
  PatientParameter,
  CreatePatientParameterRequest,
  UpdatePatientParameterRequest,
} from "./patient-parameter.model";
import type { PaginatedResponseDto } from "@/types/api.types";

type PaginationParams = {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
};

type FindAllParams = PaginationParams & {
  patientId?: string;
  parameterCode?: string;
  visitId?: string;
  from?: string;
  to?: string;
};

export const patientParameterApi = rootApi.injectEndpoints({
  endpoints: (builder) => ({
    createPatientParameter: builder.mutation<
      PatientParameter,
      CreatePatientParameterRequest
    >({
      query: (data) => ({
        url: "/api/v1/patient-parameters",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["PatientParameter"],
    }),

    getPatientParameters: builder.query<
      PaginatedResponseDto<PatientParameter>,
      FindAllParams
    >({
      query: (params) => ({
        url: "/api/v1/patient-parameters",
        params,
      }),
      providesTags: ["PatientParameter"],
    }),

    getLatestPatientParameters: builder.query<PatientParameter[], string>({
      query: (patientId) =>
        `/api/v1/patient-parameters/patient/${patientId}/latest`,
      providesTags: ["PatientParameter"],
    }),

    getPatientParameter: builder.query<PatientParameter, string>({
      query: (id) => `/api/v1/patient-parameters/${id}`,
      providesTags: (_result, _error, id) => [{ type: "PatientParameter", id }],
    }),

    updatePatientParameter: builder.mutation<
      PatientParameter,
      { id: string; data: UpdatePatientParameterRequest }
    >({
      query: ({ id, data }) => ({
        url: `/api/v1/patient-parameters/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "PatientParameter", id },
        "PatientParameter",
      ],
    }),

    deletePatientParameter: builder.mutation<void, string>({
      query: (id) => ({
        url: `/api/v1/patient-parameters/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["PatientParameter"],
    }),
  }),
});

export const {
  useCreatePatientParameterMutation,
  useGetPatientParametersQuery,
  useGetLatestPatientParametersQuery,
  useGetPatientParameterQuery,
  useUpdatePatientParameterMutation,
  useDeletePatientParameterMutation,
} = patientParameterApi;
