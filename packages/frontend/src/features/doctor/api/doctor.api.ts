import { rootApi } from "@/store/api/root.api";
import type { DoctorQueueResponse } from "../types/doctor-queue";

export const doctorApi = rootApi.injectEndpoints({
  endpoints: (builder) => ({
    getDoctorQueue: builder.query<
      DoctorQueueResponse,
      { employeeId: string; date?: string }
    >({
      query: ({ employeeId, date }) => {
        const params = new URLSearchParams();
        if (date) params.append("date", date);
        const queryString = params.toString();
        return `/api/v1/visits/doctor/${employeeId}/queue${queryString ? `?${queryString}` : ''}`;
      },
      providesTags: (result, error, { employeeId }) => [
        { type: "Visit", id: `doctor-queue-${employeeId}` },
      ],
    }),

    startVisit: builder.mutation<
      void,
      { visitId: string; employeeId: string }
    >({
      query: ({ visitId }) => ({
        url: `/api/v1/visits/${visitId}/start`,
        method: "POST",
        body: {},
      }),
      invalidatesTags: (result, error, { visitId, employeeId }) => [
        { type: "Visit", id: visitId },
        { type: "Visit", id: "LIST" },
        { type: "Visit", id: `doctor-queue-${employeeId}` },
      ],
    }),

    completeVisit: builder.mutation<
      void,
      { visitId: string; employeeId: string; notes?: string }
    >({
      query: ({ visitId, notes }) => ({
        url: `/api/v1/visits/${visitId}/complete`,
        method: "POST",
        body: { notes },
      }),
      invalidatesTags: (result, error, { visitId, employeeId }) => [
        { type: "Visit", id: visitId },
        { type: "Visit", id: "LIST" },
        { type: "Visit", id: `doctor-queue-${employeeId}` },
      ],
    }),
  }),
});

export const {
  useGetDoctorQueueQuery,
  useStartVisitMutation,
  useCompleteVisitMutation,
} = doctorApi;
