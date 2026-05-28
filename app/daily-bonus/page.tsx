"use client";

import { useAuth } from "@/lib/hooks/useAuth";
import AppShell from "@/components/app-shell";
import DailyBonusClient from "@/components/daily-bonus-client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { mockUser } from "@/lib/mock-data";

export default function DailyBonusPage() {
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

  return (
    <AppShell
      coins={mockUser.coins_balance}
      userId={mockUser.id}
      userName={mockUser.display_name}
      userAvatar={undefined}
    >
      <DailyBonusClient
        streakCount={mockUser.streak_count}
        alreadyClaimed={false}
        todayReward={null}
        todayStreak={null}
        todayCoinsEarned={500}
      />
    </AppShell>
  );
}
