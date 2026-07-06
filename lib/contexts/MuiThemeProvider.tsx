"use client";

import { type ReactNode } from "react";
import { ThemeProvider as MuiThemeProvider } from "@mui/material/styles";
import { useThemeMode } from "./ThemeContext";
import { buildTheme } from "@/theme";

export function MuiThemeProvider({ children }: { children: ReactNode }) {
  const { mode } = useThemeMode();
  const theme = buildTheme(mode);
  return <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>;
}
