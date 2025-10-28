import { rootApi } from '@/store/api/root.api';
import type { PatientAllergy, CreatePatientAllergyRequest, UpdatePatientAllergyRequest } from './patient-allergy.model';
import type { PaginatedResponseDto } from '@/types/api.types';

type PaginationParams = {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
};

type FindAllParams = PaginationParams & {
  patientId?: string;
  visitId?: string;
};

export const patientAllergyApi = rootApi.injectEndpoints({
  endpoints: (builder) => ({
    createPatientAllergy: builder.mutation<PatientAllergy, CreatePatientAllergyRequest>({
      query: (data) => ({
        url: '/api/v1/patient-allergies',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['PatientAllergy'],
    }),

    getPatientAllergies: builder.query<PaginatedResponseDto<PatientAllergy>, FindAllParams>({
      query: (params) => ({
        url: '/api/v1/patient-allergies',
        params,
      }),
      providesTags: ['PatientAllergy'],
    }),

    getPatientAllergy: builder.query<PatientAllergy, string>({
      query: (id) => `/api/v1/patient-allergies/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'PatientAllergy', id }],
    }),

    updatePatientAllergy: builder.mutation<PatientAllergy, { id: string; data: UpdatePatientAllergyRequest }>({
      query: ({ id, data }) => ({
        url: `/api/v1/patient-allergies/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'PatientAllergy', id }, 'PatientAllergy'],
    }),

    deletePatientAllergy: builder.mutation<void, string>({
      query: (id) => ({
        url: `/api/v1/patient-allergies/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['PatientAllergy'],
    }),
  }),
});

export const {
  useCreatePatientAllergyMutation,
  useGetPatientAllergiesQuery,
  useGetPatientAllergyQuery,
  useUpdatePatientAllergyMutation,
  useDeletePatientAllergyMutation,
} = patientAllergyApi;
