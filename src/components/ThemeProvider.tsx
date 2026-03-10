"use client";

import { useEffect } from "react";
import type { SiteTheme } from "@/data/siteData";
import { useSiteData } from "@/hooks/useSiteData";

const applyTheme = (theme: SiteTheme) => {
  const root = document.documentElement;
  root.style.setProperty("--background", theme.background);
  root.style.setProperty("--foreground", theme.foreground);
  root.style.setProperty("--accent", theme.accent);
  root.style.setProperty("--muted", theme.muted);
  root.style.setProperty("--card", theme.card);
  root.style.setProperty("--border", theme.border);
  root.style.setProperty("--button-bg", theme.buttonBg);
  root.style.setProperty("--button-fg", theme.buttonFg);
  root.style.setProperty("--button-hover-bg", theme.buttonHoverBg);
  root.style.setProperty("--button-hover-fg", theme.buttonHoverFg);
};

export default function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data } = useSiteData();

  useEffect(() => {
    applyTheme(data.theme);
  }, [data.theme]);

  return <>{children}</>;
}
