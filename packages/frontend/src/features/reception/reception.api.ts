import { rootApi } from "@/store/api/root.api";
import type {
  DashboardStatsResponseDto,
  QueueItemResponseDto,
  DoctorScheduleResponseDto,
  QuickCreateVisitRequestDto,
  QuickCreateVisitResponseDto,
  DashboardStatsQueryDto,
  DoctorScheduleQueryDto,
} from "./reception.dto";
import type { QueueDashboard } from "./types/queue-dashboard";
import { RECEPTION_API_TAG } from "./reception.constants";

export const receptionApi = rootApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get dashboard stats
    getDashboardStats: builder.query<
      DashboardStatsResponseDto,
      DashboardStatsQueryDto | void
    >({
      query: (params) => ({
        url: "/api/v1/reception/dashboard/stats",
        params: params || undefined,
      }),
      providesTags: [RECEPTION_API_TAG],
    }),

    // Get waiting queue
    getQueue: builder.query<QueueItemResponseDto[], void>({
      query: () => ({
        url: "/api/v1/reception/dashboard/queue",
      }),
      providesTags: [
        RECEPTION_API_TAG,
        { type: RECEPTION_API_TAG, id: "queue" },
      ],
    }),

    // Get doctor schedules
    getDoctorSchedule: builder.query<
      DoctorScheduleResponseDto[],
      DoctorScheduleQueryDto | void
    >({
      query: (params) => ({
        url: "/api/v1/reception/dashboard/doctors",
        params: params || undefined,
      }),
      providesTags: [
        RECEPTION_API_TAG,
        { type: RECEPTION_API_TAG, id: "doctors" },
      ],
    }),

    // Create visit (walk-in patient)
    createVisit: builder.mutation<
      QuickCreateVisitResponseDto,
      QuickCreateVisitRequestDto
    >({
      query: (data) => ({
        url: "/api/v1/visits",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [
        RECEPTION_API_TAG,
        { type: RECEPTION_API_TAG, id: "queue" },
        { type: RECEPTION_API_TAG, id: "doctors" },
        { type: RECEPTION_API_TAG, id: "queue-board" },
        "Visit",
        "Appointment",
      ],
    }),

    // Get queue dashboard with all active doctors
    getQueueDashboard: builder.query<QueueDashboard, { date?: string } | void>({
      query: (params) => ({
        url: "/api/v1/reception/dashboard/queue-board",
        params: params || undefined,
      }),
      providesTags: [
        RECEPTION_API_TAG,
        { type: RECEPTION_API_TAG, id: "queue-board" },
      ],
    }),
  }),
});

export const {
  useGetDashboardStatsQuery,
  useGetQueueQuery,
  useGetDoctorScheduleQuery,
  useCreateVisitMutation,
  useGetQueueDashboardQuery,
} = receptionApi;
