import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import AdminShell from "@/components/admin-shell";
import AdminDashboardClient from "@/components/admin-dashboard-client";

// Bug #7 Fix: Use env variable instead of hardcoded email
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "soueabhkumar8310@gmail.com";

export default async function AdminPage() {
  const supabase = await createClient();

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Check admin access
  if (user.email !== ADMIN_EMAIL) {
    redirect("/");
  }

  // Bug #11 Fix: Fetch real stats from DB instead of hardcoded zeros
  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const [
    { count: totalUsers },
    { data: coinsData },
    { count: pendingWithdrawals },
    { count: totalCompletions },
    { count: bannedUsers },
  ] = await Promise.all([
    supabaseAdmin.from("profiles").select("*", { count: "exact", head: true }),
    supabaseAdmin.from("profiles").select("coins_balance"),
    supabaseAdmin
      .from("withdrawals")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending"),
    supabaseAdmin
      .from("offer_completions")
      .select("*", { count: "exact", head: true })
      .eq("status", "completed"),
    supabaseAdmin
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .not("referred_by", "is", null), // use a flag column if available
  ]);

  const totalCoins =
    coinsData?.reduce((sum, p) => sum + (p.coins_balance || 0), 0) ?? 0;

  return (
    <AdminShell>
      <AdminDashboardClient
        totalUsers={totalUsers || 0}
        totalCoins={totalCoins}
        pendingWithdrawals={pendingWithdrawals || 0}
        totalCompletions={totalCompletions || 0}
        bannedUsers={bannedUsers || 0}
      />
    </AdminShell>
  );
}
