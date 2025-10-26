import { rootApi } from "@/store/api/root.api";
import { API_TAG_OPERATIONS_SERVICE_ORDERS } from "@/constants/api-tags.constants";
import type {
  CreateServiceOrderRequestDto,
  UpdateServiceOrderRequestDto,
  ServiceOrderResponseDto,
  ServiceOrdersListResponseDto,
  ServiceOrderQueryParamsDto,
} from "./service-order.dto";

export const serviceOrderApi = rootApi.injectEndpoints({
  overrideExisting: false,
  endpoints: (builder) => ({
    getServiceOrders: builder.query<ServiceOrdersListResponseDto, ServiceOrderQueryParamsDto>({
      query: (params) => ({
        url: "/api/v1/service-orders",
        method: "GET",
        params,
      }),
      providesTags: [API_TAG_OPERATIONS_SERVICE_ORDERS],
    }),

    getServiceOrder: builder.query<ServiceOrderResponseDto, string>({
      query: (id) => ({
        url: `/api/v1/service-orders/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [
        { type: API_TAG_OPERATIONS_SERVICE_ORDERS, id },
      ],
    }),

    createServiceOrders: builder.mutation<ServiceOrderResponseDto[], CreateServiceOrderRequestDto>({
      query: (data) => ({
        url: "/api/v1/service-orders",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [API_TAG_OPERATIONS_SERVICE_ORDERS],
    }),

    updateServiceOrder: builder.mutation<ServiceOrderResponseDto, UpdateServiceOrderRequestDto>({
      query: ({ id, ...data }) => ({
        url: `/api/v1/service-orders/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: API_TAG_OPERATIONS_SERVICE_ORDERS, id },
        API_TAG_OPERATIONS_SERVICE_ORDERS,
      ],
    }),

    deleteServiceOrder: builder.mutation<void, string>({
      query: (id) => ({
        url: `/api/v1/service-orders/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: API_TAG_OPERATIONS_SERVICE_ORDERS, id },
        API_TAG_OPERATIONS_SERVICE_ORDERS,
      ],
    }),
  }),
});

export const {
  useGetServiceOrdersQuery,
  useGetServiceOrderQuery,
  useCreateServiceOrdersMutation,
  useUpdateServiceOrderMutation,
  useDeleteServiceOrderMutation,
} = serviceOrderApi;
