import { rootApi } from "@/store/api/root.api";
import { API_TAG_OPERATIONS_PROTOCOL_TEMPLATES } from "@/constants/api-tags.constants";
import {
  ProtocolTemplate,
  CreateProtocolTemplateDto,
  UpdateProtocolTemplateDto,
  ProtocolTemplateFilters,
  PaginatedProtocolTemplateResponse,
} from "@/types/protocol-template";

export const protocolTemplateApi = rootApi.injectEndpoints({
  endpoints: (builder) => ({
    getProtocolTemplates: builder.query<
      PaginatedProtocolTemplateResponse,
      ProtocolTemplateFilters
    >({
      query: (params) => ({
        url: "/api/v1/protocol-templates",
        params,
      }),
      providesTags: [API_TAG_OPERATIONS_PROTOCOL_TEMPLATES],
    }),

    getProtocolTemplate: builder.query<{ success: boolean; data: ProtocolTemplate }, string>({
      query: (id) => `/api/v1/protocol-templates/${id}`,
      providesTags: [API_TAG_OPERATIONS_PROTOCOL_TEMPLATES],
    }),

    createProtocolTemplate: builder.mutation<
      { success: boolean; data: ProtocolTemplate; message: string },
      CreateProtocolTemplateDto
    >({
      query: (body) => ({
        url: "/api/v1/protocol-templates",
        method: "POST",
        body,
      }),
      invalidatesTags: [API_TAG_OPERATIONS_PROTOCOL_TEMPLATES],
    }),

    updateProtocolTemplate: builder.mutation<
      { success: boolean; data: ProtocolTemplate; message: string },
      { id: string; data: UpdateProtocolTemplateDto }
    >({
      query: ({ id, data }) => ({
        url: `/api/v1/protocol-templates/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: [API_TAG_OPERATIONS_PROTOCOL_TEMPLATES],
    }),

    deleteProtocolTemplate: builder.mutation<
      { success: boolean; message: string },
      string
    >({
      query: (id) => ({
        url: `/api/v1/protocol-templates/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [API_TAG_OPERATIONS_PROTOCOL_TEMPLATES],
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
