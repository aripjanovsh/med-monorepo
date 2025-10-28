import { rootApi } from '@/store/api/root.api';
import type { ParameterDefinition, CreateParameterDefinitionRequest, UpdateParameterDefinitionRequest } from './parameter-definition.model';
import type { PaginatedResponseDto } from '@/types/api.types';

type PaginationParams = {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
};

type FindAllParams = PaginationParams & {
  category?: string;
  isActive?: boolean;
  search?: string;
};

export const parameterDefinitionApi = rootApi.injectEndpoints({
  endpoints: (builder) => ({
    createParameterDefinition: builder.mutation<ParameterDefinition, CreateParameterDefinitionRequest>({
      query: (data) => ({
        url: '/api/v1/parameter-definitions',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['ParameterDefinition'],
    }),

    getParameterDefinitions: builder.query<PaginatedResponseDto<ParameterDefinition>, FindAllParams | void>({
      query: (params) => ({
        url: '/api/v1/parameter-definitions',
        params: params ?? {},
      }),
      providesTags: ['ParameterDefinition'],
    }),

    getParameterDefinition: builder.query<ParameterDefinition, string>({
      query: (id) => `/api/v1/parameter-definitions/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'ParameterDefinition', id }],
    }),

    getParameterDefinitionByCode: builder.query<ParameterDefinition | null, string>({
      query: (code) => `/api/v1/parameter-definitions/by-code/${code}`,
      providesTags: (_result, _error, code) => [{ type: 'ParameterDefinition', id: code }],
    }),

    updateParameterDefinition: builder.mutation<ParameterDefinition, { id: string; data: UpdateParameterDefinitionRequest }>({
      query: ({ id, data }) => ({
        url: `/api/v1/parameter-definitions/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'ParameterDefinition', id }, 'ParameterDefinition'],
    }),

    deleteParameterDefinition: builder.mutation<void, string>({
      query: (id) => ({
        url: `/api/v1/parameter-definitions/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['ParameterDefinition'],
    }),
  }),
});

export const {
  useCreateParameterDefinitionMutation,
  useGetParameterDefinitionsQuery,
  useGetParameterDefinitionQuery,
  useGetParameterDefinitionByCodeQuery,
  useUpdateParameterDefinitionMutation,
  useDeleteParameterDefinitionMutation,
} = parameterDefinitionApi;
