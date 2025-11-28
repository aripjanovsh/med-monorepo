import { API_TAG_OPERATIONS_PROFILE } from "@/constants/api-tags.constants";
import { rootApi } from "@/store/api/root.api";
import type { FileResponseDto } from "@/features/file/file.dto";

export type User = {
  id: string;
  phone: string;
  role?: string;
  roles?: string[];
  organizationId?: string;
  employeeId?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  email?: string;
  avatarId?: string;
  avatar?: FileResponseDto;
  organization?: {
    id: string;
    name: string;
    slug: string;
  };
  employee?: {
    id: string;
    firstName: string;
    middleName?: string;
    lastName: string;
    email?: string;
    phone?: string;
    avatarId?: string;
    avatar?: FileResponseDto;
    title?: {
      id: string;
      name: string;
    };
    department?: {
      id: string;
      name: string;
    };
  };
  createdAt?: string;
  updatedAt?: string;
};

export type UpdateProfileRequest = {
  firstName?: string;
  middleName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  avatarId?: string;
};

export const userApi = rootApi.injectEndpoints({
  overrideExisting: false,
  endpoints: (builder) => ({
    // Update user profile
    updateProfile: builder.mutation<User, UpdateProfileRequest>({
      query: (data) => ({
        url: "/api/v1/auth/profile",
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: [API_TAG_OPERATIONS_PROFILE],
    }),
  }),
});

export const { useUpdateProfileMutation } = userApi;
