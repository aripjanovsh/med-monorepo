import { rootApi } from "@/store/api/root.api";
import { API_TAG_OPERATIONS_PROTOCOL_TEMPLATES } from "@/constants/api-tags.constants";
import type {
  ProtocolTemplateResponseDto,
  CreateProtocolTemplateRequestDto,
  UpdateProtocolTemplateRequestDto,
  ProtocolTemplateQueryDto,
  ProtocolTemplatesListResponseDto,
} from "./protocol-template.dto";

const API_TAG = API_TAG_OPERATIONS_PROTOCOL_TEMPLATES;

export const protocolTemplateApi = rootApi.injectEndpoints({
  endpoints: (builder) => ({
    getProtocolTemplates: builder.query<
      ProtocolTemplatesListResponseDto,
      ProtocolTemplateQueryDto
    >({
      query: (params) => ({
        url: "/api/v1/protocol-templates",
        params,
      }),
      providesTags: [API_TAG],
    }),

    getProtocolTemplate: builder.query<ProtocolTemplateResponseDto, string>({
      query: (id) => ({ url: `/api/v1/protocol-templates/${id}` }),
      providesTags: (result, error, id) => [{ type: API_TAG, id }],
    }),

    createProtocolTemplate: builder.mutation<
      ProtocolTemplateResponseDto,
      CreateProtocolTemplateRequestDto
    >({
      query: (data) => ({
        url: "/api/v1/protocol-templates",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [API_TAG],
    }),

    updateProtocolTemplate: builder.mutation<
      ProtocolTemplateResponseDto,
      { id: string; data: UpdateProtocolTemplateRequestDto }
    >({
      query: ({ id, data }) => ({
        url: `/api/v1/protocol-templates/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: API_TAG, id }, API_TAG],
    }),

    deleteProtocolTemplate: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/api/v1/protocol-templates/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [{ type: API_TAG, id }, API_TAG],
    }),
  }),
});

export const {
  useGetProtocolTemplatesQuery,
  useGetProtocolTemplateQuery,
  useCreateProtocolTemplateMutation,
  useUpdateProtocolTemplateMutation,
  useDeleteProtocolTemplateMutation,
} = protocolTemplateApi;
