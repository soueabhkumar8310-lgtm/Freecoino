import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("user_id");

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const supabase = await createServerClient();

    // Verify authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only allow users to fetch their own offers, or an admin
    if (user.id !== userId && user.email !== process.env.ADMIN_EMAIL) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Use admin client to bypass RLS if needed, though RLS should allow reading own completions
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Fetch offer completions for this user
    const { data: completions, error: completionsError } = await supabaseAdmin
      .from("offer_completions")
      .select("*")
      .eq("user_id", userId)
      .order("completed_at", { ascending: false });

    if (completionsError) {
      console.error("Error fetching offer completions:", completionsError);
      return NextResponse.json({ error: "Failed to fetch offers" }, { status: 500 });
    }

    // Group into started, in_progress, completed
    const started: any[] = [];
    const inProgress: any[] = [];
    const completed: any[] = [];

    // Map database rows to the expected UI format (OfferInteraction)
    completions?.forEach((offer) => {
      const eventsData = Array.isArray(offer.events_json) ? offer.events_json : [];
      const payoutValue = offer.status === "completed"
        ? (offer.amount_earned ?? offer.coins_awarded ?? 0)
        : (offer.payout_potential ?? 0);

      const mappedOffer = {
        id: offer.id,
        offer_id: offer.offer_id,
        offer_name: offer.offer_name,
        provider: offer.offer_provider,
        image_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(
          offer.offer_name
        )}&background=random`,
        payout: payoutValue,
        tracking_type: "cpa",
        status: offer.status === "pending" ? "in_progress" : offer.status,
        events_json: eventsData,
        clicked_at: offer.completed_at || offer.created_at,
        click_url: offer.click_url || "#",
        milestone_progress: {
          completed_count: offer.status === "completed" ? (eventsData.length || 1) : 0,
          total_count: eventsData.length || 1,
          completed_milestone_ids: [],
          completed_milestones: [],
        },
      };

      if (offer.status === "pending") {
        inProgress.push(mappedOffer);
      } else if (offer.status === "completed") {
        completed.push(mappedOffer);
      }
      // 'rejected' ones can just be ignored or put in started/in_progress depending on business logic
      // We will ignore rejected ones for now to keep it clean.
    });

    const responseData = {
      started,
      in_progress: inProgress,
      completed,
      total: (completions?.length || 0),
    };

    return NextResponse.json({
      success: true,
      data: responseData,
    });
  } catch (error) {
    console.error("My offers API catch error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
