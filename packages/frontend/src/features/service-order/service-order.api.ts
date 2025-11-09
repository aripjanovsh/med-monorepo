import { rootApi } from "@/store/api/root.api";
import { API_TAG_OPERATIONS_SERVICE_ORDERS } from "@/constants/api-tags.constants";
import { API_ENDPOINT } from "@/constants/app.constants";
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

/**
 * Download service order results as PDF
 * @param orderId - Service order ID
 * @param token - JWT token for authorization
 * @returns Promise that resolves when download starts
 */
export const downloadServiceOrderPdf = async (
  orderId: string,
  token: string
): Promise<void> => {
  const response = await fetch(
    `${API_ENDPOINT}/api/v1/service-orders/${orderId}/download-pdf`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to download PDF");
  }

  // Get filename from Content-Disposition header or use default
  const contentDisposition = response.headers.get("Content-Disposition");
  const filename = contentDisposition
    ? contentDisposition.split("filename=")[1]?.replace(/"/g, "")
    : `service-order-${orderId}.pdf`;

  // Create blob from response
  const blob = await response.blob();

  // Create download link and trigger download
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();

  // Cleanup
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};
