"use client";

import { useEffect } from "react";
import { useAuth } from "@/lib/contexts/AuthContext";

interface BalanceUpdaterProps {
  userId: string;
}

export default function BalanceUpdater({ userId }: BalanceUpdaterProps) {
  const { user } = useAuth();

  useEffect(() => {
  }, [userId, user]);

  return null;
}
