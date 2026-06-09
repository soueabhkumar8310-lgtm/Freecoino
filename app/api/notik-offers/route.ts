import { NextResponse } from 'next/server';

export async function GET() {
  // Placeholder: Return empty offers array
  // TODO: Integrate real Notik API
  return NextResponse.json({
    offers: [],
    status: 'success'
  });
}
