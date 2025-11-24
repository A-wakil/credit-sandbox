"use client"

import { useState } from 'react';
import { CreditScoreDisplay } from '../components/CreditScoreDisplay';
import { ScenarioBuilder } from '../components/ScenarioBuilder';
import { ScoreTimeline } from '../components/ScoreTimeline';
import { ScenarioCard } from '../components/ScenarioCard';
import { ExplanationPanel } from '../components/ExplanationPanel';
import { RiskAnalysis } from '../components/RiskAnalysis';
import { ImprovementPlan } from '../components/ImprovementPlan';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { TrendingUp } from 'lucide-react';

export interface Scenario {
  id: string;
  type: 'payment' | 'credit_card' | 'loan' | 'inquiry' | 'account_age' | 'credit_limit';
  action: string;
  impact: number;
  timeframe: number; // months
  description: string;
  addedAt: Date;
}

export interface TimelinePoint {
  month: number;
  score: number;
  events: string[];
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
      const monthsSinceAdded = month;
      
      if (monthsSinceAdded <= scenario.timeframe) {
        // Distribute impact over timeframe
        const monthlyChange = scenario.impact / scenario.timeframe;
        monthlyImpact += monthlyChange;
        
        if (monthsSinceAdded === 0) {
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

export default function Home() {
  const [baseScore] = useState(680);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  
  const { currentScore, timeline, totalImpact } = calculateScoreImpact(scenarios, baseScore);
  
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
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg">
              <TrendingUp className="size-6 text-white" />
            </div>
            <h1 className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              AI Credit Sandbox
            </h1>
          </div>
          <p className="text-gray-600">
            Explore how different financial decisions could hypothetically impact your U.S. credit score
          </p>
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
            <ScenarioBuilder onAddScenario={addScenario} />
            
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
            <ExplanationPanel 
              scenarios={scenarios}
              totalImpact={totalImpact}
              currentScore={currentScore}
              baseScore={baseScore}
            />
          </TabsContent>
          
          <TabsContent value="risks">
            <RiskAnalysis scenarios={scenarios} currentScore={currentScore} />
          </TabsContent>
          
          <TabsContent value="plan">
            <ImprovementPlan 
              currentScore={currentScore}
              scenarios={scenarios}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
