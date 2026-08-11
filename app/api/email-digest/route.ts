import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
const fromEmail = process.env.EMAIL_FROM || "noreply@freecoino.com";

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();
    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const supabase = await createClient();

    const { data: profile } = await supabase
      .from("users")
      .select("email, display_name, coins_balance, total_earned")
      .eq("id", userId)
      .single();

    if (!profile?.email) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const { data: weeklyCompletions } = await supabase
      .from("completions")
      .select("coins_awarded, created_at")
      .eq("player_id", userId)
      .gte("created_at", weekAgo);

    const weeklyEarned = (weeklyCompletions || []).reduce((sum, c) => sum + (c.coins_awarded || 0), 0);
    const completionCount = (weeklyCompletions || []).length;

    const html = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"></head>
      <body style="font-family: Arial, sans-serif; background: #f4f4f4; padding: 24px;">
        <div style="max-width: 560px; margin: 0 auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.08);">
          <div style="background: linear-gradient(135deg, #01D676 0%, #00B894 100%); padding: 32px; text-align: center;">
            <h1 style="color: #fff; margin: 0; font-size: 24px;">📊 Your Weekly Digest</h1>
            <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0 0;">Freecoino</p>
          </div>
          <div style="padding: 32px;">
            <p style="color: #333; font-size: 16px;">Hi ${profile.display_name || "there"},</p>
            <p style="color: #666; font-size: 14px;">Here's your earnings summary for the past week:</p>
            <div style="display: flex; gap: 16px; margin: 24px 0; flex-wrap: wrap;">
              <div style="flex: 1; min-width: 120px; background: #f0fdf4; border-radius: 8px; padding: 16px; text-align: center;">
                <p style="color: #059669; font-size: 24px; font-weight: 700; margin: 0;">${weeklyEarned.toLocaleString()}</p>
                <p style="color: #666; font-size: 12px; margin: 4px 0 0 0;">Coins Earned This Week</p>
              </div>
              <div style="flex: 1; min-width: 120px; background: #f0fdf4; border-radius: 8px; padding: 16px; text-align: center;">
                <p style="color: #059669; font-size: 24px; font-weight: 700; margin: 0;">${completionCount}</p>
                <p style="color: #666; font-size: 12px; margin: 4px 0 0 0;">Offers Completed</p>
              </div>
            </div>
            <div style="background: #f8fafc; border-radius: 8px; padding: 16px; margin: 16px 0;">
              <p style="color: #333; font-size: 14px; margin: 0 0 8px 0;"><strong>Total Balance:</strong> ${profile.coins_balance?.toLocaleString() || 0} coins</p>
              <p style="color: #333; font-size: 14px; margin: 0;"><strong>Lifetime Earnings:</strong> ${profile.total_earned?.toLocaleString() || 0} coins</p>
            </div>
            <a href="https://freecoino.com/earn" style="display: block; text-align: center; background: linear-gradient(135deg, #01D676 0%, #00B894 100%); color: #fff; text-decoration: none; padding: 14px; border-radius: 8px; font-weight: 600; margin: 24px 0 0 0;">Start Earning More</a>
          </div>
          <div style="background: #f8fafc; padding: 16px 32px; text-align: center;">
            <p style="color: #999; font-size: 11px; margin: 0;">You received this email because you opted into weekly digests. <a href="https://freecoino.com/settings" style="color: #059669;">Unsubscribe</a></p>
          </div>
        </div>
      </body>
      </html>
    `;

    if (resendApiKey) {
      const resend = new Resend(resendApiKey);
      await resend.emails.send({
        from: fromEmail,
        to: profile.email,
        subject: `📊 Your Freecoino Weekly Digest — ${weeklyEarned.toLocaleString()} coins earned`,
        html,
      });
    }

    return NextResponse.json({ success: true, weeklyEarned, completionCount });
  } catch (error: any) {
    console.error("Email digest error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
