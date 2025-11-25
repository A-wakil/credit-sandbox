// TypeScript types for Supabase database
// You can auto-generate these using: npx supabase gen types typescript --project-id YOUR_PROJECT_ID

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          created_at: string
          updated_at: string
          last_login_at: string | null
          preferences: Json
          total_simulations: number
          total_scenarios_created: number
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          created_at?: string
          updated_at?: string
          last_login_at?: string | null
          preferences?: Json
          total_simulations?: number
          total_scenarios_created?: number
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          created_at?: string
          updated_at?: string
          last_login_at?: string | null
          preferences?: Json
          total_simulations?: number
          total_scenarios_created?: number
        }
      }
      credit_profiles: {
        Row: {
          id: string
          user_id: string
          profile_name: string
          is_active: boolean
          payment_history: number
          credit_utilization: number
          credit_age: number
          account_mix: number
          hard_inquiries: number
          credit_limit: number
          current_debt: number
          missed_payments: number
          calculated_score: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          profile_name?: string
          is_active?: boolean
          payment_history: number
          credit_utilization: number
          credit_age: number
          account_mix: number
          hard_inquiries?: number
          credit_limit: number
          current_debt: number
          missed_payments?: number
          calculated_score?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          profile_name?: string
          is_active?: boolean
          payment_history?: number
          credit_utilization?: number
          credit_age?: number
          account_mix?: number
          hard_inquiries?: number
          credit_limit?: number
          current_debt?: number
          missed_payments?: number
          calculated_score?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      simulations: {
        Row: {
          id: string
          user_id: string
          credit_profile_id: string | null
          name: string | null
          description: string | null
          base_score: number
          projected_score: number | null
          total_impact: number | null
          status: string
          simulation_data: Json
          created_at: string
          updated_at: string
          completed_at: string | null
          scenarios_count: number
          view_count: number
        }
        Insert: {
          id?: string
          user_id: string
          credit_profile_id?: string | null
          name?: string | null
          description?: string | null
          base_score: number
          projected_score?: number | null
          total_impact?: number | null
          status?: string
          simulation_data?: Json
          created_at?: string
          updated_at?: string
          completed_at?: string | null
          scenarios_count?: number
          view_count?: number
        }
        Update: {
          id?: string
          user_id?: string
          credit_profile_id?: string | null
          name?: string | null
          description?: string | null
          base_score?: number
          projected_score?: number | null
          total_impact?: number | null
          status?: string
          simulation_data?: Json
          created_at?: string
          updated_at?: string
          completed_at?: string | null
          scenarios_count?: number
          view_count?: number
        }
      }
      scenarios: {
        Row: {
          id: string
          user_id: string
          simulation_id: string | null
          scenario_type: string
          action_name: string
          description: string | null
          impact_points: number
          timeframe_months: number
          risk_level: string | null
          is_template: boolean | null
          is_custom: boolean | null
          template_id: string | null
          display_order: number | null
          created_at: string
          applied_at: string
        }
        Insert: {
          id?: string
          user_id: string
          simulation_id?: string | null
          scenario_type: string
          action_name: string
          description?: string | null
          impact_points: number
          timeframe_months: number
          risk_level?: string | null
          is_template?: boolean | null
          is_custom?: boolean | null
          template_id?: string | null
          display_order?: number | null
          created_at?: string
          applied_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          simulation_id?: string | null
          scenario_type?: string
          action_name?: string
          description?: string | null
          impact_points?: number
          timeframe_months?: number
          risk_level?: string | null
          is_template?: boolean | null
          is_custom?: boolean | null
          template_id?: string | null
          display_order?: number | null
          created_at?: string
          applied_at?: string
        }
      }
      timeline_projections: {
        Row: {
          id: string
          simulation_id: string
          user_id: string
          month_offset: number
          projected_score: number
          events: Json
          score_breakdown: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          simulation_id: string
          user_id: string
          month_offset: number
          projected_score: number
          events?: Json
          score_breakdown?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          simulation_id?: string
          user_id?: string
          month_offset?: number
          projected_score?: number
          events?: Json
          score_breakdown?: Json | null
          created_at?: string
        }
      }
      user_activity_log: {
        Row: {
          id: string
          user_id: string
          activity_type: string
          resource_type: string | null
          resource_id: string | null
          metadata: Json
          user_agent: string | null
          ip_address: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          activity_type: string
          resource_type?: string | null
          resource_id?: string | null
          metadata?: Json
          user_agent?: string | null
          ip_address?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          activity_type?: string
          resource_type?: string | null
          resource_id?: string | null
          metadata?: Json
          user_agent?: string | null
          ip_address?: string | null
          created_at?: string
        }
      }
      saved_improvement_plans: {
        Row: {
          id: string
          user_id: string
          simulation_id: string | null
          plan_name: string
          current_score: number
          target_score: number
          recommended_actions: Json
          estimated_timeframe_months: number | null
          status: string
          progress_percentage: number
          ai_explanation: string | null
          created_at: string
          updated_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          simulation_id?: string | null
          plan_name: string
          current_score: number
          target_score: number
          recommended_actions?: Json
          estimated_timeframe_months?: number | null
          status?: string
          progress_percentage?: number
          ai_explanation?: string | null
          created_at?: string
          updated_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          simulation_id?: string | null
          plan_name?: string
          current_score?: number
          target_score?: number
          recommended_actions?: Json
          estimated_timeframe_months?: number | null
          status?: string
          progress_percentage?: number
          ai_explanation?: string | null
          created_at?: string
          updated_at?: string
          completed_at?: string | null
        }
      }
    }
  }
}


