import { rootApi } from "@/store/api/root.api";
import {
  AppointmentCancelType,
  CreateAppointmentCancelTypeRequest,
  UpdateAppointmentCancelTypeRequest,
  MasterDataPaginatedResponse,
  MasterDataQueryParams,
} from "@/features/master-data/master-data.types";
import { API_TAG_OPERATIONS_APPOINTMENT_CANCEL_TYPES } from "@/constants/api-tags.constants";

export const appointmentCancelTypesApi = rootApi.injectEndpoints({
  overrideExisting: false,
  endpoints: (builder) => ({
    // Get all appointment cancel types with pagination
    getAppointmentCancelTypes: builder.query<
      MasterDataPaginatedResponse<AppointmentCancelType>,
      MasterDataQueryParams
    >({
      query: (params) => ({
        url: "/api/v1/master-data/appointment-cancel-types",
        method: "GET",
        params,
      }),
      providesTags: [API_TAG_OPERATIONS_APPOINTMENT_CANCEL_TYPES],
    }),

    // Get appointment cancel type by ID
    getAppointmentCancelType: builder.query<AppointmentCancelType, string>({
      query: (id) => ({
        url: `/api/v1/master-data/appointment-cancel-types/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [
        { type: API_TAG_OPERATIONS_APPOINTMENT_CANCEL_TYPES, id },
      ],
    }),

    // Create new appointment cancel type
    createAppointmentCancelType: builder.mutation<
      AppointmentCancelType,
      CreateAppointmentCancelTypeRequest
    >({
      query: (data) => ({
        url: "/api/v1/master-data/appointment-cancel-types",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [API_TAG_OPERATIONS_APPOINTMENT_CANCEL_TYPES],
    }),

    // Update appointment cancel type
    updateAppointmentCancelType: builder.mutation<
      AppointmentCancelType,
      { id: string; data: UpdateAppointmentCancelTypeRequest }
    >({
      query: ({ id, data }) => ({
        url: `/api/v1/master-data/appointment-cancel-types/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: API_TAG_OPERATIONS_APPOINTMENT_CANCEL_TYPES, id },
        API_TAG_OPERATIONS_APPOINTMENT_CANCEL_TYPES,
      ],
    }),

    // Delete appointment cancel type
    deleteAppointmentCancelType: builder.mutation<void, string>({
      query: (id) => ({
        url: `/api/v1/master-data/appointment-cancel-types/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: API_TAG_OPERATIONS_APPOINTMENT_CANCEL_TYPES, id },
        API_TAG_OPERATIONS_APPOINTMENT_CANCEL_TYPES,
      ],
    }),

    // Toggle appointment cancel type status
    toggleAppointmentCancelTypeStatus: builder.mutation<
      AppointmentCancelType,
      string
    >({
      query: (id) => ({
        url: `/api/v1/master-data/appointment-cancel-types/${id}/toggle-status`,
        method: "PATCH",
      }),
      invalidatesTags: (result, error, id) => [
        { type: API_TAG_OPERATIONS_APPOINTMENT_CANCEL_TYPES, id },
        API_TAG_OPERATIONS_APPOINTMENT_CANCEL_TYPES,
      ],
    }),
  }),
});

export const {
  useGetAppointmentCancelTypesQuery,
  useGetAppointmentCancelTypeQuery,
  useCreateAppointmentCancelTypeMutation,
  useUpdateAppointmentCancelTypeMutation,
  useDeleteAppointmentCancelTypeMutation,
  useToggleAppointmentCancelTypeStatusMutation,
} = appointmentCancelTypesApi;
