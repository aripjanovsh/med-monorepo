import { useGetMeQuery } from "@/features/auth/auth.api";
import { useAppSelector } from "@/store/hooks";

/**
 * Hook for getting current user data
 * @returns user data, loading state, and error
 */
export function useMe() {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  const {
    data: user,
    isLoading,
    error,
    refetch,
  } = useGetMeQuery(undefined, {
    skip: !isAuthenticated, // Skip query if not authenticated
  });

  return {
    user,
    isLoading,
    error,
    refetch,
    isAuthenticated,
  };
}
