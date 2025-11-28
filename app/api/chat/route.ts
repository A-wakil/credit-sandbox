import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { messages } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    const systemPrompt = `You are a friendly and knowledgeable AI Credit Coach. Your role is to help people understand credit scores, credit reports, and how to improve their credit health.

Key guidelines:
- Explain credit concepts in simple, easy-to-understand language
- Use analogies when helpful (like explaining credit utilization like someone is 12 years old)
- Be encouraging and supportive
- Provide accurate information about US credit scores (FICO model)
- Focus on the 5 main credit factors: Payment History (35%), Credit Utilization (30%), Length of Credit History (15%), Credit Mix (10%), and New Credit (10%)
- Answer questions about credit reports, late payments, account management, and credit improvement strategies
- Keep responses conversational and helpful, not overly formal
- If asked about specific numbers or timelines, provide realistic estimates

Remember: You're here to educate and empower users to make better credit decisions.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const assistantMessage = completion.choices[0].message.content;

    return NextResponse.json({ 
      message: assistantMessage 
    });
  } catch (error) {
    console.error('Error in chat API:', error);
    return NextResponse.json(
      { error: 'Failed to get response from AI coach' },
      { status: 500 }
    );
  }
}


