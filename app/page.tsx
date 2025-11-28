"use client"

import { useState, useEffect } from 'react';
import { CreditScoreDisplay } from '../components/CreditScoreDisplay';
import { ScenarioBuilder } from '../components/ScenarioBuilder';
import { ScoreTimeline } from '../components/ScoreTimeline';
import { ScenarioCard } from '../components/ScenarioCard';
import { AIAnalysisPanel } from '../components/AIAnalysisPanel';
import { AIRiskAnalysis } from '../components/AIRiskAnalysis';
import { AIActionPlan } from '../components/AIActionPlan';
import { SimulationHistory } from '../components/SimulationHistory';
import { AICreditCoach } from '../components/AICreditCoach';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { TrendingUp, Save, Loader2, RefreshCw } from 'lucide-react';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { UserNav } from '../components/UserNav';
import { useAuth } from '@/lib/auth-context';
import { 
  createSimulation, 
  getSimulationWithScenarios,
  addScenario as addScenarioDB,
  removeScenario as removeScenarioDB,
  createCreditProfile,
  getActiveCreditProfile,
  logActivity
} from '@/lib/supabase/actions';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { createSupabaseClient } from '@/lib/supabase/client';

export interface Scenario {
  id: string;
  type: 'payment' | 'credit_card' | 'loan' | 'inquiry' | 'account_age' | 'credit_limit';
  action: string;
  impact: number;
  timeframe: number; // months
  description: string;
  month?: string; // Target month for the scenario
  addedAt: Date;
}

export interface TimelinePoint {
  month: number;
  score: number;
  events: string[];
}

// Helper function to convert "Month Year" format (e.g., "March 2027") to month offset from now
function getMonthOffset(monthYear: string | undefined): number {
  if (!monthYear) return 0; // Default to current month (month 0) if no month specified
  
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-11
  
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  // Parse "Month Year" format (e.g., "March 2027")
  const parts = monthYear.trim().split(' ');
  if (parts.length < 2) return 0; // Invalid format, default to 0
  
  const monthName = parts[0];
  const year = parseInt(parts[1]);
  
  if (isNaN(year)) return 0; // Invalid year, default to 0
  
  const monthIndex = monthNames.findIndex(m => m.toLowerCase() === monthName.toLowerCase());
  if (monthIndex < 0) return 0; // Invalid month name, default to 0
  
  // Calculate month offset: (targetYear - currentYear) * 12 + (targetMonth - currentMonth)
  const yearDiff = year - currentYear;
  const monthOffset = (yearDiff * 12) + (monthIndex - currentMonth);
  
  // Ensure non-negative offset (can't select past months)
  return Math.max(0, monthOffset);
}

function calculateScoreImpact(scenarios: Scenario[], baseScore: number): {
  currentScore: number;
  timeline: TimelinePoint[];
  totalImpact: number;
} {
  const timeline: TimelinePoint[] = [];
  let currentScore = baseScore;
  
  // Create timeline for next 24 months
  for (let month = 0; month <= 24; month++) {
    const events: string[] = [];
    let monthlyImpact = 0;
    
    scenarios.forEach(scenario => {
      // Get the month offset for this scenario (e.g., "March 2027" -> 16 months from now)
      const scenarioStartMonth = getMonthOffset(scenario.month);
      
      // Calculate how many months since this scenario started
      const monthsSinceStarted = month - scenarioStartMonth;
      
      // Only apply impact if:
      // 1. We've reached or passed the start month (monthsSinceStarted >= 0)
      // 2. We're still within the timeframe (monthsSinceStarted <= scenario.timeframe)
      if (monthsSinceStarted >= 0 && monthsSinceStarted <= scenario.timeframe) {
        // Distribute impact over timeframe
        const monthlyChange = scenario.impact / scenario.timeframe;
        monthlyImpact += monthlyChange;
        
        // Add event when scenario starts
        if (monthsSinceStarted === 0) {
          events.push(scenario.action);
        }
      }
    });
    
    currentScore = Math.max(300, Math.min(850, currentScore + monthlyImpact));
    timeline.push({ month, score: Math.round(currentScore), events });
  }
  
  const totalImpact = currentScore - baseScore;
  
  return {
    currentScore: Math.round(currentScore),
    timeline,
    totalImpact: Math.round(totalImpact)
  };
}

