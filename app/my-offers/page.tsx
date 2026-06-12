"use client";

import { useAuth } from "@/lib/contexts/AuthContext";
import AppShell from "@/components/app-shell";
import MyOffersClient from "@/components/my-offers-client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { mockUser } from "@/lib/mock-data";

export default function MyOffersPage() {
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
      <MyOffersClient userId={mockUser.id} />
    </AppShell>
  );
}
