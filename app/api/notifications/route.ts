import { NextResponse } from 'next/server';

export async function GET() {
  // Placeholder: Return empty notifications array
  return NextResponse.json({
    notifications: [],
    unread_count: 0
  });
}
