import { rootApi } from "@/store/api/root.api";
import type {
  LeaveType,
  CreateLeaveTypeRequest,
  UpdateLeaveTypeRequest,
  MasterDataPaginatedResponse,
  MasterDataQueryParams,
} from "@/features/master-data/master-data.types";
import { API_TAG_OPERATIONS_LEAVE_TYPES } from "@/constants/api-tags.constants";

export const leaveTypesApi = rootApi.injectEndpoints({
  overrideExisting: false,
  endpoints: (builder) => ({
    getLeaveTypes: builder.query<
      MasterDataPaginatedResponse<LeaveType>,
      MasterDataQueryParams
    >({
      query: (params) => ({
        url: "/api/v1/master-data/leave-types",
        method: "GET",
        params,
      }),
      providesTags: [API_TAG_OPERATIONS_LEAVE_TYPES],
    }),

    getLeaveType: builder.query<LeaveType, string>({
      query: (id) => ({
        url: `/api/v1/master-data/leave-types/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [
        { type: API_TAG_OPERATIONS_LEAVE_TYPES, id },
      ],
    }),

    createLeaveType: builder.mutation<LeaveType, CreateLeaveTypeRequest>({
      query: (data) => ({
        url: "/api/v1/master-data/leave-types",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [API_TAG_OPERATIONS_LEAVE_TYPES],
    }),

    updateLeaveType: builder.mutation<
      LeaveType,
      { id: string; data: UpdateLeaveTypeRequest }
    >({
      query: ({ id, data }) => ({
        url: `/api/v1/master-data/leave-types/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: API_TAG_OPERATIONS_LEAVE_TYPES, id },
        API_TAG_OPERATIONS_LEAVE_TYPES,
      ],
    }),

    deleteLeaveType: builder.mutation<void, string>({
      query: (id) => ({
        url: `/api/v1/master-data/leave-types/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: API_TAG_OPERATIONS_LEAVE_TYPES, id },
        API_TAG_OPERATIONS_LEAVE_TYPES,
      ],
    }),
  }),
});

export const {
  useGetLeaveTypesQuery,
  useGetLeaveTypeQuery,
  useCreateLeaveTypeMutation,
  useUpdateLeaveTypeMutation,
  useDeleteLeaveTypeMutation,
} = leaveTypesApi;
