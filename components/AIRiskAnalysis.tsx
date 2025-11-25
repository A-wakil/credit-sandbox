'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Loader2, Sparkles, AlertTriangle, Shield, AlertCircle } from 'lucide-react';
import { Badge } from './ui/badge';
import { saveRiskAnalysis, loadRiskAnalysis } from '@/lib/supabase/ai-actions';

interface AIRiskAnalysisProps {
  currentScore: number;
  scenarios: Array<{
    type: string;
    action: string;
    description: string;
    impact: number;
  }>;
  simulationId: string | null;
  userId: string;
}

interface RiskData {
  overallRisk: 'low' | 'medium' | 'high';
  risks: Array<{
    title: string;
    description: string;
    severity: 'low' | 'medium' | 'high';
    mitigation: string;
  }>;
}

const riskConfig = {
  low: { color: 'text-green-600', bgColor: 'bg-green-50', borderColor: 'border-green-200', icon: Shield },
  medium: { color: 'text-yellow-600', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-200', icon: AlertTriangle },
  high: { color: 'text-red-600', bgColor: 'bg-red-50', borderColor: 'border-red-200', icon: AlertCircle },
};

export function AIRiskAnalysis({ currentScore, scenarios, simulationId, userId }: AIRiskAnalysisProps) {
  const [riskData, setRiskData] = useState<RiskData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generateRiskAnalysis = async (forceRegenerate = false) => {
    if (scenarios.length === 0) return;

    // If we have a simulationId and not forcing regeneration, try to load from DB first
    if (simulationId && !forceRegenerate) {
      try {
        const savedRisks = await loadRiskAnalysis(simulationId);
        if (savedRisks) {
          setRiskData(savedRisks);
          return; // Use cached analysis
        }
      } catch (err) {
        console.error('Error loading saved risks:', err);
      }
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/generate-risk-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentScore,
          scenarios,
        }),
      });

      if (!response.ok) throw new Error('Failed to generate risk analysis');

      const data = await response.json();
      setRiskData(data);

      // Save to database if we have a simulationId
      if (simulationId) {
        try {
          await saveRiskAnalysis(simulationId, userId, data);
        } catch (saveErr) {
          console.error('Error saving risks:', saveErr);
        }
      }
    } catch (err) {
      setError('Failed to generate risk analysis. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Load saved risks when simulationId changes
  useEffect(() => {
    if (simulationId && scenarios.length > 0) {
      generateRiskAnalysis(false); // Try to load from DB
    } else if (scenarios.length === 0) {
      setRiskData(null);
    }
  }, [simulationId]);

  // Regenerate when scenarios count changes (but not on initial load if we have saved data)
  useEffect(() => {
    if (scenarios.length > 0 && !simulationId) {
      generateRiskAnalysis(true); // Force regenerate for new simulations
    }
  }, [scenarios.length]);

  if (scenarios.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            AI Risk Analysis
          </CardTitle>
          <CardDescription>Add scenarios to see potential risks</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 text-center py-8">
            Add financial scenarios to get AI-powered risk assessment and mitigation strategies.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              AI Risk Analysis
            </CardTitle>
            <CardDescription>Identify and mitigate potential risks</CardDescription>
          </div>
          <Button 
            onClick={() => generateRiskAnalysis(true)}
            disabled={loading}
            size="sm"
            variant="outline"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Regenerate
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
            <p className="text-sm text-gray-600">AI is analyzing risks...</p>
          </div>
        ) : riskData ? (
          <>
            {/* Overall Risk Level */}
            <div className={`p-6 rounded-lg border ${riskConfig[riskData.overallRisk].bgColor} ${riskConfig[riskData.overallRisk].borderColor}`}>
              <div className="flex items-center gap-3 mb-2">
                {React.createElement(riskConfig[riskData.overallRisk].icon, {
                  className: `h-6 w-6 ${riskConfig[riskData.overallRisk].color}`
                })}
                <h3 className="font-semibold text-lg">Overall Risk Level</h3>
                <Badge 
                  variant={riskData.overallRisk === 'low' ? 'default' : 'destructive'}
                  className="ml-auto"
                >
                  {riskData.overallRisk.toUpperCase()}
                </Badge>
              </div>
              <p className={`text-sm ${riskConfig[riskData.overallRisk].color}`}>
                {riskData.overallRisk === 'low' && 'Your planned actions have minimal risk to your credit score.'}
                {riskData.overallRisk === 'medium' && 'Some of your actions carry moderate risk. Review mitigation strategies carefully.'}
                {riskData.overallRisk === 'high' && 'Warning: Your planned actions carry significant risk. Consider the mitigation strategies seriously.'}
              </p>
            </div>

            {/* Individual Risks */}
            <div className="space-y-4">
              <h3 className="font-semibold">Identified Risks</h3>
              <div className="space-y-4">
                {riskData.risks.map((risk, index) => {
                  const config = riskConfig[risk.severity];
                  const Icon = config.icon;
                  
                  return (
                    <div key={index} className={`p-5 rounded-lg border ${config.bgColor} ${config.borderColor}`}>
                      <div className="flex items-start gap-3 mb-3">
                        <Icon className={`h-5 w-5 ${config.color} mt-0.5`} />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold">{risk.title}</h4>
                            <Badge 
                              variant={risk.severity === 'low' ? 'secondary' : 'destructive'}
                              className="text-xs"
                            >
                              {risk.severity}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-700 mb-3">{risk.description}</p>
                          <div className="p-3 bg-white rounded border border-gray-200">
                            <p className="text-xs font-semibold text-gray-600 mb-1">MITIGATION STRATEGY</p>
                            <p className="text-sm text-gray-700">{risk.mitigation}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        ) : null}
      </CardContent>
    </Card>
  );
}

