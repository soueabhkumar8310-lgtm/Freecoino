import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import AdminShell from "@/components/admin-shell";
import AdminUsersClient from "@/components/admin-users-client";

export default async function AdminUsersPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'soueabhkumar8310@gmail.com';
  if (user.email !== ADMIN_EMAIL) {
    redirect("/");
  }

  // Create admin client to fetch all auth users
  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Fetch all profiles
  const { data: profiles, error: profilesError } = await supabaseAdmin
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (profilesError) {
    console.error("Error fetching profiles:", profilesError);
  }

  // Fetch all auth users to get emails
  const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers();
  
  if (authError) {
    console.error("Error fetching auth users:", authError);
  }

  // Merge profile data with auth email
  const mergedUsers = (profiles || []).map((profile) => {
    const authUser = authUsers?.users?.find((u) => u.id === profile.id);
    return {
      id: profile.id,
      email: authUser?.email || "Unknown Email",
      displayName: profile.display_name || "Unknown User",
      coinsBalance: profile.coins_balance || 0,
      referralCode: profile.referral_code || "N/A",
      createdAt: profile.created_at,
    };
  });

  return (
    <AdminShell>
      <AdminUsersClient users={mergedUsers} />
    </AdminShell>
  );
}
