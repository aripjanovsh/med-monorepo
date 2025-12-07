import { rootApi } from "@/store/api/root.api";
import type { PaginatedResponseDto } from "@/types/api.types";
import { API_TAG_OPERATIONS_EMPLOYEE_AVAILABILITY } from "@/constants/api-tags.constants";
import type {
  EmployeeAvailabilityDto,
  CreateEmployeeAvailabilityRequestDto,
  UpdateEmployeeAvailabilityRequestDto,
  EmployeeAvailabilityQueryDto,
} from "./employee-availability.dto";

export const employeeAvailabilityApi = rootApi.injectEndpoints({
  overrideExisting: false,
  endpoints: (builder) => ({
    getEmployeeAvailabilities: builder.query<
      PaginatedResponseDto<EmployeeAvailabilityDto>,
      EmployeeAvailabilityQueryDto
    >({
      query: (params) => ({
        url: "/api/v1/employee-availability",
        method: "GET",
        params,
      }),
      providesTags: [API_TAG_OPERATIONS_EMPLOYEE_AVAILABILITY],
    }),

    getEmployeeAvailability: builder.query<EmployeeAvailabilityDto, string>({
      query: (id) => ({
        url: `/api/v1/employee-availability/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [
        { type: API_TAG_OPERATIONS_EMPLOYEE_AVAILABILITY, id },
      ],
    }),

    createEmployeeAvailability: builder.mutation<
      EmployeeAvailabilityDto,
      CreateEmployeeAvailabilityRequestDto
    >({
      query: (data) => ({
        url: "/api/v1/employee-availability",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [API_TAG_OPERATIONS_EMPLOYEE_AVAILABILITY],
    }),

    updateEmployeeAvailability: builder.mutation<
      EmployeeAvailabilityDto,
      { id: string; data: UpdateEmployeeAvailabilityRequestDto }
    >({
      query: ({ id, data }) => ({
        url: `/api/v1/employee-availability/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: API_TAG_OPERATIONS_EMPLOYEE_AVAILABILITY, id },
        API_TAG_OPERATIONS_EMPLOYEE_AVAILABILITY,
      ],
    }),

    deleteEmployeeAvailability: builder.mutation<void, string>({
      query: (id) => ({
        url: `/api/v1/employee-availability/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: API_TAG_OPERATIONS_EMPLOYEE_AVAILABILITY, id },
        API_TAG_OPERATIONS_EMPLOYEE_AVAILABILITY,
      ],
    }),
  }),
});

export const {
  useGetEmployeeAvailabilitiesQuery,
  useGetEmployeeAvailabilityQuery,
  useCreateEmployeeAvailabilityMutation,
  useUpdateEmployeeAvailabilityMutation,
  useDeleteEmployeeAvailabilityMutation,
} = employeeAvailabilityApi;
