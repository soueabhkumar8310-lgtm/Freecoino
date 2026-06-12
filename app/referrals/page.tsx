"use client";

import { useAuth } from "@/lib/contexts/AuthContext";
import AppShell from "@/components/app-shell";
import ReferralsClient from "@/components/referrals-client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { mockUser, mockReferrals } from "@/lib/mock-data";

export default function ReferralsPage() {
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
      <ReferralsClient
        referralCode={mockUser.referral_code}
        totalReferrals={mockReferrals.length}
        totalCoins={850}
        referrals={mockReferrals}
        pendingEarnings={200}
      />
    </AppShell>
  );
}
