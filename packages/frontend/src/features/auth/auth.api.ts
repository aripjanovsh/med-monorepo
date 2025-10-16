import { rootApi } from "@/store/api/root.api";
import { User } from "@/features/users";
import { API_TAG_OPERATIONS_PROFILE } from "@/constants/api-tags.constants";

export interface LoginRequest {
  phone: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export const authApi = rootApi.injectEndpoints({
  overrideExisting: false,
  endpoints: (builder) => ({
    // Login/register with phone and code
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (data) => ({
        url: "/api/v1/auth/login",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [API_TAG_OPERATIONS_PROFILE],
    }),

    // Get current user profile
    getMe: builder.query<User, void>({
      query: () => "/api/v1/auth/me",
      providesTags: [API_TAG_OPERATIONS_PROFILE],
    }),
  }),
});

export const { useLoginMutation, useGetMeQuery } = authApi;
