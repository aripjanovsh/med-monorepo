import { rootApi } from "@/store/api/root.api";
import type { PaginatedResponseDto } from "@/types/api.types";
import { API_TAG_OPERATIONS_EMPLOYEE_LEAVE_DAYS } from "@/constants/api-tags.constants";
import type {
  EmployeeLeaveDaysDto,
  CreateEmployeeLeaveDaysRequestDto,
  UpdateEmployeeLeaveDaysRequestDto,
  EmployeeLeaveDaysQueryDto,
} from "./employee-leave-days.dto";

export const employeeLeaveDaysApi = rootApi.injectEndpoints({
  overrideExisting: false,
  endpoints: (builder) => ({
    getEmployeeLeaveDays: builder.query<
      PaginatedResponseDto<EmployeeLeaveDaysDto>,
      EmployeeLeaveDaysQueryDto
    >({
      query: (params) => ({
        url: "/api/v1/employee-leave-days",
        method: "GET",
        params,
      }),
      providesTags: [API_TAG_OPERATIONS_EMPLOYEE_LEAVE_DAYS],
    }),

    getEmployeeLeaveDaysById: builder.query<EmployeeLeaveDaysDto, string>({
      query: (id) => ({
        url: `/api/v1/employee-leave-days/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [
        { type: API_TAG_OPERATIONS_EMPLOYEE_LEAVE_DAYS, id },
      ],
    }),

    createEmployeeLeaveDays: builder.mutation<
      EmployeeLeaveDaysDto,
      CreateEmployeeLeaveDaysRequestDto
    >({
      query: (data) => ({
        url: "/api/v1/employee-leave-days",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [API_TAG_OPERATIONS_EMPLOYEE_LEAVE_DAYS],
    }),

    updateEmployeeLeaveDays: builder.mutation<
      EmployeeLeaveDaysDto,
      { id: string; data: UpdateEmployeeLeaveDaysRequestDto }
    >({
      query: ({ id, data }) => ({
        url: `/api/v1/employee-leave-days/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: API_TAG_OPERATIONS_EMPLOYEE_LEAVE_DAYS, id },
        API_TAG_OPERATIONS_EMPLOYEE_LEAVE_DAYS,
      ],
    }),

    deleteEmployeeLeaveDays: builder.mutation<void, string>({
      query: (id) => ({
        url: `/api/v1/employee-leave-days/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: API_TAG_OPERATIONS_EMPLOYEE_LEAVE_DAYS, id },
        API_TAG_OPERATIONS_EMPLOYEE_LEAVE_DAYS,
      ],
    }),
  }),
});

export const {
  useGetEmployeeLeaveDaysQuery,
  useGetEmployeeLeaveDaysByIdQuery,
  useCreateEmployeeLeaveDaysMutation,
  useUpdateEmployeeLeaveDaysMutation,
  useDeleteEmployeeLeaveDaysMutation,
} = employeeLeaveDaysApi;
