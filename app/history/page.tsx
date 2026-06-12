"use client";

import { useAuth } from "@/lib/contexts/AuthContext";
import AppShell from "@/components/app-shell";
import HistoryClient from "@/components/history-client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { mockUser, mockCompletions } from "@/lib/mock-data";

export default function HistoryPage() {
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
      <HistoryClient
        userId={mockUser.id}
        initialCompletions={mockCompletions}
        initialTotal={mockCompletions.length}
      />
    </AppShell>
  );
}
