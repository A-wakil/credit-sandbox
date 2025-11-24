import { Card } from './ui/card';
import { Scenario } from '../app/page';
import { Brain, TrendingUp, TrendingDown, AlertCircle, Info } from 'lucide-react';
import { Progress } from './ui/progress';

interface ExplanationPanelProps {
  scenarios: Scenario[];
  totalImpact: number;
  currentScore: number;
  baseScore: number;
}

export function ExplanationPanel({ scenarios, totalImpact, currentScore, baseScore }: ExplanationPanelProps) {
  // Calculate factor impacts
  const calculateFactorImpacts = () => {
    const factors = {
      paymentHistory: 0,
      creditUtilization: 0,
      creditHistory: 0,
      newCredit: 0,
      creditMix: 0
    };
    
    scenarios.forEach(scenario => {
      switch (scenario.type) {
        case 'payment':
          factors.paymentHistory += scenario.impact;
          break;
        case 'credit_card':
          factors.creditUtilization += scenario.impact * 0.6;
          factors.creditHistory += scenario.impact * 0.4;
          break;
        case 'loan':
          factors.creditMix += scenario.impact * 0.5;
          factors.newCredit += scenario.impact * 0.5;
          break;
        case 'inquiry':
          factors.newCredit += scenario.impact;
          break;
        case 'credit_limit':
          factors.creditUtilization += scenario.impact;
          break;
        case 'account_age':
          factors.creditHistory += scenario.impact;
          break;
      }
    });
    
    return factors;
  };
  
  const factors = calculateFactorImpacts();
  
  const creditFactors = [
    {
      name: 'Payment History',
      weight: 35,
      impact: factors.paymentHistory,
      description: 'Your track record of on-time payments. This is the most important factor.',
      color: 'bg-blue-600'
    },
    {
      name: 'Credit Utilization',
      weight: 30,
      impact: factors.creditUtilization,
      description: 'How much of your available credit you\'re using. Lower is better.',
      color: 'bg-purple-600'
    },
    {
      name: 'Credit History Length',
      weight: 15,
      impact: factors.creditHistory,
      description: 'How long you\'ve been using credit. Longer history is better.',
      color: 'bg-green-600'
    },
    {
      name: 'New Credit',
      weight: 10,
      impact: factors.newCredit,
      description: 'Recent credit inquiries and new accounts. Too many can hurt your score.',
      color: 'bg-orange-600'
    },
    {
      name: 'Credit Mix',
      weight: 10,
      impact: factors.creditMix,
      description: 'Variety of credit types (cards, loans, mortgages). Diversity helps.',
      color: 'bg-pink-600'
    }
  ];
  
  return (
    <div className="space-y-6">
      {/* Overall Analysis */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Brain className="size-5 text-blue-600" />
          <h2>AI Analysis</h2>
        </div>
        
        {scenarios.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Info className="size-12 mx-auto mb-3 text-gray-400" />
            <p>Add scenarios to see detailed AI analysis of how they would impact your credit score.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
              {totalImpact > 0 ? (
                <TrendingUp className="size-5 text-green-600 shrink-0 mt-0.5" />
              ) : totalImpact < 0 ? (
                <TrendingDown className="size-5 text-red-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="size-5 text-gray-600 shrink-0 mt-0.5" />
              )}
              <div className="space-y-2">
                <h3 className="text-sm">Overall Impact Assessment</h3>
                <p className="text-sm text-gray-700">
                  {totalImpact > 50 && (
                    <>Your scenarios show <strong>significant positive impact</strong> on your credit score. The actions you're considering would move your score from <strong>{baseScore}</strong> to approximately <strong>{currentScore}</strong> over time. This improvement could qualify you for better interest rates and credit products.</>
                  )}
                  {totalImpact > 0 && totalImpact <= 50 && (
                    <>Your scenarios show <strong>moderate positive impact</strong> on your credit score. With these changes, your score could improve from <strong>{baseScore}</strong> to around <strong>{currentScore}</strong>. This is a step in the right direction for better credit health.</>
                  )}
                  {totalImpact === 0 && (
                    <>Your scenarios show <strong>neutral impact</strong> on your credit score. The positive and negative actions balance out, keeping your score around <strong>{baseScore}</strong>. Consider adjusting your scenarios to see potential improvements.</>
                  )}
                  {totalImpact < 0 && totalImpact >= -50 && (
                    <>Your scenarios show <strong>moderate negative impact</strong> on your credit score. These actions could lower your score from <strong>{baseScore}</strong> to approximately <strong>{currentScore}</strong>. Consider whether these actions are necessary or if alternatives exist.</>
                  )}
                  {totalImpact < -50 && (
                    <>Your scenarios show <strong>significant negative impact</strong> on your credit score. Your score could drop from <strong>{baseScore}</strong> to around <strong>{currentScore}</strong>. These actions may harm your creditworthiness and should be carefully considered.</>
                  )}
                </p>
              </div>
            </div>
            
            {/* Scenario Breakdown */}
            <div className="space-y-3">
              <h3 className="text-sm">Active Scenarios Impact</h3>
              <div className="space-y-2">
                {scenarios.map(scenario => (
                  <div key={scenario.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="text-sm">{scenario.action}</p>
                      <p className="text-xs text-gray-600 mt-1">{scenario.description}</p>
                    </div>
                    <div className={`text-sm ml-4 shrink-0 ${scenario.impact > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {scenario.impact > 0 ? '+' : ''}{scenario.impact} pts
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Card>
      
      {/* Credit Score Factors */}
      <Card className="p-6">
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-2">Credit Score Factors</h2>
            <p className="text-gray-600">
              Understanding how different factors contribute to your credit score and how your scenarios affect them.
            </p>
          </div>
          
          <div className="space-y-6">
            {creditFactors.map(factor => (
              <div key={factor.name}>
                <div className="flex items-baseline justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{factor.name}</h3>
                  <span className="text-sm text-gray-500">({factor.weight}% of score)</span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2 overflow-hidden">
                  <div
                    className="h-full bg-gray-900 rounded-full transition-all duration-300"
                    style={{ width: `${factor.weight}%` }}
                  />
                </div>
                
                <p className="text-sm text-gray-600">
                  {factor.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Card>
      
      {/* Key Insights */}
      <Card className="p-6">
        <div className="space-y-4">
          <h2>Key Insights</h2>
          
          <div className="space-y-3">
            <div className="p-4 bg-blue-50 border-l-4 border-blue-600 rounded">
              <h3 className="text-sm mb-1">Time Is Important</h3>
              <p className="text-sm text-gray-700">
                Credit score changes don't happen overnight. Most positive impacts take 1-6 months to fully reflect, while negative impacts can be immediate.
              </p>
            </div>
            
            <div className="p-4 bg-purple-50 border-l-4 border-purple-600 rounded">
              <h3 className="text-sm mb-1">Payment History Matters Most</h3>
              <p className="text-sm text-gray-700">
                With 35% weight, payment history is the most important factor. Never miss a payment if you can avoid it.
              </p>
            </div>
            
            <div className="p-4 bg-green-50 border-l-4 border-green-600 rounded">
              <h3 className="text-sm mb-1">Keep Utilization Low</h3>
              <p className="text-sm text-gray-700">
                Try to use less than 30% of your available credit. Lower utilization (under 10%) is even better for your score.
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
