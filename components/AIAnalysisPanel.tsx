'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Loader2, Sparkles, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import { Badge } from './ui/badge';
import { saveAIAnalysis, loadAIAnalysis } from '@/lib/supabase/ai-actions';

interface AIAnalysisPanelProps {
  currentScore: number;
  baseScore: number;
  scenarios: Array<{
    type: string;
    action: string;
    description: string;
    impact: number;
  }>;
  simulationId: string | null;
  userId: string;
}

interface AnalysisData {
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

export function AIAnalysisPanel({ currentScore, baseScore, scenarios, simulationId, userId }: AIAnalysisPanelProps) {
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generateAnalysis = async (forceRegenerate = false) => {
    if (scenarios.length === 0) return;

    // If we have a simulationId and not forcing regeneration, try to load from DB first
    if (simulationId && !forceRegenerate) {
      try {
        const savedAnalysis = await loadAIAnalysis(simulationId);
        if (savedAnalysis) {
          setAnalysis(savedAnalysis);
          return; // Use cached analysis
        }
      } catch (err) {
        console.error('Error loading saved analysis:', err);
      }
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/generate-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentScore,
          scenarios,
        }),
      });

      if (!response.ok) throw new Error('Failed to generate analysis');

      const data = await response.json();
      setAnalysis(data);

      // Save to database if we have a simulationId
      if (simulationId) {
        try {
          await saveAIAnalysis(simulationId, userId, data);
        } catch (saveErr) {
          console.error('Error saving analysis:', saveErr);
          // Don't show error to user, analysis still works
        }
      }
    } catch (err) {
      setError('Failed to generate AI analysis. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Load saved analysis when simulationId changes
  useEffect(() => {
    if (simulationId && scenarios.length > 0) {
      generateAnalysis(false); // Try to load from DB
    } else if (scenarios.length === 0) {
      setAnalysis(null);
    }
  }, [simulationId]);

  // Regenerate when scenarios count changes (but not on initial load if we have saved data)
  useEffect(() => {
    if (scenarios.length > 0 && !simulationId) {
      generateAnalysis(true); // Force regenerate for new simulations
    }
  }, [scenarios.length]);

  const totalImpact = currentScore - baseScore;

  const factorLabels = {
    paymentHistory: 'Payment History (35%)',
    creditUtilization: 'Credit Utilization (30%)',
    creditAge: 'Length of Credit History (15%)',
    accountMix: 'Credit Mix (10%)',
    recentInquiries: 'New Credit (10%)',
  };

  if (scenarios.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            AI-Powered Analysis
          </CardTitle>
          <CardDescription>Add scenarios to see personalized AI analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 text-center py-8">
            Add financial scenarios to get AI-powered insights about their impact on your credit score.
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
              AI-Powered Analysis
            </CardTitle>
            <CardDescription>Personalized insights based on your scenarios</CardDescription>
          </div>
          <Button 
            onClick={() => generateAnalysis(true)}
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
            <p className="text-sm text-gray-600">AI is analyzing your scenarios...</p>
          </div>
        ) : analysis ? (
          <>
            {/* Overall Impact Summary */}
            <div className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border border-purple-200">
              <div className="flex items-center gap-3 mb-3">
                {totalImpact > 0 ? (
                  <TrendingUp className="h-6 w-6 text-green-600" />
                ) : totalImpact < 0 ? (
                  <TrendingDown className="h-6 w-6 text-red-600" />
                ) : null}
                <h3 className="font-semibold text-lg">Overall Impact</h3>
                <Badge variant={totalImpact > 0 ? 'default' : 'destructive'} className="ml-auto">
                  {totalImpact > 0 ? '+' : ''}{totalImpact} points
                </Badge>
              </div>
              <p className="text-gray-700">{analysis.summary}</p>
            </div>

            {/* Score Factors Breakdown */}
            <div className="space-y-4">
              <h3 className="font-semibold">Score Factors Analysis</h3>
              <div className="space-y-3">
                {Object.entries(analysis.scoreFactors).map(([key, value]) => (
                  <div key={key} className="p-4 bg-white border border-gray-200 rounded-lg">
                    <h4 className="font-medium text-sm text-gray-700 mb-1">
                      {factorLabels[key as keyof typeof factorLabels]}
                    </h4>
                    <p className="text-sm text-gray-600">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div className="space-y-3">
              <h3 className="font-semibold">Top Recommendations</h3>
              <div className="space-y-2">
                {analysis.recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 bg-blue-600 text-white text-xs font-semibold rounded-full">
                      {index + 1}
                    </span>
                    <p className="text-sm text-gray-700">{rec}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : null}
      </CardContent>
    </Card>
  );
}

