import { NextResponse } from 'next/server';

export async function GET() {
  // Placeholder: Return empty offers array
  // TODO: Integrate real Revtoo API
  return NextResponse.json({
    offers: [],
    status: 'success'
  });
}
