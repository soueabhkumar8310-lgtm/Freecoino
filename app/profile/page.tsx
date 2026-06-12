"use client";

import { useAuth } from "@/lib/contexts/AuthContext";
import AppShell from "@/components/app-shell";
import ProfileClient from "@/components/profile-client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Box, CircularProgress } from "@mui/material";
import colors from "@/theme/colors";

export default function ProfilePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth/login");
    } else if (user) {
      // Fetch real profile data
      // For now, using basic user data from auth
      setProfileData({
        totalCompletions: 0, // TODO: Fetch from database
        totalWithdrawals: 0, // TODO: Fetch from database
        monthEarned: 0, // TODO: Calculate from database
        memberSince: new Date().toISOString(), // TODO: Get from user metadata
      });
      setLoading(false);
    }
  }, [user, isLoading, router]);

  if (isLoading || loading || !user) {
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

  return (
    <AppShell
      coins={user.coins_balance || 0}
      userId={user.id}
      userName={user.name}
      userAvatar={user.avatar}
    >
      <ProfileClient
        userId={user.id}
        email={user.email}
        displayName={user.name}
        cryptoAddress="" // TODO: Get from database
        totalEarned={user.coins_balance || 0}
        streakCount={0} // TODO: Get from database
        totalCompletions={profileData.totalCompletions}
        totalWithdrawals={profileData.totalWithdrawals}
        monthEarned={profileData.monthEarned}
        memberSince={profileData.memberSince}
        emailVerified={true} // Supabase users are email verified
        referredBy={null} // TODO: Get from database
      />
    </AppShell>
  );
}
