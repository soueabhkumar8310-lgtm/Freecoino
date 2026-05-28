"use client";

import { useAuth } from "@/lib/hooks/useAuth";
import AppShell from "@/components/app-shell";
import CashoutClient from "@/components/cashout-client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { mockUser, mockWithdrawals } from "@/lib/mock-data";

export default function CashoutPage() {
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
      <CashoutClient
        userId={mockUser.id}
        initialCoins={mockUser.coins_balance}
        initialWithdrawals={mockWithdrawals}
        initialTotal={mockWithdrawals.length}
        isBanned={false}
        emailVerified={mockUser.email_verified}
        fraudStatus="clean"
        fraudNotification={null}
        savedCryptoAddress={mockUser.crypto_address}
      />
    </AppShell>
  );
}
