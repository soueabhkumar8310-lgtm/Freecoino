"use client";

import { useAuth } from "@/lib/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Box, CircularProgress, Alert } from "@mui/material";
import AdminShell from "@/components/admin-shell";
import AdminDashboardClient from "@/components/admin-dashboard-client";
import colors from "@/theme/colors";
import Typography from "@/components/ui/Typography";

// Admin email - only this user can access admin panel
const ADMIN_EMAIL = "soueabhkumar8310@gmail.com";

export default function AdminPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        // Not logged in - redirect to login
        router.push("/auth/login");
      } else if (user.email === ADMIN_EMAIL) {
        // User is admin
        setIsAdmin(true);
        setChecking(false);
      } else {
        // User is not admin - show access denied
        setIsAdmin(false);
        setChecking(false);
      }
    }
  }, [user, isLoading, router]);

  // Loading state
  if (isLoading || checking) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: colors.background.default,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress size={40} sx={{ color: colors.secondary }} />
      </Box>
    );
  }

  // Access denied state
  if (!isAdmin) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: colors.background.default,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: 2,
        }}
      >
        <Box sx={{ maxWidth: 500, textAlign: "center" }}>
          <Alert severity="error" sx={{ mb: 3 }}>
            Access Denied
          </Alert>
          <Typography variant="h5" isBold sx={{ mb: 2, color: colors.text.primary }}>
            Admin Access Required
          </Typography>
          <Typography sx={{ color: colors.text.secondary, mb: 3 }}>
            You don't have permission to access the admin panel.
            <br />
            Logged in as: <strong>{user?.email}</strong>
          </Typography>
          <Box
            component="a"
            href="/"
            sx={{
              color: colors.secondary,
              textDecoration: "none",
              "&:hover": { textDecoration: "underline" },
            }}
          >
            Go back to homepage
          </Box>
        </Box>
      </Box>
    );
  }

  // Admin panel
  return (
    <AdminShell>
      <AdminDashboardClient
        totalUsers={0}
        totalCoins={0}
        pendingWithdrawals={0}
        totalCompletions={0}
        bannedUsers={0}
      />
    </AdminShell>
  );
}
