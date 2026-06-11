"use client";

import { useAuth } from "@/lib/hooks/useAuth";
import FullscreenShell from "@/components/fullscreen-shell";
import EarnContent from "@/components/earn-content";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Box, CircularProgress, Button } from "@mui/material";
import Typography from "@/components/ui/Typography";
import colors from "@/theme/colors";

export default function EarnPage() {
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
      // Add a small delay before redirect to ensure auth state is settled
      const timer = setTimeout(() => {
        router.push("/auth/login");
      }, 100);
      return () => clearTimeout(timer);
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
          {loadingTimeout ? "Taking longer than expected..." : "Loading..."}
        </Typography>
        
        {loadingTimeout && (
          <Button
            variant="outlined"
            onClick={() => {
              // Clear all storage and redirect to login
              if (typeof window !== 'undefined') {
                localStorage.clear();
                sessionStorage.clear();
              }
              router.push("/auth/login");
            }}
            sx={{
              mt: 2,
              borderColor: colors.secondary,
              color: colors.secondary,
              textTransform: "none",
              "&:hover": {
                borderColor: colors.secondary,
                bgcolor: "rgba(1, 214, 118, 0.1)",
              },
            }}
          >
            Click here to login again
          </Button>
        )}
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