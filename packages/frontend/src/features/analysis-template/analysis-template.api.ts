import { rootApi } from "@/store/api/root.api";
import { API_TAG_OPERATIONS_ANALYSIS_TEMPLATES } from "@/constants/api-tags.constants";

import type {
  CreateAnalysisTemplateRequestDto,
  AnalysisTemplateResponseDto,
  UpdateAnalysisTemplateRequestDto,
  AnalysisTemplatesListResponseDto,
  AnalysisTemplatesQueryParamsDto,
} from "./analysis-template.dto";

export const analysisTemplateApi = rootApi.injectEndpoints({
  overrideExisting: false,
  endpoints: (builder) => ({
    // Get all analysis templates with pagination
    getAnalysisTemplates: builder.query<
      AnalysisTemplatesListResponseDto,
      AnalysisTemplatesQueryParamsDto
    >({
      query: (params) => ({
        url: "/api/v1/analysis-templates",
        method: "GET",
        params,
      }),
      providesTags: [API_TAG_OPERATIONS_ANALYSIS_TEMPLATES],
    }),

    // Get analysis template by ID
    getAnalysisTemplate: builder.query<AnalysisTemplateResponseDto, string>({
      query: (id) => ({
        url: `/api/v1/analysis-templates/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [
        { type: API_TAG_OPERATIONS_ANALYSIS_TEMPLATES, id },
      ],
    }),

    // Create new analysis template
    createAnalysisTemplate: builder.mutation<
      AnalysisTemplateResponseDto,
      CreateAnalysisTemplateRequestDto
    >({
      query: (data) => ({
        url: "/api/v1/analysis-templates",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [API_TAG_OPERATIONS_ANALYSIS_TEMPLATES],
    }),

    // Update analysis template
    updateAnalysisTemplate: builder.mutation<
      AnalysisTemplateResponseDto,
      UpdateAnalysisTemplateRequestDto
    >({
      query: (data) => ({
        url: `/api/v1/analysis-templates/${data.id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: API_TAG_OPERATIONS_ANALYSIS_TEMPLATES, id },
        API_TAG_OPERATIONS_ANALYSIS_TEMPLATES,
      ],
    }),

    // Delete analysis template
    deleteAnalysisTemplate: builder.mutation<void, string>({
      query: (id) => ({
        url: `/api/v1/analysis-templates/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: API_TAG_OPERATIONS_ANALYSIS_TEMPLATES, id },
        API_TAG_OPERATIONS_ANALYSIS_TEMPLATES,
      ],
    }),
  }),
});

export const {
  useGetAnalysisTemplatesQuery,
  useGetAnalysisTemplateQuery,
  useCreateAnalysisTemplateMutation,
  useUpdateAnalysisTemplateMutation,
  useDeleteAnalysisTemplateMutation,
} = analysisTemplateApi;
