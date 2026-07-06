"use client";

import { Box, Tooltip } from "@mui/material";
import { MessageCircle } from "lucide-react";
import { useThemeMode } from "@/lib/contexts/ThemeContext";
import { getColors } from "@/theme/colors";

export default function LiveChatButton() {
  const { mode } = useThemeMode();
  const colors = getColors(mode);

  return (
    <Tooltip title="Chat with us on Telegram" placement="left">
      <Box
        component="a"
        href="https://t.me/Freecoino"
        target="_blank"
        rel="noopener noreferrer"
        sx={{
          position: "fixed",
          bottom: { xs: 80, md: 24 },
          right: 24,
          zIndex: 9999,
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: `linear-gradient(135deg, #01D676 0%, #00B894 100%)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 20px rgba(1, 214, 118, 0.4)",
          cursor: "pointer",
          transition: "all 0.3s ease",
          animation: "float 3s ease-in-out infinite",
          "&:hover": {
            transform: "scale(1.1)",
            boxShadow: "0 8px 32px rgba(1, 214, 118, 0.5)",
          },
        }}
      >
        <MessageCircle size={28} color="#fff" strokeWidth={2.5} />
      </Box>
    </Tooltip>
  );
}
