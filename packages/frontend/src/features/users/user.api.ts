import { API_TAG_OPERATIONS_PROFILE } from "@/constants/api-tags.constants";
import { rootApi } from "@/store/api/root.api";

export interface User {
  id: string;
  firstName?: string;
  lastName?: string;
  phone: string;
  coins: number;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
}

export const userApi = rootApi.injectEndpoints({
  overrideExisting: false,
  endpoints: (builder) => ({
    // Update user profile
    updateProfile: builder.mutation<User, UpdateProfileRequest>({
      query: (data) => ({
        url: "/users/profile",
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: [API_TAG_OPERATIONS_PROFILE],
    }),
  }),
});

export const { useUpdateProfileMutation } = userApi;
