import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface ScenarioAnalysisInput {
  currentScore: number;
  scenarioDescription: string;
  existingScenarios?: Array<{
    type: string;
    action: string;
    description: string;
  }>;
}

export interface ScenarioAnalysisResult {
  projectedScore: number;
  impactPoints: number;
  timeframeMonths: number;
  explanation: string;
  confidence: 'high' | 'medium' | 'low';
}

export interface RiskAnalysisResult {
  overallRisk: 'low' | 'medium' | 'high';
  risks: Array<{
    title: string;
    description: string;
    severity: 'low' | 'medium' | 'high';
    mitigation: string;
  }>;
}

export interface ActionPlanResult {
  targetScore: number;
  estimatedMonths: number;
  actions: Array<{
    priority: 'high' | 'medium' | 'low';
    title: string;
    description: string;
    expectedImpact: string;
    timeframe: string;
  }>;
}

export interface DetailedAnalysisResult {
  summary: string;
  scoreFactors: {
    paymentHistory: string;
    creditUtilization: string;
    creditAge: string;
    accountMix: string;
    recentInquiries: string;
  };
  recommendations: string[];
}

/**
 * Analyze a scenario and predict its impact on credit score
 */
export async function analyzeScenario(
  input: ScenarioAnalysisInput
): Promise<ScenarioAnalysisResult> {
  const systemPrompt = `You are a credit score expert. Analyze financial scenarios and predict their impact on US credit scores (FICO model). 
Consider all 5 factors: Payment History (35%), Credit Utilization (30%), Length of Credit History (15%), Credit Mix (10%), and New Credit (10%).
Provide realistic, conservative estimates.`;

  const userPrompt = `Current Credit Score: ${input.currentScore}
Scenario: ${input.scenarioDescription}
${input.existingScenarios && input.existingScenarios.length > 0 ? `
Existing Scenarios:
${input.existingScenarios.map(s => `- ${s.action}: ${s.description}`).join('\n')}
` : ''}

Analyze this scenario and provide:
1. Projected credit score after this action
2. Impact in points (+/- from current score)
3. Timeframe in months for the impact to fully materialize
4. Brief explanation of why
5. Confidence level (high/medium/low)

Respond in JSON format:
{
  "projectedScore": number,
  "impactPoints": number,
  "timeframeMonths": number,
  "explanation": "string",
  "confidence": "high|medium|low"
}`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.7,
  });

  const result = JSON.parse(completion.choices[0].message.content || '{}');
  return result;
}

/**
 * Generate comprehensive risk analysis
 */
export async function generateRiskAnalysis(
  currentScore: number,
  scenarios: Array<{ type: string; action: string; description: string; impact: number }>
): Promise<RiskAnalysisResult> {
  const systemPrompt = `You are a financial risk analyst specializing in credit scores. Analyze scenarios and identify potential risks and their mitigations.`;

  const userPrompt = `Current Credit Score: ${currentScore}
Planned Scenarios:
${scenarios.map(s => `- ${s.action} (${s.impact > 0 ? '+' : ''}${s.impact} points): ${s.description}`).join('\n')}

Identify:
1. Overall risk level (low/medium/high)
2. Specific risks with:
   - Title
   - Description
   - Severity
   - Mitigation strategy

Respond in JSON format:
{
  "overallRisk": "low|medium|high",
  "risks": [
    {
      "title": "string",
      "description": "string",
      "severity": "low|medium|high",
      "mitigation": "string"
    }
  ]
}`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.7,
  });

  const result = JSON.parse(completion.choices[0].message.content || '{}');
  return result;
}

/**
 * Generate personalized action plan
 */
export async function generateActionPlan(
  currentScore: number,
  targetScore: number,
  scenarios: Array<{ type: string; action: string; description: string }>
): Promise<ActionPlanResult> {
  const systemPrompt = `You are a credit improvement specialist. Create actionable, personalized plans to help people improve their credit scores.`;

  const userPrompt = `Current Credit Score: ${currentScore}
Target Credit Score: ${targetScore}
Current Scenarios:
${scenarios.map(s => `- ${s.action}: ${s.description}`).join('\n')}

Create a step-by-step action plan with:
1. Estimated months to reach target
2. Prioritized actions (high/medium/low priority) with:
   - Title
   - Description
   - Expected impact
   - Timeframe

Respond in JSON format:
{
  "targetScore": number,
  "estimatedMonths": number,
  "actions": [
    {
      "priority": "high|medium|low",
      "title": "string",
      "description": "string",
      "expectedImpact": "string",
      "timeframe": "string"
    }
  ]
}`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.7,
  });

  const result = JSON.parse(completion.choices[0].message.content || '{}');
  return result;
}

/**
 * Generate detailed analysis and explanations
 */
export async function generateDetailedAnalysis(
  currentScore: number,
  scenarios: Array<{ type: string; action: string; description: string; impact: number }>
): Promise<DetailedAnalysisResult> {
  const systemPrompt = `You are a credit education expert. Explain credit score factors and scenarios in clear, helpful language.`;

  const userPrompt = `Current Credit Score: ${currentScore}
Scenarios:
${scenarios.map(s => `- ${s.action} (${s.impact > 0 ? '+' : ''}${s.impact} points): ${s.description}`).join('\n')}

Provide:
1. Summary of overall impact
2. Analysis of each credit score factor:
   - Payment History (35%)
   - Credit Utilization (30%)
   - Length of Credit History (15%)
   - Credit Mix (10%)
   - New Credit/Inquiries (10%)
3. Top recommendations

Respond in JSON format:
{
  "summary": "string",
  "scoreFactors": {
    "paymentHistory": "string",
    "creditUtilization": "string",
    "creditAge": "string",
    "accountMix": "string",
    "recentInquiries": "string"
  },
  "recommendations": ["string"]
}`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.7,
  });

  const result = JSON.parse(completion.choices[0].message.content || '{}');
  return result;
}

