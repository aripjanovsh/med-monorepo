import { rootApi } from "@/store/api/root.api";
import {
  API_TAG_OPERATIONS_EMPLOYEES,
  API_TAG_OPERATIONS_EMPLOYEE_STATS,
} from "@/constants/api-tags.constants";

import {
  CreateEmployeeRequestDto,
  EmployeeResponseDto,
  UpdateEmployeeRequestDto,
  UpdateEmployeeStatusRequestDto,
  EmployeesListResponseDto,
  EmployeeStatsDto,
  EmployeesQueryParamsDto,
} from "./employee.dto";

export const employeeApi = rootApi.injectEndpoints({
  overrideExisting: false,
  endpoints: (builder) => ({
    // Get all employees with pagination
    getEmployees: builder.query<
      EmployeesListResponseDto,
      EmployeesQueryParamsDto
    >({
      query: (params) => ({
        url: "/api/v1/employees",
        method: "GET",
        params, // DTO matches domain params
      }),
      providesTags: [API_TAG_OPERATIONS_EMPLOYEES],
    }),

    // Get employee by ID
    getEmployee: builder.query<EmployeeResponseDto, string>({
      query: (id) => ({
        url: `/api/v1/employees/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [
        { type: API_TAG_OPERATIONS_EMPLOYEES, id },
      ],
    }),

    // Get employee statistics
    getEmployeeStats: builder.query<EmployeeStatsDto, EmployeesQueryParamsDto>({
      query: (params) => ({
        url: "/api/v1/employees/stats",
        method: "GET",
        params,
      }),
      providesTags: [API_TAG_OPERATIONS_EMPLOYEE_STATS],
    }),

    // Create new employee
    createEmployee: builder.mutation<
      EmployeeResponseDto,
      CreateEmployeeRequestDto
    >({
      query: (data) => ({
        url: "/api/v1/employees",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [
        API_TAG_OPERATIONS_EMPLOYEES,
        API_TAG_OPERATIONS_EMPLOYEE_STATS,
      ],
    }),

    // Update employee
    updateEmployee: builder.mutation<
      EmployeeResponseDto,
      UpdateEmployeeRequestDto
    >({
      query: (data) => ({
        url: `/api/v1/employees/${data.id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: API_TAG_OPERATIONS_EMPLOYEES, id },
        API_TAG_OPERATIONS_EMPLOYEES,
        API_TAG_OPERATIONS_EMPLOYEE_STATS,
      ],
    }),

    // Update employee status
    updateEmployeeStatus: builder.mutation<
      EmployeeResponseDto,
      { id: string; data: UpdateEmployeeStatusRequestDto }
    >({
      query: ({ id, data }) => ({
        url: `/api/v1/employees/${id}/status`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: API_TAG_OPERATIONS_EMPLOYEES, id },
        API_TAG_OPERATIONS_EMPLOYEES,
        API_TAG_OPERATIONS_EMPLOYEE_STATS,
      ],
    }),

    // Delete employee
    deleteEmployee: builder.mutation<void, string>({
      query: (id) => ({
        url: `/api/v1/employees/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: API_TAG_OPERATIONS_EMPLOYEES, id },
        API_TAG_OPERATIONS_EMPLOYEES,
        API_TAG_OPERATIONS_EMPLOYEE_STATS,
      ],
    }),
  }),
});

export const {
  useGetEmployeesQuery,
  useGetEmployeeQuery,
  useGetEmployeeStatsQuery,
  useCreateEmployeeMutation,
  useUpdateEmployeeMutation,
  useUpdateEmployeeStatusMutation,
  useDeleteEmployeeMutation,
} = employeeApi;
