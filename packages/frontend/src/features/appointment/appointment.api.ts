import { rootApi } from "@/store/api/root.api";
import { API_TAG_OPERATIONS_APPOINTMENTS } from "@/constants/api-tags.constants";
import type {
  CreateAppointmentRequestDto,
  UpdateAppointmentRequestDto,
  UpdateAppointmentStatusRequestDto,
  AppointmentResponseDto,
  AppointmentsListResponseDto,
  AppointmentsQueryParamsDto,
} from "./appointment.dto";

export const appointmentApi = rootApi.injectEndpoints({
  overrideExisting: false,
  endpoints: (builder) => ({
    getAppointments: builder.query<
      AppointmentsListResponseDto,
      AppointmentsQueryParamsDto
    >({
      query: (params) => ({
        url: "/api/v1/appointments",
        method: "GET",
        params,
      }),
      providesTags: [API_TAG_OPERATIONS_APPOINTMENTS],
    }),

    getAppointment: builder.query<AppointmentResponseDto, string>({
      query: (id) => ({
        url: `/api/v1/appointments/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [
        { type: API_TAG_OPERATIONS_APPOINTMENTS, id },
      ],
    }),

    createAppointment: builder.mutation<
      AppointmentResponseDto,
      CreateAppointmentRequestDto
    >({
      query: (data) => ({
        url: "/api/v1/appointments",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [API_TAG_OPERATIONS_APPOINTMENTS],
    }),

    updateAppointment: builder.mutation<
      AppointmentResponseDto,
      UpdateAppointmentRequestDto
    >({
      query: ({ id, ...data }) => ({
        url: `/api/v1/appointments/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: API_TAG_OPERATIONS_APPOINTMENTS, id },
        API_TAG_OPERATIONS_APPOINTMENTS,
      ],
    }),

    updateAppointmentStatus: builder.mutation<
      AppointmentResponseDto,
      { id: string } & UpdateAppointmentStatusRequestDto
    >({
      query: ({ id, ...data }) => ({
        url: `/api/v1/appointments/${id}/status`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: API_TAG_OPERATIONS_APPOINTMENTS, id },
        API_TAG_OPERATIONS_APPOINTMENTS,
      ],
    }),

    confirmAppointment: builder.mutation<AppointmentResponseDto, string>({
      query: (id) => ({
        url: `/api/v1/appointments/${id}/confirm`,
        method: "POST",
      }),
      invalidatesTags: (result, error, id) => [
        { type: API_TAG_OPERATIONS_APPOINTMENTS, id },
        API_TAG_OPERATIONS_APPOINTMENTS,
      ],
    }),

    checkInAppointment: builder.mutation<AppointmentResponseDto, string>({
      query: (id) => ({
        url: `/api/v1/appointments/${id}/check-in`,
        method: "POST",
      }),
      invalidatesTags: (result, error, id) => [
        { type: API_TAG_OPERATIONS_APPOINTMENTS, id },
        API_TAG_OPERATIONS_APPOINTMENTS,
      ],
    }),

    cancelAppointment: builder.mutation<
      AppointmentResponseDto,
      { id: string; cancelReason: string }
    >({
      query: ({ id, cancelReason }) => ({
        url: `/api/v1/appointments/${id}/cancel`,
        method: "POST",
        body: { cancelReason },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: API_TAG_OPERATIONS_APPOINTMENTS, id },
        API_TAG_OPERATIONS_APPOINTMENTS,
      ],
    }),

    markAppointmentNoShow: builder.mutation<AppointmentResponseDto, string>({
      query: (id) => ({
        url: `/api/v1/appointments/${id}/no-show`,
        method: "POST",
      }),
      invalidatesTags: (result, error, id) => [
        { type: API_TAG_OPERATIONS_APPOINTMENTS, id },
        API_TAG_OPERATIONS_APPOINTMENTS,
      ],
    }),

    deleteAppointment: builder.mutation<void, string>({
      query: (id) => ({
        url: `/api/v1/appointments/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: API_TAG_OPERATIONS_APPOINTMENTS, id },
        API_TAG_OPERATIONS_APPOINTMENTS,
      ],
    }),
  }),
});

export const {
  useGetAppointmentsQuery,
  useGetAppointmentQuery,
  useCreateAppointmentMutation,
  useUpdateAppointmentMutation,
  useUpdateAppointmentStatusMutation,
  useConfirmAppointmentMutation,
  useCheckInAppointmentMutation,
  useCancelAppointmentMutation,
  useMarkAppointmentNoShowMutation,
  useDeleteAppointmentMutation,
} = appointmentApi;
