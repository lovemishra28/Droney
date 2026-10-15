"use client";

import { useEffect, useState } from "react";
import { getClientSessionAction } from "@/server/actions/auth";

export interface UserSessionState {
  isAuthenticated: boolean;
  role: "customer" | "admin" | null;
  userId: string | null;
  fullName: string | null;
  isLoading: boolean;
}

export const AUTH_STATE_CHANGED_EVENT = "altitude:auth-state-changed";

export function notifyAuthStateChanged() {
  window.dispatchEvent(new Event(AUTH_STATE_CHANGED_EVENT));
}

/**
 * React hook to access active session status and role in client components.
 */
export function useUserSession(): UserSessionState {
  const [session, setSession] = useState<UserSessionState>({
    isAuthenticated: false,
    role: null,
    userId: null,
    fullName: null,
    isLoading: true,
  });

  useEffect(() => {
    let mounted = true;

    const refreshSession = () => {
      getClientSessionAction()
        .then((res) => {
          if (mounted) {
            setSession({
              ...res,
              isLoading: false,
            });
          }
        })
        .catch(() => {
          if (mounted) {
            setSession({
              isAuthenticated: false,
              role: null,
              userId: null,
              fullName: null,
              isLoading: false,
            });
          }
        });
    };

    refreshSession();
    window.addEventListener(AUTH_STATE_CHANGED_EVENT, refreshSession);

    return () => {
      mounted = false;
      window.removeEventListener(AUTH_STATE_CHANGED_EVENT, refreshSession);
    };
  }, []);

  return session;
}

export type CartGuardResult =
  | { allowed: true }
  | { allowed: false; reason: "unauthenticated"; loginUrl: string }
  | { allowed: false; reason: "admin"; message: string };

/**
 * Validates that the active user is:
 * 1. Logged in (if not, returns redirect URL to /login with callbackUrl)
 * 2. NOT an administrator (admins are prohibited from buying from their own shop)
 */
export async function checkAddToCartAllowed(): Promise<CartGuardResult> {
  const session = await getClientSessionAction();

  if (!session.isAuthenticated) {
    const returnUrl =
      typeof window !== "undefined"
        ? window.location.pathname + window.location.search
        : "/";
    return {
      allowed: false,
      reason: "unauthenticated",
      loginUrl: `/login?callbackUrl=${encodeURIComponent(returnUrl)}`,
    };
  }

  if (session.role === "admin") {
    return {
      allowed: false,
      reason: "admin",
      message:
        "Administrator accounts are restricted from adding products to cart or purchasing from their own shop. Please use a customer account.",
    };
  }

  return { allowed: true };
}
