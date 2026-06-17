"use client";

import { useAuth } from "@/lib/contexts/AuthContext";
import FullscreenShell from "@/components/fullscreen-shell";
import AllOffersClient from "@/components/all-offers-client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Box, CircularProgress } from "@mui/material";
import Typography from "@/components/ui/Typography";
import colors from "@/theme/colors";

export default function AllOffersPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [loadingTimeout, setLoadingTimeout] = useState(false);

  // Timeout after 3 seconds if still loading
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoading) {
        setLoadingTimeout(true);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [isLoading]);

  useEffect(() => {
    if (!isLoading && !user) {
      console.log('🔄 No user found, redirecting to login...');
      const timer = setTimeout(() => {
        router.push("/auth/login");
      }, 100);
      return () => clearTimeout(timer);
    } else if (!isLoading && user) {
      console.log('✅ User authenticated:', user.email);
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
          px: 2,
        }}
      >
        <CircularProgress size={40} sx={{ color: colors.secondary }} />
        <Typography sx={{ color: colors.text.secondary, fontSize: "0.875rem" }}>
          {loadingTimeout ? "Taking longer than expected... Please wait." : "Loading offers..."}
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
      <AllOffersClient userId={user.id} />
    </FullscreenShell>
  );
}
