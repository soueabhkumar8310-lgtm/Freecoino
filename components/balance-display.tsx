"use client";

import { Box } from "@mui/material";
import { useAuth } from "@/lib/hooks/useAuth";
import Typography from "@/components/ui/Typography";

interface BalanceDisplayProps {
  userId: string;
  initialBalance?: number;
}

export default function BalanceDisplay({ userId, initialBalance = 0 }: BalanceDisplayProps) {
  const { user } = useAuth();
  const balance = user?.coins_balance ?? initialBalance;

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 0.25,
        bgcolor: "rgba(1, 214, 118, 0.1)",
        border: "1px solid rgba(1, 214, 118, 0.2)",
        borderRadius: 2,
        px: { xs: 1.5, sm: 2 },
        py: 0.75,
      }}
    >
      <Typography
        component="span"
        sx={{
          fontSize: { xs: "0.875rem", sm: "1rem" },
          fontWeight: 700,
          color: "#01D676"
        }}
      >
        $
      </Typography>
      <Typography
        component="span"
        sx={{
          fontSize: { xs: "0.875rem", sm: "1rem" },
          fontWeight: 700,
          color: "#ffffff"
        }}
      >
        {(balance / 1000).toFixed(2)}
      </Typography>
    </Box>
  );
}
