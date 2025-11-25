import { NextResponse } from 'next/server';
import { generateDetailedAnalysis } from '@/lib/openai';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { currentScore, scenarios } = body;

    if (!currentScore || !scenarios) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const analysis = await generateDetailedAnalysis(currentScore, scenarios);

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Error generating analysis:', error);
    return NextResponse.json(
      { error: 'Failed to generate analysis' },
      { status: 500 }
    );
  }
}

