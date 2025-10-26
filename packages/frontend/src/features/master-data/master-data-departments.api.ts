import { rootApi } from "@/store/api/root.api";
import {
  Department,
  CreateDepartmentRequest,
  UpdateDepartmentRequest,
  MasterDataPaginatedResponse,
  MasterDataQueryParams,
} from "@/features/master-data/master-data.types";
import { API_TAG_OPERATIONS_DEPARTMENTS } from "@/constants/api-tags.constants";

export const departmentsApi = rootApi.injectEndpoints({
  overrideExisting: false,
  endpoints: (builder) => ({
    // Get all departments with pagination
    getDepartments: builder.query<
      MasterDataPaginatedResponse<Department>,
      MasterDataQueryParams
    >({
      query: (params) => ({
        url: "/api/v1/master-data/departments",
        method: "GET",
        params,
      }),
      providesTags: [API_TAG_OPERATIONS_DEPARTMENTS],
    }),

    // Get department by ID
    getDepartment: builder.query<Department, string>({
      query: (id) => ({
        url: `/api/v1/master-data/departments/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [
        { type: API_TAG_OPERATIONS_DEPARTMENTS, id },
      ],
    }),

    // Create new department
    createDepartment: builder.mutation<Department, CreateDepartmentRequest>({
      query: (data) => ({
        url: "/api/v1/master-data/departments",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [API_TAG_OPERATIONS_DEPARTMENTS],
    }),

    // Update department
    updateDepartment: builder.mutation<
      Department,
      { id: string; data: UpdateDepartmentRequest }
    >({
      query: ({ id, data }) => ({
        url: `/api/v1/master-data/departments/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: API_TAG_OPERATIONS_DEPARTMENTS, id },
        API_TAG_OPERATIONS_DEPARTMENTS,
      ],
    }),

    // Delete department
    deleteDepartment: builder.mutation<void, string>({
      query: (id) => ({
        url: `/api/v1/master-data/departments/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: API_TAG_OPERATIONS_DEPARTMENTS, id },
        API_TAG_OPERATIONS_DEPARTMENTS,
      ],
    }),

    // Toggle department status
    toggleDepartmentStatus: builder.mutation<Department, string>({
      query: (id) => ({
        url: `/api/v1/master-data/departments/${id}/toggle-status`,
        method: "PATCH",
      }),
      invalidatesTags: (result, error, id) => [
        { type: API_TAG_OPERATIONS_DEPARTMENTS, id },
        API_TAG_OPERATIONS_DEPARTMENTS,
      ],
    }),
  }),
});

export const {
  useGetDepartmentsQuery,
  useGetDepartmentQuery,
  useCreateDepartmentMutation,
  useUpdateDepartmentMutation,
  useDeleteDepartmentMutation,
  useToggleDepartmentStatusMutation,
} = departmentsApi;
