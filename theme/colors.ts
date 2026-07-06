export interface ColorSet {
  primary: string;
  secondary: string;
  tertiary: string;
  divider: string;
  green: string;
  greenTint: string;
  gradient: string;
  bgPage: string;
  bgCard: string;
  bgInput: string;
  bgButton: string;
  textPrimary: string;
  textSecondary: string;
  text: {
    primary: string;
    secondary: string;
    gradient: string;
  };
  background: {
    default: string;
    primary: string;
    secondary: string;
    ternary: string;
    drawer: string;
    hover: string;
    gradient: string;
    glass: string;
    glassHover: string;
  };
  action: { active: string };
  scrollBar: { active: string; thumb: string; track: string };
  status: {
    success: string;
    warning: string;
    error: string;
    info: string;
  };
  glass: {
    border: string;
    borderHover: string;
    backdrop: string;
  };
  surface: {
    card: string;
    cardHover: string;
    elevated: string;
    overlay: string;
  };
  chart: {
    line: string;
    fill: string;
    grid: string;
  };
}

const dark: ColorSet = {
  primary: "#6366F1",
  secondary: "#01D676",
  tertiary: "#14B8A6",
  divider: "rgba(148, 163, 184, 0.2)",
  green: "#01D676",
  greenTint: "rgba(1, 214, 118, 0.1)",
  gradient: "linear-gradient(135deg, #01D676 0%, #00B894 100%)",
  bgPage: "#0a0b0f",
  bgCard: "#12131c",
  bgInput: "#252539",
  bgButton: "#1a1b2e",
  textPrimary: "#d9e3f6",
  textSecondary: "#94a3b8",
  text: {
    primary: "#d9e3f6",
    secondary: "#94a3b8",
    gradient: "linear-gradient(135deg, #d9e3f6 0%, #6366F1 100%) text",
  },
  background: {
    default: "#091421",
    primary: "#16202e",
    secondary: "#212b39",
    ternary: "#2b3544",
    drawer: "#16202e",
    hover: "rgba(99, 102, 241, 0.08)",
    gradient: "linear-gradient(135deg, #01D676 0%, #00B894 100%)",
    glass: "rgba(43, 53, 68, 0.6)",
    glassHover: "rgba(43, 53, 68, 0.75)",
  },
  action: { active: "#94a3b8" },
  scrollBar: { active: "#6366F1", thumb: "#2b3544", track: "#16202e" },
  status: {
    success: "#14B8A6",
    warning: "#f59e0b",
    error: "#ef4444",
    info: "#6366F1",
  },
  glass: {
    border: "rgba(148, 163, 184, 0.15)",
    borderHover: "rgba(99, 102, 241, 0.3)",
    backdrop: "blur(20px)",
  },
  surface: {
    card: "#1a1b2e",
    cardHover: "#222339",
    elevated: "#242537",
    overlay: "rgba(0,0,0,0.85)",
  },
  chart: {
    line: "#01D676",
    fill: "rgba(1, 214, 118, 0.1)",
    grid: "rgba(148, 163, 184, 0.1)",
  },
};

const light: ColorSet = {
  primary: "#4F46E5",
  secondary: "#059669",
  tertiary: "#0D9488",
  divider: "rgba(0, 0, 0, 0.1)",
  green: "#059669",
  greenTint: "rgba(5, 150, 105, 0.08)",
  gradient: "linear-gradient(135deg, #059669 0%, #0D9488 100%)",
  bgPage: "#f8fafc",
  bgCard: "#ffffff",
  bgInput: "#f1f5f9",
  bgButton: "#e2e8f0",
  textPrimary: "#0f172a",
  textSecondary: "#64748b",
  text: {
    primary: "#0f172a",
    secondary: "#64748b",
    gradient: "linear-gradient(135deg, #0f172a 0%, #4F46E5 100%) text",
  },
  background: {
    default: "#f8fafc",
    primary: "#ffffff",
    secondary: "#f1f5f9",
    ternary: "#e2e8f0",
    drawer: "#ffffff",
    hover: "rgba(79, 70, 229, 0.08)",
    gradient: "linear-gradient(135deg, #059669 0%, #0D9488 100%)",
    glass: "rgba(255, 255, 255, 0.7)",
    glassHover: "rgba(255, 255, 255, 0.85)",
  },
  action: { active: "#64748b" },
  scrollBar: { active: "#4F46E5", thumb: "#cbd5e1", track: "#f1f5f9" },
  status: {
    success: "#059669",
    warning: "#d97706",
    error: "#dc2626",
    info: "#4F46E5",
  },
  glass: {
    border: "rgba(0, 0, 0, 0.08)",
    borderHover: "rgba(79, 70, 229, 0.25)",
    backdrop: "blur(20px)",
  },
  surface: {
    card: "#ffffff",
    cardHover: "#f8fafc",
    elevated: "#ffffff",
    overlay: "rgba(0,0,0,0.5)",
  },
  chart: {
    line: "#059669",
    fill: "rgba(5, 150, 105, 0.1)",
    grid: "rgba(0, 0, 0, 0.06)",
  },
};

const colors = { dark, light };

export function getColors(mode: "dark" | "light"): ColorSet {
  return colors[mode] ?? colors.dark;
}

export default colors.dark;
