import { rootApi } from "@/store/api/root.api";
import {
  Title,
  CreateTitleRequest,
  UpdateTitleRequest,
  MasterDataPaginatedResponse,
  MasterDataQueryParams,
} from "@/features/master-data/master-data.types";
import { API_TAG_OPERATIONS_TITLES } from "@/constants/api-tags.constants";

export const titlesApi = rootApi.injectEndpoints({
  overrideExisting: false,
  endpoints: (builder) => ({
    // Get all titles with pagination
    getTitles: builder.query<
      MasterDataPaginatedResponse<Title>,
      MasterDataQueryParams
    >({
      query: (params) => ({
        url: "/api/v1/master-data/titles",
        method: "GET",
        params,
      }),
      providesTags: [API_TAG_OPERATIONS_TITLES],
    }),

    // Get title by ID
    getTitle: builder.query<Title, string>({
      query: (id) => ({
        url: `/api/v1/master-data/titles/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [
        { type: API_TAG_OPERATIONS_TITLES, id },
      ],
    }),

    // Create new title
    createTitle: builder.mutation<Title, CreateTitleRequest>({
      query: (data) => ({
        url: "/api/v1/master-data/titles",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [API_TAG_OPERATIONS_TITLES],
    }),

    // Update title
    updateTitle: builder.mutation<
      Title,
      { id: string; data: UpdateTitleRequest }
    >({
      query: ({ id, data }) => ({
        url: `/api/v1/master-data/titles/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: API_TAG_OPERATIONS_TITLES, id },
        API_TAG_OPERATIONS_TITLES,
      ],
    }),

    // Delete title
    deleteTitle: builder.mutation<void, string>({
      query: (id) => ({
        url: `/api/v1/master-data/titles/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: API_TAG_OPERATIONS_TITLES, id },
        API_TAG_OPERATIONS_TITLES,
      ],
    }),
  }),
});

export const {
  useGetTitlesQuery,
  useGetTitleQuery,
  useCreateTitleMutation,
  useUpdateTitleMutation,
  useDeleteTitleMutation,
} = titlesApi;
