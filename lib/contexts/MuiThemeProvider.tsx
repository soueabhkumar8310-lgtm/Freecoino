"use client";

import { type ReactNode } from "react";
import { ThemeProvider } from "@mui/material/styles";
import { useThemeMode } from "./ThemeContext";
import { buildTheme } from "@/theme";

export function MuiThemeProvider({ children }: { children: ReactNode }) {
  const { mode } = useThemeMode();
  const theme = buildTheme(mode);
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}
