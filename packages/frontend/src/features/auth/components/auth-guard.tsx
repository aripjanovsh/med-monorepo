"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { useMe } from "@/features/auth/use-me";
import { ROUTES } from "@/constants/route.constants";

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { user, isLoading, error } = useMe();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    // Only handle redirects on client side
    if (!isClient) return;

    // If not authenticated, redirect to login
    if (!isAuthenticated) {
      router.push(ROUTES.LOGIN);
      return;
    }

    // If we have auth but getMe failed with 401, the AuthInitializer will handle logout
    // For other errors, also redirect to login
    if (isAuthenticated && error && "status" in error && error.status !== 401) {
      router.push(ROUTES.LOGIN);
      return;
    }
  }, [isAuthenticated, error, router, isClient]);

  // During SSR or initial client render, show nothing to avoid hydration mismatch
  if (!isClient) {
    return <>{children}</>;
  }

  // If not authenticated, don't render anything (redirect will happen)
  if (!isAuthenticated) {
    return null;
  }

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // If we have error (except 401 which is handled by AuthInitializer), don't render
  if (error && "status" in error && error.status !== 401) {
    return null;
  }

  // Render protected content if authenticated and user data loaded successfully
  return <>{children}</>;
}
