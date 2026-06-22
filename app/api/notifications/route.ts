import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('user_id');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: notifications, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching notifications:', error);
      return NextResponse.json({ notifications: [], unread_count: 0 });
    }

    const unreadCount = notifications?.filter((n) => !n.is_read).length || 0;
    const mapped = notifications?.map((n) => ({
      id: n.id,
      title: n.title,
      message: n.message,
      read: n.is_read,
      created_at: n.created_at,
      is_broadcast: false,
    })) || [];

    return NextResponse.json({
      notifications: mapped,
      unread_count: unreadCount,
    });
  } catch (error) {
    console.error('Notifications API error:', error);
    return NextResponse.json({ notifications: [], unread_count: 0 });
  }
}
