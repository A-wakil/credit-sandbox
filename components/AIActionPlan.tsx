'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Loader2, Sparkles, Target, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { Badge } from './ui/badge';
import { saveActionPlan, loadActionPlan } from '@/lib/supabase/ai-actions';

interface AIActionPlanProps {
  currentScore: number;
  scenarios: Array<{
    type: string;
    action: string;
    description: string;
  }>;
  simulationId: string | null;
  userId: string;
}

interface ActionPlanData {
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

const priorityConfig = {
  high: { color: 'text-red-600', bgColor: 'bg-red-50', borderColor: 'border-red-200', label: 'High Priority' },
  medium: { color: 'text-yellow-600', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-200', label: 'Medium Priority' },
  low: { color: 'text-blue-600', bgColor: 'bg-blue-50', borderColor: 'border-blue-200', label: 'Low Priority' },
};

export function AIActionPlan({ currentScore, scenarios, simulationId, userId }: AIActionPlanProps) {
  const [targetScore, setTargetScore] = useState(currentScore + 50);
  const [planData, setPlanData] = useState<ActionPlanData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load saved action plan when simulationId changes
  useEffect(() => {
    if (simulationId && scenarios.length > 0) {
      loadActionPlan(simulationId)
        .then(savedPlan => {
          if (savedPlan) {
            setPlanData(savedPlan);
            setTargetScore(savedPlan.targetScore);
          }
        })
        .catch(err => console.error('Error loading saved plan:', err));
    } else {
      setPlanData(null);
    }
  }, [simulationId]);

  const generateActionPlan = async () => {
    if (scenarios.length === 0) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/generate-action-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentScore,
          targetScore,
          scenarios,
        }),
      });

      if (!response.ok) throw new Error('Failed to generate action plan');

      const data = await response.json();
      setPlanData(data);

      // Save to database if we have a simulationId
      if (simulationId) {
        try {
          await saveActionPlan(simulationId, userId, data);
        } catch (saveErr) {
          console.error('Error saving action plan:', saveErr);
        }
      }
    } catch (err) {
      setError('Failed to generate action plan. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (scenarios.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            AI Action Plan
          </CardTitle>
          <CardDescription>Add scenarios to get a personalized improvement plan</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 text-center py-8">
            Add financial scenarios to get AI-powered step-by-step action plan.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-600" />
          AI Action Plan
        </CardTitle>
        <CardDescription>Personalized steps to reach your credit goals</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Target Score Input */}
        <div className="p-5 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg border border-purple-200">
          <div className="space-y-3">
            <Label htmlFor="target-score" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Target Credit Score
            </Label>
            <div className="flex gap-3">
              <Input
                id="target-score"
                type="number"
                min={currentScore}
                max="850"
                value={targetScore}
                onChange={(e) => setTargetScore(parseInt(e.target.value) || currentScore)}
                className="max-w-[150px]"
              />
              <Button 
                onClick={generateActionPlan}
                disabled={loading || targetScore <= currentScore}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Plan
                  </>
                )}
              </Button>
            </div>
            <p className="text-xs text-gray-600">
              Current: {currentScore} → Target: {targetScore} ({targetScore - currentScore > 0 ? '+' : ''}{targetScore - currentScore} points)
            </p>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
            <p className="text-sm text-gray-600">AI is creating your action plan...</p>
          </div>
        ) : planData ? (
          <>
            {/* Timeline */}
            <div className="p-5 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-semibold">Estimated Timeline</p>
                  <p className="text-sm text-gray-600">
                    Approximately <span className="font-semibold text-blue-600">{planData.estimatedMonths} months</span> to reach {planData.targetScore}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Steps */}
            <div className="space-y-4">
              <h3 className="font-semibold">Step-by-Step Actions</h3>
              <div className="space-y-3">
                {planData.actions.map((action, index) => {
                  const config = priorityConfig[action.priority];
                  
                  return (
                    <div 
                      key={index}
                      className={`p-5 rounded-lg border ${config.bgColor} ${config.borderColor}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 bg-white border-2 border-current rounded-full font-bold text-sm">
                          {index + 1}
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-semibold">{action.title}</h4>
                            <Badge variant={action.priority === 'high' ? 'destructive' : 'secondary'} className="text-xs">
                              {config.label}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-700">{action.description}</p>
                          <div className="grid grid-cols-2 gap-3 pt-2">
                            <div className="p-3 bg-white rounded border border-gray-200">
                              <p className="text-xs font-semibold text-gray-600 mb-1">EXPECTED IMPACT</p>
                              <p className="text-sm font-medium text-green-600">{action.expectedImpact}</p>
                            </div>
                            <div className="p-3 bg-white rounded border border-gray-200">
                              <p className="text-xs font-semibold text-gray-600 mb-1">TIMEFRAME</p>
                              <p className="text-sm font-medium text-gray-900">{action.timeframe}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Success Message */}
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-green-900">Follow this plan consistently</p>
                <p className="text-xs text-green-700 mt-1">
                  By following these steps, you have a strong chance of reaching your target score within the estimated timeframe.
                </p>
              </div>
            </div>
          </>
        ) : null}
      </CardContent>
    </Card>
  );
}

