"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { clearAuth } from "@/features/auth/auth.slice";
import { useGetMeQuery } from "@/features/auth/auth.api";

export function AuthInitializer() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { token, isAuthenticated } = useAppSelector((state) => state.auth);

  // Only try to fetch user data if we have a token
  const { error } = useGetMeQuery(undefined, {
    skip: !isAuthenticated || !token,
  });

  useEffect(() => {
    // If we have a token but getMe request failed with 401, clear auth
    if (isAuthenticated && error && "status" in error && error.status === 401) {
      dispatch(clearAuth());
      // Only redirect if we're on a protected route
      if (window.location.pathname.startsWith("/cabinet")) {
        router.push("/login");
      }
    }
  }, [isAuthenticated, error, dispatch, router]);

  return null; // This component doesn't render anything
}
