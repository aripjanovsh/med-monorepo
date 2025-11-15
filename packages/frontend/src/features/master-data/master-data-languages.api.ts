import { rootApi } from "@/store/api/root.api";
import {
  Language,
  CreateLanguageRequest,
  UpdateLanguageRequest,
  MasterDataPaginatedResponse,
  MasterDataQueryParams,
} from "@/features/master-data/master-data.types";
import { API_TAG_OPERATIONS_LANGUAGES } from "@/constants/api-tags.constants";

export const languagesApi = rootApi.injectEndpoints({
  overrideExisting: false,
  endpoints: (builder) => ({
    // Get all languages with pagination
    getLanguages: builder.query<
      MasterDataPaginatedResponse<Language>,
      MasterDataQueryParams
    >({
      query: (params) => ({
        url: "/api/v1/master-data/languages",
        method: "GET",
        params,
      }),
      providesTags: [API_TAG_OPERATIONS_LANGUAGES],
    }),

    // Get language by ID
    getLanguage: builder.query<Language, string>({
      query: (id) => ({
        url: `/api/v1/master-data/languages/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [
        { type: API_TAG_OPERATIONS_LANGUAGES, id },
      ],
    }),

    // Create new language
    createLanguage: builder.mutation<Language, CreateLanguageRequest>({
      query: (data) => ({
        url: "/api/v1/master-data/languages",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [API_TAG_OPERATIONS_LANGUAGES],
    }),

    // Update language
    updateLanguage: builder.mutation<
      Language,
      { id: string; data: UpdateLanguageRequest }
    >({
      query: ({ id, data }) => ({
        url: `/api/v1/master-data/languages/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: API_TAG_OPERATIONS_LANGUAGES, id },
        API_TAG_OPERATIONS_LANGUAGES,
      ],
    }),

    // Delete language
    deleteLanguage: builder.mutation<void, string>({
      query: (id) => ({
        url: `/api/v1/master-data/languages/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: API_TAG_OPERATIONS_LANGUAGES, id },
        API_TAG_OPERATIONS_LANGUAGES,
      ],
    }),

    // Toggle language status (активный/неактивный)
    toggleLanguageStatus: builder.mutation<Language, string>({
      query: (id) => ({
        url: `/api/v1/master-data/languages/${id}/toggle-status`,
        method: "PATCH",
      }),
      invalidatesTags: (result, error, id) => [
        { type: API_TAG_OPERATIONS_LANGUAGES, id },
        API_TAG_OPERATIONS_LANGUAGES,
      ],
    }),
  }),
});

export const {
  useGetLanguagesQuery,
  useGetLanguageQuery,
  useCreateLanguageMutation,
  useUpdateLanguageMutation,
  useDeleteLanguageMutation,
  useToggleLanguageStatusMutation,
} = languagesApi;
