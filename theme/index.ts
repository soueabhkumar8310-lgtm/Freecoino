"use client";

import { createTheme, type ThemeOptions } from "@mui/material/styles";
import { darkScrollbar } from "@mui/material";
import { getColors, type ColorSet } from "./colors";
import fonts from "./fonts";

export function buildTheme(mode: "dark" | "light") {
  const colors = getColors(mode);

  const { primary, secondary, tertiary, text, background, divider, action, scrollBar, glass } = colors;

  return createTheme({
    palette: {
      mode,
      primary: { main: primary },
      secondary: { main: secondary },
      text: { primary: text.primary, secondary: text.secondary },
      background: { default: background.default },
      action: { active: action.active },
      divider,
    },
    typography: { fontFamily: fonts.style.fontFamily },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          html: {
            ...(mode === "dark" ? darkScrollbar({
              active: scrollBar.active,
              thumb: scrollBar.thumb,
              track: scrollBar.track,
            }) : {}),
            scrollbarWidth: "thin",
          },
        },
      },
      MuiInputLabel: {
        styleOverrides: {
          root: {
            fontWeight: 600,
            position: "relative",
            transform: "translate(0, 0) scale(1)",
            marginBottom: 8,
            color: text.secondary,
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            background: background.primary,
            backdropFilter: glass.backdrop,
            border: `1px solid ${glass.border}`,
            color: text.primary,
            transition: "all 0.2s ease",
            "&:hover": {
              borderColor: glass.borderHover,
              background: background.secondary,
            },
            "&.Mui-focused": {
              borderColor: primary,
              background: background.secondary,
              boxShadow: `0 0 20px rgba(99, 102, 241, 0.2)`,
            },
          },
        },
      },
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: {
            padding: "12px 24px",
            borderRadius: 8,
            textTransform: "none",
            fontWeight: 700,
            fontSize: "0.95rem",
            transition: "all 0.2s ease",
            backdropFilter: glass.backdrop,
          },
          outlined: {
            borderColor: glass.border,
            color: text.primary,
            background: background.glass,
            border: `1px solid ${glass.border}`,
            "&:hover": {
              backgroundColor: background.glassHover,
              borderColor: glass.borderHover,
            },
          },
        },
        variants: [
          {
            props: { variant: 'contained', color: 'primary' },
            style: {
              background: colors.gradient,
              color: "#ffffff",
              border: "none",
              "&:hover": {
                background: `linear-gradient(135deg, ${primary} 0%, ${tertiary} 100%)`,
                transform: "translateY(-2px)",
                boxShadow: `0 8px 24px rgba(99, 102, 241, 0.3)`,
              },
            },
          },
        ],
      },
      MuiButtonBase: { defaultProps: { disableRipple: true } },
      MuiIconButton: {
        styleOverrides: {
          root: {
            backgroundColor: "transparent",
            color: text.secondary,
            transition: "all 0.2s ease",
            "&:hover": {
              color: primary,
              backgroundColor: background.glass,
            },
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            padding: 8,
            borderRadius: 6,
            color: text.secondary,
            transition: "all 0.2s ease",
            "&:hover": {
              color: primary,
              backgroundColor: background.glass,
              "& svg": { color: primary },
            },
            "&.Mui-selected": {
              backgroundColor: background.glass,
              color: primary,
              "& svg": { color: primary },
            },
          },
        },
      },
      MuiListItemText: {
        styleOverrides: {
          primary: { fontSize: "0.9rem", fontWeight: 600 },
        },
      },
      MuiListItemIcon: {
        styleOverrides: {
          root: { minWidth: "auto", marginRight: 8 },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundColor: background.default,
            backgroundImage: "none",
            borderRadius: 2,
            boxShadow: mode === "dark"
              ? "0 4px 24px rgba(0,0,0,0.15)"
              : "0 1px 3px rgba(0,0,0,0.08)",
          },
        },
      },
      MuiBottomNavigation: {
        styleOverrides: {
          root: {
            height: 75,
            color: text.secondary,
            backgroundColor: background.default,
            borderTop: `1px solid ${glass.border}`,
            backdropFilter: glass.backdrop,
          },
        },
      },
      MuiBottomNavigationAction: {
        styleOverrides: {
          root: {
            transition: "all 0.2s ease",
            "&.Mui-selected": { color: primary },
          },
          label: {
            fontSize: "0.685rem",
            marginTop: 6,
            "&.Mui-selected": { fontSize: "0.635rem" },
          },
        },
      },
      MuiTabs: {
        styleOverrides: {
          root: { '& .MuiTabs-flexContainer': { gap: 16 } },
          indicator: {
            height: "100%",
            color: primary,
            backgroundColor: "transparent",
            borderRadius: 100,
            background: colors.gradient,
          },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            zIndex: 1,
            textTransform: "none",
            fontWeight: 700,
            color: text.secondary,
            backgroundColor: "transparent",
            transition: "all 0.2s ease",
            "&:hover": { color: primary },
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: background.primary,
            borderRight: `1px solid ${glass.border}`,
            backdropFilter: glass.backdrop,
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: background.primary,
            borderBottom: `1px solid ${glass.border}`,
            backdropFilter: glass.backdrop,
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            backgroundColor: background.primary,
            backgroundImage: "none",
          },
        },
      },
      MuiMenu: {
        styleOverrides: {
          paper: {
            backgroundColor: background.primary,
            backgroundImage: "none",
          },
        },
      },
      MuiSwitch: {
        styleOverrides: {
          track: {
            backgroundColor: mode === "dark" ? "#374151" : "#e2e8f0",
          },
        },
      },
    },
  });
}

const darkTheme = buildTheme("dark");
export default darkTheme;
