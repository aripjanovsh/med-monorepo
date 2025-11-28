import {
  Role,
  CreateRoleDto,
  UpdateRoleDto,
  AssignRoleDto,
  PaginatedResponse,
  RoleFilters,
  AvailablePermission,
  DefaultRoleConfig,
} from "@/features/roles/role.types";
import { rootApi } from "@/store/api/root.api";
import { API_TAG_OPERATIONS_ROLES } from "@/constants/api-tags.constants";

export const roleApi = rootApi.injectEndpoints({
  endpoints: (builder) => ({
    // Roles endpoints
    getRoles: builder.query<PaginatedResponse<Role>, RoleFilters>({
      query: (params) => ({
        url: "api/v1/roles",
        params,
      }),
      providesTags: [API_TAG_OPERATIONS_ROLES],
    }),

    getRole: builder.query<Role, string>({
      query: (id) => `/api/v1/roles/${id}`,
      providesTags: [API_TAG_OPERATIONS_ROLES],
    }),

    createRole: builder.mutation<Role, CreateRoleDto>({
      query: (body) => ({
        url: "/api/v1/roles",
        method: "POST",
        body,
      }),
      invalidatesTags: [API_TAG_OPERATIONS_ROLES],
    }),

    updateRole: builder.mutation<Role, { id: string; data: UpdateRoleDto }>({
      query: ({ id, data }) => ({
        url: `/api/v1/roles/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: [API_TAG_OPERATIONS_ROLES],
    }),

    deleteRole: builder.mutation<void, string>({
      query: (id) => ({
        url: `/api/v1/roles/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [API_TAG_OPERATIONS_ROLES],
    }),

    assignRole: builder.mutation<void, AssignRoleDto>({
      query: (body) => ({
        url: "/api/v1/roles/assign",
        method: "POST",
        body,
      }),
      invalidatesTags: [API_TAG_OPERATIONS_ROLES],
    }),

    removeUserRole: builder.mutation<void, { userId: string; roleId: string }>({
      query: ({ userId, roleId }) => ({
        url: `/api/v1/roles/users/${userId}/roles/${roleId}`,
        method: "DELETE",
      }),
      invalidatesTags: [API_TAG_OPERATIONS_ROLES],
    }),

    getUserRoles: builder.query<Role[], string>({
      query: (userId) => `/api/v1/roles/users/${userId}/roles`,
      providesTags: [API_TAG_OPERATIONS_ROLES],
    }),

    getUserPermissions: builder.query<string[], string>({
      query: (userId) => `/api/v1/roles/users/${userId}/permissions`,
    }),

    // Permissions endpoints
    getAvailablePermissions: builder.query<AvailablePermission[], void>({
      query: () => "/api/v1/permissions/available",
    }),

    getDefaultRoles: builder.query<DefaultRoleConfig[], void>({
      query: () => "/api/v1/permissions/default-roles",
    }),

    seedDefaultRoles: builder.mutation<void, void>({
      query: () => ({
        url: "/api/v1/permissions/seed-roles",
        method: "POST",
      }),
      invalidatesTags: [API_TAG_OPERATIONS_ROLES],
    }),
  }),
});

export const {
  useGetRolesQuery,
  useGetRoleQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
  useAssignRoleMutation,
  useRemoveUserRoleMutation,
  useGetUserRolesQuery,
  useGetUserPermissionsQuery,
  useGetAvailablePermissionsQuery,
  useGetDefaultRolesQuery,
  useSeedDefaultRolesMutation,
} = roleApi;
