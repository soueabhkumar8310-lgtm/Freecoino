import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function sendDeletionEmail(email: string, token: string) {
  const brevoApiKey = process.env.BREVO_API_KEY;
  if (!brevoApiKey) throw new Error("BREVO_API_KEY not configured");

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.freecoino.com";
  const confirmUrl = `${siteUrl}/api/account/delete-confirm?token=${token}`;

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirm account deletion</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0a0e17; color: #ffffff;">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
      <tr>
        <td align="center">
          <h1 style="color: #ffffff; margin: 16px 0 20px 0; font-size: 24px; font-weight: 700;">
            <span style="color: #10B981;">Free</span>coino
          </h1>
        </td>
      </tr>
      <tr>
        <td style="background-color: #111827; border-radius: 12px; padding: 40px;">
          <h2 style="margin: 0 0 20px 0; font-size: 22px;">Confirm account deletion</h2>
          <p style="color: #9ca3af; margin: 0 0 24px 0; line-height: 1.6;">
            We received a request to permanently delete your Freecoino account. This will remove
            your account, balance, completions, withdrawals, referrals and all other personal data.
            This action cannot be undone.
          </p>
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td align="center">
                <a href="${confirmUrl}" style="display: inline-block; background: #dc2626; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 700; font-size: 16px;">
                  Permanently Delete My Account
                </a>
              </td>
            </tr>
          </table>
          <p style="color: #6b7280; margin: 24px 0 0 0; font-size: 14px;">
            This link will expire in 24 hours. If you didn't request this, you can safely ignore this email.
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>
`;

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": brevoApiKey,
    },
    body: JSON.stringify({
      sender: {
        name: process.env.BREVO_FROM_NAME || "Freecoino",
        email: process.env.BREVO_FROM_EMAIL || "noreply@freecoino.com",
      },
      to: [{ email }],
      subject: "Confirm deletion of your Freecoino account",
      htmlContent,
    }),
  });

  if (!response.ok) {
    console.error("Brevo error deleting account email:", response.status, await response.text());
    throw new Error("Failed to send deletion email");
  }
}

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("email")
    .eq("id", user.id)
    .maybeSingle();

  if (userError || !userData) {
    return NextResponse.json({ error: "User profile not found" }, { status: 404 });
  }

  const admin = createAdminClient();

  const { data: token, error: tokenError } = await admin
    .from("account_deletion_tokens")
    .insert({ user_id: user.id })
    .select("token")
    .single();

  if (tokenError || !token) {
    console.error("Error creating deletion token:", tokenError);
    return NextResponse.json({ error: "Failed to create confirmation token" }, { status: 500 });
  }

  try {
    await sendDeletionEmail(userData.email, token.token);
  } catch (emailError: unknown) {
    console.error("Error sending deletion email:", emailError);
    return NextResponse.json({ error: "Failed to send confirmation email. Please try again." }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}