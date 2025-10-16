import { rootApi } from "@/store/api/root.api";
import {
  ServiceType,
  CreateServiceTypeRequest,
  UpdateServiceTypeRequest,
  MasterDataPaginatedResponse,
  MasterDataQueryParams,
} from "@/features/master-data/master-data.types";
import { API_TAG_OPERATIONS_SERVICE_TYPES } from "@/constants/api-tags.constants";

export const serviceTypesApi = rootApi.injectEndpoints({
  overrideExisting: false,
  endpoints: (builder) => ({
    // Get all service types with pagination
    getServiceTypes: builder.query<
      MasterDataPaginatedResponse<ServiceType>,
      MasterDataQueryParams
    >({
      query: (params) => ({
        url: "/api/v1/master-data/service-types",
        method: "GET",
        params,
      }),
      providesTags: [API_TAG_OPERATIONS_SERVICE_TYPES],
    }),

    // Get service type by ID
    getServiceType: builder.query<ServiceType, string>({
      query: (id) => ({
        url: `/api/v1/master-data/service-types/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [
        { type: API_TAG_OPERATIONS_SERVICE_TYPES, id },
      ],
    }),

    // Create new service type
    createServiceType: builder.mutation<ServiceType, CreateServiceTypeRequest>({
      query: (data) => ({
        url: "/api/v1/master-data/service-types",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [API_TAG_OPERATIONS_SERVICE_TYPES],
    }),

    // Update service type
    updateServiceType: builder.mutation<
      ServiceType,
      { id: string; data: UpdateServiceTypeRequest }
    >({
      query: ({ id, data }) => ({
        url: `/api/v1/master-data/service-types/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: API_TAG_OPERATIONS_SERVICE_TYPES, id },
        API_TAG_OPERATIONS_SERVICE_TYPES,
      ],
    }),

    // Delete service type
    deleteServiceType: builder.mutation<void, string>({
      query: (id) => ({
        url: `/api/v1/master-data/service-types/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: API_TAG_OPERATIONS_SERVICE_TYPES, id },
        API_TAG_OPERATIONS_SERVICE_TYPES,
      ],
    }),
  }),
});

export const {
  useGetServiceTypesQuery,
  useGetServiceTypeQuery,
  useCreateServiceTypeMutation,
  useUpdateServiceTypeMutation,
  useDeleteServiceTypeMutation,
} = serviceTypesApi;
