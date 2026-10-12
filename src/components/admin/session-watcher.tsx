"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { logoutAction } from "@/server/actions/auth";

const INACTIVITY_TIMEOUT_MS = 60 * 60 * 1000; // 60 minutes session expiration

export function SessionWatcher() {
  const router = useRouter();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const resetTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(async () => {
      console.warn("[Security]: Admin session timed out due to 60 minutes of inactivity.");
      await logoutAction();
      router.push("/login?reason=timeout");
      router.refresh();
    }, INACTIVITY_TIMEOUT_MS);
  };

  useEffect(() => {
    const activityEvents = [
      "mousedown",
      "mousemove",
      "keydown",
      "scroll",
      "touchstart",
    ];

    resetTimer();

    activityEvents.forEach((event) => {
      window.addEventListener(event, resetTimer, { passive: true });
    });

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      activityEvents.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, []);

  return null;
}
