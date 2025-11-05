import { rootApi } from "@/store/api/root.api";
import type { DoctorQueueResponse } from "../types/doctor-queue";

export const doctorApi = rootApi.injectEndpoints({
  endpoints: (builder) => ({
    getDoctorQueue: builder.query<
      DoctorQueueResponse,
      { employeeId: string; organizationId: string; date?: string }
    >({
      query: ({ employeeId, organizationId, date }) => {
        const params = new URLSearchParams({ organizationId });
        if (date) params.append("date", date);
        return `/api/v1/visits/doctor/${employeeId}/queue?${params.toString()}`;
      },
      providesTags: (result, error, { employeeId }) => [
        { type: "Visit", id: `doctor-queue-${employeeId}` },
      ],
    }),

    startVisit: builder.mutation<
      void,
      { visitId: string; organizationId: string }
    >({
      query: ({ visitId, organizationId }) => ({
        url: `/api/v1/visits/${visitId}/start`,
        method: "POST",
        body: { organizationId },
      }),
      invalidatesTags: (result, error, { visitId }) => [
        { type: "Visit", id: visitId },
        { type: "Visit", id: "LIST" },
      ],
    }),

    completeVisit: builder.mutation<
      void,
      { visitId: string; organizationId: string; notes?: string }
    >({
      query: ({ visitId, organizationId, notes }) => ({
        url: `/api/v1/visits/${visitId}/complete`,
        method: "POST",
        body: { organizationId, notes },
      }),
      invalidatesTags: (result, error, { visitId }) => [
        { type: "Visit", id: visitId },
        { type: "Visit", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetDoctorQueueQuery,
  useStartVisitMutation,
  useCompleteVisitMutation,
} = doctorApi;
