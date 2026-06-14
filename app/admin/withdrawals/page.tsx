import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminShell from "@/components/admin-shell";
import AdminWithdrawalsClient from "@/components/admin-withdrawals-client";

const PAGE_SIZE = 20;

export default async function AdminWithdrawalsPage() {
  const supabase = await createClient();
  
  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Check admin access — Bug #7 Fix: env variable use karo
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'soueabhkumar8310@gmail.com';
  if (user.email !== ADMIN_EMAIL) {
    redirect("/");
  }

  // Fetch initial withdrawals data
  const { data: withdrawals, count, error } = await supabase
    .from("withdrawals")
    .select(`
      id,
      user_id,
      amount,
      method,
      wallet_address,
      status,
      created_at,
      profiles!inner(display_name)
    `, { count: 'exact' })
    .order("created_at", { ascending: false })
    .range(0, PAGE_SIZE - 1);

  if (error) {
    console.error("Error fetching withdrawals:", error);
  }

  // Transform data to match expected format
  const transformedWithdrawals = withdrawals?.map((w: any) => ({
    id: w.id,
    user_id: w.user_id,
    coins: w.amount,
    amount_usd: w.amount / 1000, // 1000 coins = $1
    crypto_address: w.wallet_address,
    status: w.status,
    tx_hash: w.tx_hash,
    requested_at: w.created_at,
    user_email: w.profiles?.display_name || 'Unknown User',
  })) || [];

  return (
    <AdminShell>
      <AdminWithdrawalsClient
        initialWithdrawals={transformedWithdrawals}
        initialTotal={count || 0}
      />
    </AdminShell>
  );
}
