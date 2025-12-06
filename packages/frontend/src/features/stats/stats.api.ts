import { rootApi } from "@/store/api/root.api";
import {
  API_TAG_OPERATIONS_STATS,
  API_TAG_OPERATIONS_EMPLOYEE_STATS,
} from "@/constants/api-tags.constants";
import type {
  StatsQueryDto,
  StatsResponseDto,
  PatientStatsQueryDto,
  PatientStatsResponseDto,
  InvoiceStatsQueryDto,
  InvoiceStatsResponseDto,
  EmployeeQuickStatsQueryDto,
  EmployeeQuickStatsResponseDto,
  EmployeeStatsQueryDto,
  EmployeeStatsResponseDto,
  PatientDashboardStatsQueryDto,
  PatientDashboardStatsResponseDto,
  VisitStatsQueryDto,
  VisitStatsResponseDto,
} from "./stats.dto";

export const STATS_API_TAG = API_TAG_OPERATIONS_STATS;

export const statsApi = rootApi.injectEndpoints({
  endpoints: (builder) => ({
    getStats: builder.query<StatsResponseDto, StatsQueryDto | void>({
      query: (params) => {
        const queryParams = params ? { ...params } : undefined;
        // Convert types array to comma-separated string for query params
        if (queryParams?.types) {
          queryParams.types = queryParams.types.join(",") as any;
        }
        return {
          url: "/api/v1/stats",
          params: queryParams,
        };
      },
      providesTags: [STATS_API_TAG],
    }),
    getPatientQuickStats: builder.query<
      PatientStatsResponseDto,
      PatientStatsQueryDto | void
    >({
      query: (params) => ({
        url: "/api/v1/stats/patients",
        params: params ?? undefined,
      }),
      providesTags: [STATS_API_TAG],
    }),
    getInvoiceQuickStats: builder.query<
      InvoiceStatsResponseDto,
      InvoiceStatsQueryDto | void
    >({
      query: (params) => ({
        url: "/api/v1/stats/invoices",
        params: params ?? undefined,
      }),
      providesTags: [STATS_API_TAG],
    }),
    getEmployeeQuickStats: builder.query<
      EmployeeQuickStatsResponseDto,
      EmployeeQuickStatsQueryDto | void
    >({
      query: (params) => ({
        url: "/api/v1/stats/employees/quick",
        params: params ?? undefined,
      }),
      providesTags: [API_TAG_OPERATIONS_EMPLOYEE_STATS],
    }),
    getEmployeeDashboardStats: builder.query<
      EmployeeStatsResponseDto,
      EmployeeStatsQueryDto
    >({
      query: (params) => ({
        url: "/api/v1/stats/employees",
        params,
      }),
      providesTags: (result, error, { employeeId }) => [
        { type: API_TAG_OPERATIONS_EMPLOYEE_STATS, id: employeeId },
      ],
    }),
    getPatientDashboardStats: builder.query<
      PatientDashboardStatsResponseDto,
      PatientDashboardStatsQueryDto
    >({
      query: (params) => ({
        url: "/api/v1/stats/patients/dashboard",
        params,
      }),
      providesTags: (result, error, { patientId }) => [
        { type: STATS_API_TAG, id: `patient-${patientId}` },
      ],
    }),
    getVisitQuickStats: builder.query<
      VisitStatsResponseDto,
      VisitStatsQueryDto | void
    >({
      query: (params) => ({
        url: "/api/v1/stats/visits",
        params: params ?? undefined,
      }),
      providesTags: [STATS_API_TAG],
    }),
  }),
});

export const {
  useGetStatsQuery,
  useGetPatientQuickStatsQuery,
  useGetInvoiceQuickStatsQuery,
  useGetEmployeeQuickStatsQuery,
  useGetEmployeeDashboardStatsQuery,
  useGetPatientDashboardStatsQuery,
  useGetVisitQuickStatsQuery,
} = statsApi;
