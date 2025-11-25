import { NextResponse } from 'next/server';
import { generateRiskAnalysis } from '@/lib/openai';

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

    const analysis = await generateRiskAnalysis(currentScore, scenarios);

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Error generating risk analysis:', error);
    return NextResponse.json(
      { error: 'Failed to generate risk analysis' },
      { status: 500 }
    );
  }
}

