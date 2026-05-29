"use client";

import { useAuth } from "@/lib/hooks/useAuth";
import AppShell from "@/components/app-shell";
import CashoutClient from "@/components/cashout-client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CircularProgress, Box } from "@mui/material";

export default function CashoutPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [withdrawals, setWithdrawals] = useState([]);
  const [total, setTotal] = useState(0);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth/login");
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    async function fetchWithdrawals() {
      if (!user) return;
      
      try {
        const res = await fetch('/api/withdrawals?page=0&pageSize=5');
        if (res.ok) {
          const data = await res.json();
          setWithdrawals(data.withdrawals || []);
          setTotal(data.total || 0);
        }
      } catch (error) {
        console.error('Error fetching withdrawals:', error);
      } finally {
        setDataLoading(false);
      }
    }

    if (user) {
      fetchWithdrawals();
    }
  }, [user]);

  if (isLoading || !user || dataLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
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
      <CashoutClient
        userId={user.id}
        initialCoins={user.coins_balance || 0}
        initialWithdrawals={withdrawals}
        initialTotal={total}
        isBanned={false}
        emailVerified={true}
        fraudStatus="clean"
        fraudNotification={null}
        savedCryptoAddress=""
      />
    </AppShell>
  );
}
