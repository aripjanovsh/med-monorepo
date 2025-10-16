import { rootApi } from "@/store/api/root.api";
import { API_TAGS } from "@/constants/api-tags.constants";
import type {
  Location,
  LocationTreeNode,
  LocationType,
  CreateLocationRequest,
  UpdateLocationRequest,
  LocationQueryParams,
  MasterDataPaginatedResponse,
} from "./master-data.types";

export const locationApi = rootApi.injectEndpoints({
  endpoints: (builder) => ({
    // ================================
    // Locations CRUD
    // ================================
    getLocations: builder.query<
      MasterDataPaginatedResponse<Location>,
      LocationQueryParams
    >({
      query: (params = {}) => ({
        url: "/api/v1/master-data/locations",
        params,
      }),
      providesTags: [API_TAGS.LOCATION],
    }),

    getLocationById: builder.query<
      Location,
      { id: string; includeRelations?: boolean }
    >({
      query: ({ id, includeRelations = true }) => ({
        url: `/api/v1/master-data/locations/${id}`,
        params: { includeRelations },
      }),
      providesTags: (result, error, { id }) => [
        { type: API_TAGS.LOCATION, id },
      ],
    }),

    createLocation: builder.mutation<Location, CreateLocationRequest>({
      query: (data) => ({
        url: "/api/v1/master-data/locations",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [API_TAGS.LOCATION],
    }),

    updateLocation: builder.mutation<
      Location,
      { id: string; data: UpdateLocationRequest }
    >({
      query: ({ id, data }) => ({
        url: `/api/v1/master-data/locations/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: API_TAGS.LOCATION, id },
        API_TAGS.LOCATION,
      ],
    }),

    deleteLocation: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/api/v1/master-data/locations/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [API_TAGS.LOCATION],
    }),

    toggleLocationStatus: builder.mutation<Location, string>({
      query: (id) => ({
        url: `/api/v1/master-data/locations/${id}/toggle-status`,
        method: "PATCH",
      }),
      invalidatesTags: [API_TAGS.LOCATION],
    }),

    // ================================
    // Specialized queries
    // ================================
    getRootLocations: builder.query<Location[], void>({
      query: () => "/api/v1/master-data/locations/by-parent/root",
      providesTags: [API_TAGS.LOCATION],
    }),

    // ================================
    // Location Tree
    // ================================
    getLocationTree: builder.query<LocationTreeNode[], void>({
      query: () => "/api/v1/master-data/locations/tree",
      providesTags: [API_TAGS.LOCATION],
    }),

    // ================================
    // Suggest (Autocomplete)
    // ================================
    suggestLocations: builder.query<
      Location[],
      { q: string; type?: string; limit?: number }
    >({
      query: ({ q, type, limit = 20 }) => ({
        url: "/api/v1/master-data/locations/suggest",
        params: { q, search: q, limit, includeRelations: true, type },
      }),
      providesTags: [API_TAGS.LOCATION],
    }),
  }),
});

export const {
  // Main CRUD operations
  useGetLocationsQuery,
  useGetLocationByIdQuery,
  useLazyGetLocationByIdQuery,
  useCreateLocationMutation,
  useUpdateLocationMutation,
  useDeleteLocationMutation,
  useToggleLocationStatusMutation,

  useGetRootLocationsQuery,

  // Tree
  useGetLocationTreeQuery,
  // Suggest
  useSuggestLocationsQuery,
  useLazySuggestLocationsQuery,
} = locationApi;
