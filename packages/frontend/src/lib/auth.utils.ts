import Cookies from "js-cookie";
import { BASE_AUTH_TOKEN } from "@/features/auth/auth.constants";

/**
 * Get auth token from cookies
 */
export function getStoredToken(): string | null {
  return Cookies.get(BASE_AUTH_TOKEN) || null;
}

/**
 * Save auth token to cookies
 */
export function setStoredToken(token: string): void {
  Cookies.set(BASE_AUTH_TOKEN, token, {
    expires: 7, // 7 days
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
}

/**
 * Remove auth token from cookies
 */
export function removeStoredToken(): void {
  Cookies.remove(BASE_AUTH_TOKEN);
}
