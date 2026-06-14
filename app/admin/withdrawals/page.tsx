import { redirect } from "next/navigation";
import { createClient as createAdminClient } from "@supabase/supabase-js";
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

  // Create admin client to bypass RLS
  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Fetch initial withdrawals data
  const { data: withdrawals, count, error } = await supabaseAdmin
    .from("withdrawals")
    .select(`
      id,
      user_id,
      amount,
      method,
      wallet_address,
      status,
      created_at
    `, { count: 'exact' })
    .order("created_at", { ascending: false })
    .range(0, PAGE_SIZE - 1);

  if (error) {
    console.error("Error fetching withdrawals:", error);
  }

  // Fetch auth users to get emails
  const { data: authData } = await supabaseAdmin.auth.admin.listUsers();
  const usersList = authData?.users || [];

  // Transform data to match expected format
  const transformedWithdrawals = withdrawals?.map((w: any) => {
    const authUser = usersList.find(u => u.id === w.user_id);
    return {
      id: w.id,
      user_id: w.user_id,
      coins: w.amount,
      amount_usd: w.amount / 1000, // 1000 coins = $1
      crypto_address: w.wallet_address,
      status: w.status,
      requested_at: w.created_at,
      user_email: authUser?.email || 'Unknown User',
    };
  }) || [];

  return (
    <AdminShell>
      <AdminWithdrawalsClient
        initialWithdrawals={transformedWithdrawals}
        initialTotal={count || 0}
      />
    </AdminShell>
  );
}
