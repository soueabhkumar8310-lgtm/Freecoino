"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@/components/ui/Typography";
import colors from "@/theme/colors";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    async function performLogout() {
      try {
        // Sign out from Supabase
        await supabase.auth.signOut();
        
        // Clear all Supabase storage keys
        if (typeof window !== "undefined") {
          const keysToRemove = [];
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('supabase')) {
              keysToRemove.push(key);
            }
          }
          keysToRemove.forEach(key => localStorage.removeItem(key));
          
          // Clear all storage
          localStorage.clear();
          sessionStorage.clear();
          
          // Clear all cookies
          document.cookie.split(";").forEach((c) => {
            document.cookie = c
              .replace(/^ +/, "")
              .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
          });
        }
      } catch (error) {
        console.error("Logout error:", error);
      } finally {
        // Force redirect after clearing everything
        setTimeout(() => {
          window.location.href = "/auth/login?logout=true";
        }, 500);
      }
    }

    performLogout();
  }, [router]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        bgcolor: colors.background.default,
        gap: 2,
      }}
    >
      <CircularProgress size={40} sx={{ color: colors.secondary }} />
      <Typography variant="body1" sx={{ color: colors.text.secondary }}>
        Logging out...
      </Typography>
    </Box>
  );
}
