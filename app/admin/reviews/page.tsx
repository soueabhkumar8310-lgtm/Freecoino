import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminShell from "@/components/admin-shell";
import AdminReviewsClient from "@/components/admin-reviews-client";

export default async function AdminReviewsPage() {
  const supabase = await createClient();
  
  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Check admin access (only allow specific email)
  const ADMIN_EMAIL = "soueabhkumar8310@gmail.com";
  if (user.email !== ADMIN_EMAIL) {
    redirect("/");
  }

  return (
    <AdminShell>
      <AdminReviewsClient />
    </AdminShell>
  );
}
