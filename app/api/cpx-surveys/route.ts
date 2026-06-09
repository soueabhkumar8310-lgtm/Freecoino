import { NextResponse } from 'next/server';

export async function GET() {
  // Placeholder: Return empty surveys array
  // TODO: Integrate real CPX Research API
  return NextResponse.json({
    surveys: [],
    status: 'success'
  });
}
