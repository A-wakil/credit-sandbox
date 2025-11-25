import { NextResponse } from 'next/server';
import { analyzeScenario } from '@/lib/openai';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { currentScore, scenarioDescription, existingScenarios } = body;

    if (!currentScore || !scenarioDescription) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const analysis = await analyzeScenario({
      currentScore,
      scenarioDescription,
      existingScenarios,
    });

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Error analyzing scenario:', error);
    return NextResponse.json(
      { error: 'Failed to analyze scenario' },
      { status: 500 }
    );
  }
}

