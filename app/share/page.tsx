import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";
import ShareContent from "@/components/share-content";

export const metadata: Metadata = {
  title: "Freecoino — Paisa Kaise Kamayein? Surveys, Tasks & Offers",
  description:
    "Freecoino se paisa kamayein! Surveys bharein, tasks complete karein, offers me hissa lein. Minimum $2 withdrawal. Free hai, join karein!",
  openGraph: {
    title: "Freecoino — Paisa Kaise Kamayein?",
    description:
      "Surveys, tasks, offers, referrals — Freecoino se real paisa kamayein. $2 minimum withdrawal.",
    images: ["/logo.png"],
  },
  alternates: {
    canonical: "https://freecoino.com/share",
  },
};

export default async function SharePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let referralCode: string | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("referral_code")
      .eq("id", user.id)
      .single();
    if (profile?.referral_code) {
      referralCode = profile.referral_code;
    }
  }

  return <ShareContent referralCode={referralCode} />;
}