function HomePage() {
  const { user } = useAuth();
  const [baseScore, setBaseScore] = useState(680);
  const [editingScore, setEditingScore] = useState(false);
  const [tempScore, setTempScore] = useState('680');
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [simulationId, setSimulationId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  const { currentScore, timeline, totalImpact} = calculateScoreImpact(scenarios, baseScore);

  const handleScoreUpdate = () => {
    const score = parseInt(tempScore);
    if (score >= 300 && score <= 850) {
      setBaseScore(score);
      setEditingScore(false);
    }
  };

  // Load user's credit profile and latest simulation on mount
  useEffect(() => {
    if (!user) return;
    
    const loadUserData = async () => {
      try {
        // Get or create credit profile
        let profile = await getActiveCreditProfile(user.id);
        
        if (!profile) {
          // Create initial profile
          profile = await createCreditProfile({
            user_id: user.id,
            current_score: 680,
            score_model: 'FICO',
            is_active: true,
          });
          setBaseScore(680);
        } else {
          setBaseScore(profile.current_score || 680);
        }

        // Load most recent simulation
        const supabase = createSupabaseClient();
        const { data: recentSimulation } = await supabase
          .from('simulations')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (recentSimulation) {
          // Load scenarios for this simulation
          const { data: scenariosData } = await supabase
            .from('scenarios')
            .select('*')
            .eq('simulation_id', recentSimulation.id)
            .order('display_order', { ascending: true });

          if (scenariosData && scenariosData.length > 0) {
            // Restore the simulation
            setSimulationId(recentSimulation.id);
            const loadedScenarios: Scenario[] = scenariosData.map((s: any) => ({
              id: s.id,
              type: s.scenario_type,
              action: s.action_name,
              impact: s.impact_points,
              timeframe: s.timeframe_months,
              description: s.description || '',
              addedAt: new Date(s.created_at),
            }));
            setScenarios(loadedScenarios);
          }
        }

        // Log activity
        await logActivity(user.id, 'page_view', {
          resourceType: 'page',
          metadata: { page: 'home' }
        });
        
        setLoading(false);
      } catch (error) {
        console.error('Error loading user data:', error);
        setLoading(false);
      }
    };

    loadUserData();
  }, [user]);
  
  const addScenario = (scenario: Omit<Scenario, 'id' | 'addedAt'>) => {
    const newScenario: Scenario = {
      ...scenario,
      id: Date.now().toString(),
      addedAt: new Date()
    };
    setScenarios([...scenarios, newScenario]);
  };
  
  const removeScenario = (id: string) => {
    setScenarios(scenarios.filter(s => s.id !== id));
    if (selectedScenario?.id === id) {
      setSelectedScenario(null);
    }
  };
  
  const clearAllScenarios = () => {
    setScenarios([]);
    setSelectedScenario(null);
    setSimulationId(null);
  };

  const saveSimulation = async () => {
    if (!user || scenarios.length === 0) return;
    
    setSaving(true);
    setSaveMessage(null);

    try {
      // Archive old simulation first
      if (simulationId) {
        const supabase = createSupabaseClient();
        await supabase
          .from('simulations')
          .update({ status: 'archived' })
          .eq('id', simulationId);
      }

      // Create new simulation
      const simulation = await createSimulation({
        user_id: user.id,
        name: `Simulation ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`,
        base_score: baseScore,
        projected_score: currentScore,
        status: 'active',
        simulation_data: {
          totalImpact,
          scenarioCount: scenarios.length,
        },
      });

      setSimulationId(simulation.id);

      // Save each scenario
      for (let i = 0; i < scenarios.length; i++) {
        const scenario = scenarios[i];
        await addScenarioDB({
          user_id: user.id,
          simulation_id: simulation.id,
          scenario_type: scenario.type,
          action_name: scenario.action,
          impact_points: scenario.impact,
          timeframe_months: scenario.timeframe,
          display_order: i,
          description: scenario.description,
        });
      }

      // Log activity
      await logActivity(user.id, 'simulation_created', {
        resourceType: 'simulation',
        resourceId: simulation.id,
        metadata: { scenarioCount: scenarios.length }
      });

      setSaveMessage('Simulation saved! It will automatically load when you return.');
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      console.error('Error saving simulation:', error);
      setSaveMessage('Failed to save simulation');
    } finally {
      setSaving(false);
    }
  };

  const startNewSimulation = () => {
    setScenarios([]);
    setSelectedScenario(null);
    setSimulationId(null);
    setSaveMessage('Started new simulation');
    setTimeout(() => setSaveMessage(null), 2000);
  };

  const loadSimulation = async (id: string) => {
    setLoading(true);
    try {
      const supabase = createSupabaseClient();
      
      // Load simulation
      const { data: simulation } = await supabase
        .from('simulations')
        .select('*')
        .eq('id', id)
        .single();

      if (!simulation) {
        setSaveMessage('Simulation not found');
        return;
      }

      // Load scenarios
      const { data: scenariosData } = await supabase
        .from('scenarios')
        .select('*')
        .eq('simulation_id', id)
        .order('display_order', { ascending: true });

      if (scenariosData) {
        setSimulationId(simulation.id);
        setBaseScore(simulation.base_score);
        const loadedScenarios: Scenario[] = scenariosData.map((s: any) => ({
          id: s.id,
          type: s.scenario_type,
          action: s.action_name,
          impact: s.impact_points,
          timeframe: s.timeframe_months,
          description: s.description || '',
          addedAt: new Date(s.created_at),
        }));
        setScenarios(loadedScenarios);
        setSaveMessage('Simulation loaded successfully');
        setTimeout(() => setSaveMessage(null), 2000);
      }
    } catch (error) {
      console.error('Error loading simulation:', error);
      setSaveMessage('Failed to load simulation');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg">
                <TrendingUp className="size-6 text-white" />
              </div>
              <div>
                <h1 className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                  AI Credit Sandbox
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <SimulationHistory 
                onLoadSimulation={loadSimulation}
                currentSimulationId={simulationId}
              />
              {scenarios.length > 0 && (
                <Button 
                  onClick={startNewSimulation} 
                  variant="outline"
                  disabled={saving}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  New
                </Button>
              )}
              <Button 
                onClick={saveSimulation} 
                disabled={saving || scenarios.length === 0}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    {simulationId ? 'Update' : 'Save'}
                  </>
                )}
              </Button>
              <UserNav />
            </div>
          </div>
          {saveMessage && (
            <Alert className="mb-4 bg-green-50 border-green-200">
              <AlertDescription className="text-green-800">
                {saveMessage}
              </AlertDescription>
            </Alert>
          )}
          <div className="flex items-center gap-4">
            <p className="text-gray-600">
              Starting Credit Score:
            </p>
            {editingScore ? (
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="300"
                  max="850"
                  value={tempScore}
                  onChange={(e) => setTempScore(e.target.value)}
                  className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                  onKeyPress={(e) => e.key === 'Enter' && handleScoreUpdate()}
                />
                <Button size="sm" onClick={handleScoreUpdate}>
                  Save
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => {
                    setEditingScore(false);
                    setTempScore(baseScore.toString());
                  }}
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setEditingScore(true);
                  setTempScore(baseScore.toString());
                }}
                className="font-semibold text-blue-600 hover:text-blue-700 underline"
              >
                {baseScore}
              </button>
            )}
          </div>
        </div>
        
        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Main Score Display */}
          <div className="lg:col-span-1">
            <CreditScoreDisplay 
              score={currentScore}
              baseScore={baseScore}
              totalImpact={totalImpact}
            />
          </div>
          
          {/* Timeline Chart */}
          <div className="lg:col-span-2">
            <ScoreTimeline timeline={timeline} baseScore={baseScore} />
          </div>
        </div>
        
        {/* Main Content Tabs */}
        <Tabs defaultValue="scenarios" className="space-y-6">
          <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-4">
            <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
            <TabsTrigger value="risks">Risks</TabsTrigger>
            <TabsTrigger value="plan">Action Plan</TabsTrigger>
          </TabsList>

          <TabsContent value="scenarios" className="space-y-6">
            <ScenarioBuilder 
              onAddScenario={addScenario}
              currentScore={currentScore}
              existingScenarios={scenarios}
            />
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2>Active Scenarios ({scenarios.length})</h2>
                {scenarios.length > 0 && (
                  <button
                    onClick={clearAllScenarios}
                    className="text-sm text-red-600 hover:text-red-700"
                  >
                    Clear All
                  </button>
                )}
              </div>
              
              {scenarios.length === 0 ? (
                <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                  <p className="text-gray-500">
                    No scenarios yet. Add your first financial action above to see how it could impact your credit score.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {scenarios.map(scenario => (
                    <ScenarioCard
                      key={scenario.id}
                      scenario={scenario}
                      onRemove={removeScenario}
                      onSelect={setSelectedScenario}
                      isSelected={selectedScenario?.id === scenario.id}
                    />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="analysis">
            <AIAnalysisPanel 
              scenarios={scenarios}
              currentScore={currentScore}
              baseScore={baseScore}
              simulationId={simulationId}
              userId={user?.id || ''}
            />
          </TabsContent>
          
          <TabsContent value="risks">
            <AIRiskAnalysis 
              scenarios={scenarios}
              currentScore={currentScore}
              simulationId={simulationId}
              userId={user?.id || ''}
            />
          </TabsContent>
          
          <TabsContent value="plan">
            <AIActionPlan 
              currentScore={currentScore}
              scenarios={scenarios}
              simulationId={simulationId}
              userId={user?.id || ''}
            />
          </TabsContent>
        </Tabs>
      </div>
      
      {/* AI Credit Coach Chatbot */}
      <AICreditCoach currentScore={currentScore} />
    </div>
  );
}

export default function Home() {
  return (
    <ProtectedRoute>
      <HomePage />
    </ProtectedRoute>
  );
}
