"use client";

import { useAuth } from "@/lib/hooks/useAuth";
import FullscreenShell from "@/components/fullscreen-shell";
import EarnContent from "@/components/earn-content";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function EarnPage() {
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
      coins={0} // TODO: Get from database
      userName={user.name}
      userAvatar={user.avatar}
      userId={user.id}
    >
      <EarnContent
        userId={user.id}
        userName={user.name}
        userEmail={user.email}
      />
    </FullscreenShell>
  );
}