// Server actions for AI-generated content persistence
import { createSupabaseClient } from './client';

/**
 * Save or update AI analysis for a simulation
 */
export async function saveAIAnalysis(
  simulationId: string,
  userId: string,
  analysis: {
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
) {
  const supabase = createSupabaseClient();

  const { data, error } = await supabase
    .from('simulation_ai_analysis')
    .upsert({
      simulation_id: simulationId,
      user_id: userId,
      summary: analysis.summary,
      payment_history_analysis: analysis.scoreFactors.paymentHistory,
      credit_utilization_analysis: analysis.scoreFactors.creditUtilization,
      credit_age_analysis: analysis.scoreFactors.creditAge,
      account_mix_analysis: analysis.scoreFactors.accountMix,
      recent_inquiries_analysis: analysis.scoreFactors.recentInquiries,
      recommendations: analysis.recommendations,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Load AI analysis for a simulation
 */
export async function loadAIAnalysis(simulationId: string) {
  const supabase = createSupabaseClient();

  const { data, error } = await supabase
    .from('simulation_ai_analysis')
    .select('*')
    .eq('simulation_id', simulationId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // No data found
    throw error;
  }

  // Transform back to component format
  return {
    summary: data.summary,
    scoreFactors: {
      paymentHistory: data.payment_history_analysis,
      creditUtilization: data.credit_utilization_analysis,
      creditAge: data.credit_age_analysis,
      accountMix: data.account_mix_analysis,
      recentInquiries: data.recent_inquiries_analysis,
    },
    recommendations: data.recommendations,
  };
}

/**
 * Save or update risk analysis for a simulation
 */
export async function saveRiskAnalysis(
  simulationId: string,
  userId: string,
  riskData: {
    overallRisk: 'low' | 'medium' | 'high';
    risks: Array<{
      title: string;
      description: string;
      severity: 'low' | 'medium' | 'high';
      mitigation: string;
    }>;
  }
) {
  const supabase = createSupabaseClient();

  const { data, error } = await supabase
    .from('simulation_risk_analysis')
    .upsert({
      simulation_id: simulationId,
      user_id: userId,
      overall_risk: riskData.overallRisk,
      risks: riskData.risks,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Load risk analysis for a simulation
 */
export async function loadRiskAnalysis(simulationId: string) {
  const supabase = createSupabaseClient();

  const { data, error } = await supabase
    .from('simulation_risk_analysis')
    .select('*')
    .eq('simulation_id', simulationId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // No data found
    throw error;
  }

  return {
    overallRisk: data.overall_risk as 'low' | 'medium' | 'high',
    risks: data.risks,
  };
}

/**
 * Save or update action plan for a simulation
 */
export async function saveActionPlan(
  simulationId: string,
  userId: string,
  planData: {
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
) {
  const supabase = createSupabaseClient();

  const { data, error } = await supabase
    .from('simulation_action_plans')
    .upsert({
      simulation_id: simulationId,
      user_id: userId,
      target_score: planData.targetScore,
      estimated_months: planData.estimatedMonths,
      actions: planData.actions,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Load action plan for a simulation
 */
export async function loadActionPlan(simulationId: string) {
  const supabase = createSupabaseClient();

  const { data, error } = await supabase
    .from('simulation_action_plans')
    .select('*')
    .eq('simulation_id', simulationId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // No data found
    throw error;
  }

  return {
    targetScore: data.target_score,
    estimatedMonths: data.estimated_months,
    actions: data.actions,
  };
}

