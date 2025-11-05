import { rootApi } from "@/store/api/root.api";
import type { DepartmentQueueResponse } from "../types/department-queue";

export const departmentQueueApi = rootApi.injectEndpoints({
  endpoints: (builder) => ({
    getDepartmentQueue: builder.query<
      DepartmentQueueResponse,
      { departmentId: string; organizationId: string }
    >({
      query: ({ departmentId, organizationId }) => ({
        url: `/api/v1/service-orders/department/${departmentId}/queue`,
        params: { organizationId },
      }),
      providesTags: (result, error, { departmentId }) => [
        { type: "ServiceOrder", id: `dept-queue-${departmentId}` },
      ],
    }),

    startService: builder.mutation<
      { message: string },
      { serviceOrderId: string; organizationId: string; performedById?: string }
    >({
      query: ({ serviceOrderId, organizationId, performedById }) => ({
        url: `/api/v1/service-orders/${serviceOrderId}/start`,
        method: "POST",
        body: { organizationId, performedById },
      }),
      invalidatesTags: (result, error, { serviceOrderId }) => [
        { type: "ServiceOrder", id: serviceOrderId },
        { type: "ServiceOrder", id: "dept-queue" },
      ],
    }),

    completeService: builder.mutation<
      { message: string },
      {
        serviceOrderId: string;
        organizationId: string;
        resultText?: string;
        resultData?: any;
        resultFileUrl?: string;
      }
    >({
      query: ({
        serviceOrderId,
        organizationId,
        resultText,
        resultData,
        resultFileUrl,
      }) => ({
        url: `/api/v1/service-orders/${serviceOrderId}/complete`,
        method: "POST",
        body: { organizationId, resultText, resultData, resultFileUrl },
      }),
      invalidatesTags: (result, error, { serviceOrderId }) => [
        { type: "ServiceOrder", id: serviceOrderId },
        { type: "ServiceOrder", id: "dept-queue" },
      ],
    }),

    skipPatient: builder.mutation<
      { message: string },
      { serviceOrderId: string; organizationId: string }
    >({
      query: ({ serviceOrderId, organizationId }) => ({
        url: `/api/v1/service-orders/${serviceOrderId}/skip`,
        method: "POST",
        body: { organizationId },
      }),
      invalidatesTags: (result, error, { serviceOrderId }) => [
        { type: "ServiceOrder", id: serviceOrderId },
        { type: "ServiceOrder", id: "dept-queue" },
      ],
    }),

    returnToQueue: builder.mutation<
      { message: string },
      { serviceOrderId: string; organizationId: string }
    >({
      query: ({ serviceOrderId, organizationId }) => ({
        url: `/api/v1/service-orders/${serviceOrderId}/return-to-queue`,
        method: "POST",
        body: { organizationId },
      }),
      invalidatesTags: (result, error, { serviceOrderId }) => [
        { type: "ServiceOrder", id: serviceOrderId },
        { type: "ServiceOrder", id: "dept-queue" },
      ],
    }),
  }),
});

export const {
  useGetDepartmentQueueQuery,
  useStartServiceMutation,
  useCompleteServiceMutation,
  useSkipPatientMutation,
  useReturnToQueueMutation,
} = departmentQueueApi;
