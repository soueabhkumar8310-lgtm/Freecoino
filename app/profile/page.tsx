"use client";

import { useAuth } from "@/lib/hooks/useAuth";
import AppShell from "@/components/app-shell";
import ProfileClient from "@/components/profile-client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { mockUser, mockCompletions } from "@/lib/mock-data";

export default function ProfilePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth/login");
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return null;
  }

  const totalCompletions = mockCompletions.length;
  const monthEarned = mockCompletions.reduce((sum, c) => sum + c.coins_awarded, 0);

  return (
    <AppShell
      coins={mockUser.coins_balance}
      userId={mockUser.id}
      userName={mockUser.display_name}
      userAvatar={undefined}
    >
      <ProfileClient
        userId={mockUser.id}
        email={mockUser.email}
        displayName={mockUser.display_name}
        cryptoAddress={mockUser.crypto_address}
        totalEarned={mockUser.total_earned}
        streakCount={mockUser.streak_count}
        totalCompletions={totalCompletions}
        totalWithdrawals={3}
        monthEarned={monthEarned}
        memberSince={mockUser.created_at}
        emailVerified={mockUser.email_verified}
        referredBy={null}
      />
    </AppShell>
  );
}
