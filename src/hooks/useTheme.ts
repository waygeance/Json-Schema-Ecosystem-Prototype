"use client";

import { useState, useEffect } from "react";

export type Theme = "light" | "dark";

export function useTheme() {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    setMounted(true);

    // Check for stored theme first
    const stored = localStorage.getItem("theme") as Theme;
    if (stored) {
      console.log("Loaded stored theme:", stored);
      setTheme(stored);
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      console.log("System prefers dark mode");
      setTheme("dark");
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;

    // Remove both classes first
    root.classList.remove("light", "dark");

    // Add the current theme class
    root.classList.add(theme);

    // Save to localStorage
    localStorage.setItem("theme", theme);

    console.log("Applied theme to DOM:", theme);
    console.log("Current classes:", root.className);
  }, [theme, mounted]);

  const toggleTheme = () => {
    setTheme((prev) => {
      const newTheme = prev === "light" ? "dark" : "light";
      console.log("Toggling from", prev, "to", newTheme);
      return newTheme;
    });
  };

  return { theme, toggleTheme, setTheme, mounted };
}
