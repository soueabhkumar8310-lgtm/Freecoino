"use client";

import { useAuth } from "@/lib/hooks/useAuth";
import FullscreenShell from "@/components/fullscreen-shell";
import EarnContent from "@/components/earn-content";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Box, CircularProgress } from "@mui/material";
import Typography from "@/components/ui/Typography";
import colors from "@/theme/colors";

export default function EarnPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth/login");
    }
  }, [user, isLoading, router]);

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: colors.background.default,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
        }}
      >
        <CircularProgress size={40} sx={{ color: colors.secondary }} />
        <Typography sx={{ color: colors.text.secondary, fontSize: "0.875rem" }}>
          Loading...
        </Typography>
      </Box>
    );
  }

  // If no user after loading, don't render anything (redirect will happen)
  if (!user) {
    return null;
  }

  return (
    <FullscreenShell
      coins={0} // TODO: Get from database
      userName={user.name}
      userAvatar={user.avatar}
      userId={user.id}
    >
      <EarnContent
        userId={user.id}
        userName={user.name}
        userEmail={user.email}
      />
    </FullscreenShell>
  );
}