import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppShell from "@/components/app-shell";
import ReferralsClient from "@/components/referrals-client";

export default async function ReferralsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Fetch current user's profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("coins_balance, display_name, avatar_url, referral_code")
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect("/");
  }

  // Fetch real referrals (users who used this user's ID as referred_by)
  const { data: referredUsers } = await supabase
    .from("profiles")
    .select("id, display_name, created_at")
    .eq("referred_by", user.id)
    .order("created_at", { ascending: false });

  // Fetch total earned from referrals
  const { data: transactions } = await supabase
    .from("transactions")
    .select("amount")
    .eq("user_id", user.id)
    .eq("type", "referral");

  const totalEarned =
    transactions?.reduce((sum, tx) => sum + tx.amount, 0) || 0;

  // Format referrals for the client component
  const formattedReferrals =
    referredUsers?.map((u) => ({
      id: u.id,
      masked_email: u.display_name, // Using display name instead of masked email for privacy
      created_at: u.created_at,
    })) || [];

  return (
    <AppShell
      coins={profile.coins_balance}
      userId={user.id}
      userName={profile.display_name}
      userAvatar={profile.avatar_url}
    >
      <ReferralsClient
        referralCode={profile.referral_code}
        totalReferrals={formattedReferrals.length}
        totalCoins={totalEarned}
        referrals={formattedReferrals}
        pendingEarnings={0}
      />
    </AppShell>
  );
}
