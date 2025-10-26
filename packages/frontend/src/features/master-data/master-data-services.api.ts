import { rootApi } from "@/store/api/root.api";
import {
  Service,
  CreateServiceRequest,
  UpdateServiceRequest,
  MasterDataPaginatedResponse,
  ServiceQueryParams,
} from "@/features/master-data/master-data.types";
import { API_TAG_OPERATIONS_SERVICES } from "@/constants/api-tags.constants";

export const servicesApi = rootApi.injectEndpoints({
  overrideExisting: false,
  endpoints: (builder) => ({
    // Get all services with pagination
    getServices: builder.query<
      MasterDataPaginatedResponse<Service>,
      ServiceQueryParams
    >({
      query: (params) => ({
        url: "/api/v1/master-data/services",
        method: "GET",
        params,
      }),
      providesTags: [API_TAG_OPERATIONS_SERVICES],
    }),

    // Get service by ID
    getService: builder.query<Service, string>({
      query: (id) => ({
        url: `/api/v1/master-data/services/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [
        { type: API_TAG_OPERATIONS_SERVICES, id },
      ],
    }),

    // Create new service
    createService: builder.mutation<Service, CreateServiceRequest>({
      query: (data) => ({
        url: "/api/v1/master-data/services",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [API_TAG_OPERATIONS_SERVICES],
    }),

    // Update service
    updateService: builder.mutation<
      Service,
      { id: string; data: UpdateServiceRequest }
    >({
      query: ({ id, data }) => ({
        url: `/api/v1/master-data/services/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: API_TAG_OPERATIONS_SERVICES, id },
        API_TAG_OPERATIONS_SERVICES,
      ],
    }),

    // Delete service
    deleteService: builder.mutation<void, string>({
      query: (id) => ({
        url: `/api/v1/master-data/services/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: API_TAG_OPERATIONS_SERVICES, id },
        API_TAG_OPERATIONS_SERVICES,
      ],
    }),

    // Toggle service status
    toggleServiceStatus: builder.mutation<Service, string>({
      query: (id) => ({
        url: `/api/v1/master-data/services/${id}/toggle-status`,
        method: "PATCH",
      }),
      invalidatesTags: (result, error, id) => [
        { type: API_TAG_OPERATIONS_SERVICES, id },
        API_TAG_OPERATIONS_SERVICES,
      ],
    }),
  }),
});

export const {
  useGetServicesQuery,
  useGetServiceQuery,
  useCreateServiceMutation,
  useUpdateServiceMutation,
  useDeleteServiceMutation,
  useToggleServiceStatusMutation,
} = servicesApi;
