"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@/components/ui/Typography";
import colors from "@/theme/colors";

export default function CallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const error = searchParams.get("error");
    
    if (error) {
      // If there's an error, redirect to login
      router.push(`/auth/login?error=${error}`);
    }
  }, [searchParams, router]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        bgcolor: colors.background.default,
        gap: 3,
      }}
    >
      <CircularProgress size={48} sx={{ color: colors.secondary }} />
      <Typography variant="h6" sx={{ color: colors.text.secondary }}>
        Signing you in...
      </Typography>
      <Typography variant="body2" sx={{ color: colors.text.secondary, opacity: 0.7 }}>
        Please wait while we complete the authentication
      </Typography>
    </Box>
  );
}
