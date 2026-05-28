"use client";

import { useAuth } from "@/lib/hooks/useAuth";
import FullscreenShell from "@/components/fullscreen-shell";
import AllOffersClient from "@/components/all-offers-client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { mockUser } from "@/lib/mock-data";

export default function AllOffersPage() {
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
    <FullscreenShell
      coins={mockUser.coins_balance}
      userName={mockUser.display_name}
      userAvatar={mockUser.avatar_url}
      userId={mockUser.id}
    >
      <AllOffersClient userId={mockUser.id} />
    </FullscreenShell>
  );
}
