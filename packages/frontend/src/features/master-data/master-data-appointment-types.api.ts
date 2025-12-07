import { rootApi } from "@/store/api/root.api";
import {
  AppointmentType,
  CreateAppointmentTypeRequest,
  UpdateAppointmentTypeRequest,
  MasterDataPaginatedResponse,
  MasterDataQueryParams,
} from "@/features/master-data/master-data.types";
import { API_TAG_OPERATIONS_APPOINTMENT_TYPES } from "@/constants/api-tags.constants";

export const appointmentTypesApi = rootApi.injectEndpoints({
  overrideExisting: false,
  endpoints: (builder) => ({
    // Get all appointment types with pagination
    getAppointmentTypes: builder.query<
      MasterDataPaginatedResponse<AppointmentType>,
      MasterDataQueryParams
    >({
      query: (params) => ({
        url: "/api/v1/master-data/appointment-types",
        method: "GET",
        params,
      }),
      providesTags: [API_TAG_OPERATIONS_APPOINTMENT_TYPES],
    }),

    // Get appointment type by ID
    getAppointmentType: builder.query<AppointmentType, string>({
      query: (id) => ({
        url: `/api/v1/master-data/appointment-types/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [
        { type: API_TAG_OPERATIONS_APPOINTMENT_TYPES, id },
      ],
    }),

    // Create new appointment type
    createAppointmentType: builder.mutation<
      AppointmentType,
      CreateAppointmentTypeRequest
    >({
      query: (data) => ({
        url: "/api/v1/master-data/appointment-types",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [API_TAG_OPERATIONS_APPOINTMENT_TYPES],
    }),

    // Update appointment type
    updateAppointmentType: builder.mutation<
      AppointmentType,
      { id: string; data: UpdateAppointmentTypeRequest }
    >({
      query: ({ id, data }) => ({
        url: `/api/v1/master-data/appointment-types/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: API_TAG_OPERATIONS_APPOINTMENT_TYPES, id },
        API_TAG_OPERATIONS_APPOINTMENT_TYPES,
      ],
    }),

    // Delete appointment type
    deleteAppointmentType: builder.mutation<void, string>({
      query: (id) => ({
        url: `/api/v1/master-data/appointment-types/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: API_TAG_OPERATIONS_APPOINTMENT_TYPES, id },
        API_TAG_OPERATIONS_APPOINTMENT_TYPES,
      ],
    }),

    // Toggle appointment type status
    toggleAppointmentTypeStatus: builder.mutation<AppointmentType, string>({
      query: (id) => ({
        url: `/api/v1/master-data/appointment-types/${id}/toggle-status`,
        method: "PATCH",
      }),
      invalidatesTags: (result, error, id) => [
        { type: API_TAG_OPERATIONS_APPOINTMENT_TYPES, id },
        API_TAG_OPERATIONS_APPOINTMENT_TYPES,
      ],
    }),
  }),
});

export const {
  useGetAppointmentTypesQuery,
  useGetAppointmentTypeQuery,
  useCreateAppointmentTypeMutation,
  useUpdateAppointmentTypeMutation,
  useDeleteAppointmentTypeMutation,
  useToggleAppointmentTypeStatusMutation,
} = appointmentTypesApi;
