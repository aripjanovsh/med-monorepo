import { API_TAG_OPERATIONS_ORGANIZATION } from "@/constants/api-tags.constants";
import type { FileResponseDto } from "@/features/file/file.dto";
import { rootApi } from "@/store/api/root.api";

export type Organization = {
  id: string;
  name: string;
  slug: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  description?: string;
  logoId?: string;
  logo?: FileResponseDto;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type UpdateOrganizationRequest = {
  name?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  description?: string;
  logoId?: string;
};

export const organizationApi = rootApi.injectEndpoints({
  overrideExisting: false,
  endpoints: (builder) => ({
    getMyOrganization: builder.query<Organization, void>({
      query: () => "/api/v1/organizations/my",
      providesTags: [API_TAG_OPERATIONS_ORGANIZATION],
    }),
    updateMyOrganization: builder.mutation<
      Organization,
      UpdateOrganizationRequest
    >({
      query: (data) => ({
        url: "/api/v1/organizations/my",
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: [API_TAG_OPERATIONS_ORGANIZATION],
    }),
  }),
});

export const { useGetMyOrganizationQuery, useUpdateMyOrganizationMutation } =
  organizationApi;
