"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

interface AdminThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (t: Theme) => void;
  mounted: boolean;
}

const AdminThemeContext = createContext<AdminThemeContextType>({
  theme: "light",
  toggleTheme: () => {},
  setTheme: () => {},
  mounted: false,
});

export function AdminThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("altitude-admin-theme") as Theme | null;
      if (stored === "dark" || stored === "light") {
        setThemeState(stored);
      } else {
        // Default to pure white light theme to match the whole website aesthetic
        setThemeState("light");
      }
    } catch {
      setThemeState("light");
    }
    setMounted(true);
  }, []);

  // Synchronize the Tailwind 'dark' class on <html> (documentElement)
  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  // Clean up when navigating away from admin
  useEffect(() => {
    return () => {
      if (typeof document !== "undefined") {
        document.documentElement.classList.remove("dark");
      }
    };
  }, []);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem("altitude-admin-theme", newTheme);
    } catch {}
  };

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
  };

  return (
    <AdminThemeContext.Provider value={{ theme, toggleTheme, setTheme, mounted }}>
      <div
        id="admin-theme-root"
        className={`min-h-screen transition-colors duration-200 ${
          theme === "dark"
            ? "dark bg-zinc-950 text-zinc-100"
            : "bg-white text-zinc-900"
        }`}
      >
        {children}
      </div>
    </AdminThemeContext.Provider>
  );
}

export function useAdminTheme() {
  return useContext(AdminThemeContext);
}
