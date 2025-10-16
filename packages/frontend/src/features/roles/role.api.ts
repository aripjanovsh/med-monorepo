import {
  Role,
  Permission,
  CreateRoleDto,
  UpdateRoleDto,
  AssignRoleDto,
  CreatePermissionDto,
  PaginatedResponse,
  RoleFilters,
  PermissionFilters,
  GroupedPermissions,
} from "@/features/roles/role.types";
import { rootApi } from "@/store/api/root.api";
import {
  API_TAG_OPERATIONS_ROLES,
  API_TAG_OPERATIONS_PERMISSIONS,
} from "@/constants/api-tags.constants";

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

    assignPermissions: builder.mutation<
      void,
      { roleId: string; permissionIds: string[] }
    >({
      query: ({ roleId, permissionIds }) => ({
        url: `/api/v1/roles/${roleId}/permissions`,
        method: "POST",
        body: { permissionIds },
      }),
      invalidatesTags: [API_TAG_OPERATIONS_ROLES],
    }),

    removePermissions: builder.mutation<
      void,
      { roleId: string; permissionIds: string[] }
    >({
      query: ({ roleId, permissionIds }) => ({
        url: `/api/v1/roles/${roleId}/permissions`,
        method: "DELETE",
        body: { permissionIds },
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

    getUserPermissions: builder.query<Permission[], string>({
      query: (userId) => `/api/v1/roles/users/${userId}/permissions`,
      providesTags: [API_TAG_OPERATIONS_PERMISSIONS],
    }),

    checkUserPermission: builder.query<
      { hasPermission: boolean },
      { userId: string; resource: string; action: string }
    >({
      query: ({ userId, resource, action }) =>
        `/api/v1/roles/users/${userId}/check/${resource}/${action}`,
    }),

    // Permissions endpoints
    getPermissions: builder.query<
      PaginatedResponse<Permission>,
      PermissionFilters
    >({
      query: (params) => ({
        url: "/api/v1/permissions",
        params,
      }),
      providesTags: [API_TAG_OPERATIONS_PERMISSIONS],
    }),

    getPermission: builder.query<Permission, string>({
      query: (id) => `/api/v1/permissions/${id}`,
      providesTags: [API_TAG_OPERATIONS_PERMISSIONS],
    }),

    createPermission: builder.mutation<Permission, CreatePermissionDto>({
      query: (body) => ({
        url: "/api/v1/permissions",
        method: "POST",
        body,
      }),
      invalidatesTags: [API_TAG_OPERATIONS_PERMISSIONS],
    }),

    updatePermission: builder.mutation<
      Permission,
      { id: string; data: Partial<CreatePermissionDto> }
    >({
      query: ({ id, data }) => ({
        url: `/api/v1/permissions/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: [API_TAG_OPERATIONS_PERMISSIONS],
    }),

    deletePermission: builder.mutation<void, string>({
      query: (id) => ({
        url: `/api/v1/permissions/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [API_TAG_OPERATIONS_PERMISSIONS],
    }),

    getResources: builder.query<string[], void>({
      query: () => "/api/v1/permissions/resources",
    }),

    getGroupedPermissions: builder.query<GroupedPermissions, void>({
      query: () => "/api/v1/permissions/grouped",
      providesTags: [API_TAG_OPERATIONS_PERMISSIONS],
    }),

    seedDefaultPermissions: builder.query<void, void>({
      query: () => "/api/v1/permissions/seed",
    }),
  }),
});

export const {
  // Roles
  useGetRolesQuery,
  useGetRoleQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
  useAssignPermissionsMutation,
  useRemovePermissionsMutation,
  useAssignRoleMutation,
  useRemoveUserRoleMutation,
  useGetUserRolesQuery,
  useGetUserPermissionsQuery,
  useCheckUserPermissionQuery,

  // Permissions
  useGetPermissionsQuery,
  useGetPermissionQuery,
  useCreatePermissionMutation,
  useUpdatePermissionMutation,
  useDeletePermissionMutation,
  useGetResourcesQuery,
  useGetGroupedPermissionsQuery,
  useSeedDefaultPermissionsQuery,
} = roleApi;
