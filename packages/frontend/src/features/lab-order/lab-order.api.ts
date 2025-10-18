import { rootApi } from "@/store/api/root.api";
import { API_TAG_OPERATIONS_LAB_ORDERS } from "@/constants/api-tags.constants";
import type {
  CreateLabOrderRequestDto,
  UpdateLabOrderRequestDto,
  UpdateLabOrderStatusRequestDto,
  LabOrderResponseDto,
  LabOrdersListResponseDto,
  LabOrdersQueryParamsDto,
} from "./lab-order.dto";

export const labOrderApi = rootApi.injectEndpoints({
  overrideExisting: false,
  endpoints: (builder) => ({
    getLabOrders: builder.query<
      LabOrdersListResponseDto,
      LabOrdersQueryParamsDto
    >({
      query: (params) => ({
        url: "/api/v1/lab-orders",
        method: "GET",
        params,
      }),
      providesTags: [API_TAG_OPERATIONS_LAB_ORDERS],
    }),

    getLabOrder: builder.query<LabOrderResponseDto, string>({
      query: (id) => ({
        url: `/api/v1/lab-orders/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [
        { type: API_TAG_OPERATIONS_LAB_ORDERS, id },
      ],
    }),

    getLabOrdersByVisit: builder.query<LabOrderResponseDto[], string>({
      query: (visitId) => ({
        url: `/api/v1/lab-orders/visit/${visitId}`,
        method: "GET",
      }),
      providesTags: (result, error, visitId) => [
        { type: API_TAG_OPERATIONS_LAB_ORDERS, id: `visit-${visitId}` },
      ],
    }),

    createLabOrder: builder.mutation<
      LabOrderResponseDto,
      CreateLabOrderRequestDto
    >({
      query: (data) => ({
        url: "/api/v1/lab-orders",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [API_TAG_OPERATIONS_LAB_ORDERS],
    }),

    updateLabOrder: builder.mutation<
      LabOrderResponseDto,
      UpdateLabOrderRequestDto
    >({
      query: ({ id, ...data }) => ({
        url: `/api/v1/lab-orders/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: API_TAG_OPERATIONS_LAB_ORDERS, id },
        API_TAG_OPERATIONS_LAB_ORDERS,
      ],
    }),

    updateLabOrderStatus: builder.mutation<
      LabOrderResponseDto,
      { id: string } & UpdateLabOrderStatusRequestDto
    >({
      query: ({ id, ...data }) => ({
        url: `/api/v1/lab-orders/${id}/status`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: API_TAG_OPERATIONS_LAB_ORDERS, id },
        API_TAG_OPERATIONS_LAB_ORDERS,
      ],
    }),

    deleteLabOrder: builder.mutation<void, string>({
      query: (id) => ({
        url: `/api/v1/lab-orders/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: API_TAG_OPERATIONS_LAB_ORDERS, id },
        API_TAG_OPERATIONS_LAB_ORDERS,
      ],
    }),
  }),
});

export const {
  useGetLabOrdersQuery,
  useGetLabOrderQuery,
  useGetLabOrdersByVisitQuery,
  useCreateLabOrderMutation,
  useUpdateLabOrderMutation,
  useUpdateLabOrderStatusMutation,
  useDeleteLabOrderMutation,
} = labOrderApi;
