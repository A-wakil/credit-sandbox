// Server actions for database operations
import { createSupabaseClient } from './client';
import type { Database } from './database.types';

type CreditProfile = Database['public']['Tables']['credit_profiles']['Insert'];
type Simulation = Database['public']['Tables']['simulations']['Insert'];
type Scenario = Database['public']['Tables']['scenarios']['Insert'];
type TimelineProjection = Database['public']['Tables']['timeline_projections']['Insert'];

/**
 * Create a new credit profile for a user
 */
export async function createCreditProfile(profile: CreditProfile) {
  const supabase = createSupabaseClient();

  const { data, error } = await supabase
    .from('credit_profiles')
    .insert(profile)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get user's active credit profile
 */
export async function getActiveCreditProfile(userId: string) {
  const supabase = createSupabaseClient();

  const { data, error } = await supabase
    .from('credit_profiles')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // No rows returned
    throw error;
  }

  return data;
}

/**
 * Update a credit profile
 */
export async function updateCreditProfile(
  profileId: string,
  updates: Database['public']['Tables']['credit_profiles']['Update']
) {
  const supabase = createSupabaseClient();

  const { data, error } = await supabase
    .from('credit_profiles')
    .update(updates)
    .eq('id', profileId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Create a new simulation
 */
export async function createSimulation(simulation: Simulation) {
  const supabase = createSupabaseClient();

  const { data, error } = await supabase
    .from('simulations')
    .insert(simulation)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get a simulation by ID with its scenarios
 */
export async function getSimulationWithScenarios(simulationId: string) {
  const supabase = createSupabaseClient();

  const { data: simulation, error: simError } = await supabase
    .from('simulations')
    .select('*')
    .eq('id', simulationId)
    .single();

  if (simError) throw simError;

  const { data: scenarios, error: scenariosError } = await supabase
    .from('scenarios')
    .select('*')
    .eq('simulation_id', simulationId)
    .order('display_order', { ascending: true });

  if (scenariosError) throw scenariosError;

  return {
    ...simulation,
    scenarios: scenarios || [],
  };
}

/**
 * Add a scenario to a simulation
 */
export async function addScenario(scenario: Scenario) {
  const supabase = createSupabaseClient();

  const { data, error } = await supabase
    .from('scenarios')
    .insert(scenario)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Remove a scenario
 */
export async function removeScenario(scenarioId: string) {
  const supabase = createSupabaseClient();

  const { error } = await supabase
    .from('scenarios')
    .delete()
    .eq('id', scenarioId);

  if (error) throw error;
}

/**
 * Save timeline projections for a simulation
 */
export async function saveTimelineProjections(
  projections: TimelineProjection[]
) {
  const supabase = createSupabaseClient();

  const { data, error } = await supabase
    .from('timeline_projections')
    .insert(projections)
    .select();

  if (error) throw error;
  return data;
}

/**
 * Get timeline projections for a simulation
 */
export async function getTimelineProjections(simulationId: string) {
  const supabase = createSupabaseClient();

  const { data, error } = await supabase
    .from('timeline_projections')
    .select('*')
    .eq('simulation_id', simulationId)
    .order('month_offset', { ascending: true });

  if (error) throw error;
  return data;
}

/**
 * Log user activity
 */
export async function logActivity(
  userId: string,
  activityType: string,
  metadata?: {
    resourceType?: string;
    resourceId?: string;
    metadata?: any;
  }
) {
  const supabase = createSupabaseClient();

  const { error } = await supabase.from('user_activity_log').insert({
    user_id: userId,
    activity_type: activityType,
    resource_type: metadata?.resourceType || null,
    resource_id: metadata?.resourceId || null,
    metadata: metadata?.metadata || {},
  });

  if (error) console.error('Failed to log activity:', error);
}

/**
 * Get user's recent activity
 */
export async function getUserActivity(userId: string, limit = 50) {
  const supabase = createSupabaseClient();

  const { data, error } = await supabase
    .from('user_activity_log')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}

/**
 * Create an improvement plan
 */
export async function createImprovementPlan(
  plan: Database['public']['Tables']['saved_improvement_plans']['Insert']
) {
  const supabase = createSupabaseClient();

  const { data, error } = await supabase
    .from('saved_improvement_plans')
    .insert(plan)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get user's improvement plans
 */
export async function getImprovementPlans(userId: string) {
  const supabase = createSupabaseClient();

  const { data, error } = await supabase
    .from('saved_improvement_plans')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

/**
 * Update improvement plan progress
 */
export async function updateImprovementPlanProgress(
  planId: string,
  progress: number,
  status?: 'active' | 'completed' | 'abandoned' | 'archived'
) {
  const supabase = createSupabaseClient();

  const updates: any = { progress_percentage: progress };
  if (status) updates.status = status;
  if (status === 'completed') updates.completed_at = new Date().toISOString();

  const { data, error } = await supabase
    .from('saved_improvement_plans')
    .update(updates)
    .eq('id', planId)
    .select()
    .single();

  if (error) throw error;
  return data;
}


