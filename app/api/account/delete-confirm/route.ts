import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.freecoino.com";

  if (!token) {
    return NextResponse.redirect(new URL("/auth/login?error=no_token", siteUrl));
  }

  const admin = createAdminClient();

  const { data: tokenData, error: tokenError } = await admin
    .from("account_deletion_tokens")
    .select("id, user_id, expires_at")
    .eq("token", token)
    .single();

  if (tokenError || !tokenData) {
    return NextResponse.redirect(new URL("/auth/login?error=invalid_token", siteUrl));
  }

  if (new Date(tokenData.expires_at) < new Date()) {
    await admin.from("account_deletion_tokens").delete().eq("id", tokenData.id);
    return NextResponse.redirect(new URL("/auth/login?error=expired_token", siteUrl));
  }

  const { error: deleteError } = await admin.rpc("delete_user_account", {
    p_user_id: tokenData.user_id,
  });

  if (deleteError) {
    console.error("Error deleting account:", deleteError);
    return NextResponse.redirect(new URL("/auth/login?error=delete_failed", siteUrl));
  }

  await admin.from("account_deletion_tokens").delete().eq("id", tokenData.id);

  return NextResponse.redirect(new URL("/account-deleted?success=true", siteUrl));
}