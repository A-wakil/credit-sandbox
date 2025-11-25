import { NextResponse } from 'next/server';
import { generateActionPlan } from '@/lib/openai';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { currentScore, targetScore, scenarios } = body;

    if (!currentScore || !targetScore || !scenarios) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const plan = await generateActionPlan(currentScore, targetScore, scenarios);

    return NextResponse.json(plan);
  } catch (error) {
    console.error('Error generating action plan:', error);
    return NextResponse.json(
      { error: 'Failed to generate action plan' },
      { status: 500 }
    );
  }
}

