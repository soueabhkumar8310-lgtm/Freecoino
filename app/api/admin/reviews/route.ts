import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Service role client for admin operations
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// GET - Fetch all reviews for admin
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') || 'all';

    let query = supabaseAdmin
      .from('reviews')
      .select(`
        id,
        user_id,
        rating,
        title,
        comment,
        status,
        created_at,
        profiles!inner(display_name, avatar_url)
      `)
      .order('created_at', { ascending: false });

    if (status !== 'all') {
      query = query.eq('status', status);
    }

    const { data: reviews, error } = await query;

    if (error) {
      console.error('Error fetching admin reviews:', error);
      return NextResponse.json(
        { error: 'Failed to fetch reviews' },
        { status: 500 }
      );
    }

    // Transform data
    const transformedReviews = reviews?.map((r: any) => ({
      id: r.id,
      user_id: r.user_id,
      rating: r.rating,
      title: r.title,
      comment: r.comment,
      status: r.status,
      created_at: r.created_at,
      user_name: r.profiles?.display_name || 'Anonymous',
      user_email: r.profiles?.email || 'Unknown',
      user_avatar: r.profiles?.avatar_url || null,
    })) || [];

    return NextResponse.json({
      reviews: transformedReviews,
      total: transformedReviews.length,
    });
  } catch (error) {
    console.error('Admin reviews API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH - Update review status (approve/reject)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { reviewId, status } = body;

    if (!reviewId || !status) {
      return NextResponse.json(
        { error: 'Missing review ID or status' },
        { status: 400 }
      );
    }

    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    const { data: updated, error: updateError } = await supabaseAdmin
      .from('reviews')
      .update({ status })
      .eq('id', reviewId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating review:', updateError);
      return NextResponse.json(
        { error: 'Failed to update review' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      review: updated,
    });
  } catch (error) {
    console.error('Update review error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a review
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const reviewId = searchParams.get('id');

    if (!reviewId) {
      return NextResponse.json(
        { error: 'Missing review ID' },
        { status: 400 }
      );
    }

    const { error: deleteError } = await supabaseAdmin
      .from('reviews')
      .delete()
      .eq('id', reviewId);

    if (deleteError) {
      console.error('Error deleting review:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete review' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Review deleted successfully',
    });
  } catch (error) {
    console.error('Delete review error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
