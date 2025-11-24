import { SCORE_WEIGHTS } from '../lib/credit-score';

export function ScoreFactorsBreakdown() {
  const factors = [
    {
      name: 'Payment History',
      weight: SCORE_WEIGHTS.paymentHistory * 100,
      description: 'Your track record of on-time payments. This is the most important factor.',
    },
    {
      name: 'Credit Utilization',
      weight: SCORE_WEIGHTS.creditUtilization * 100,
      description: 'How much of your available credit you\'re using. Lower is better.',
    },
    {
      name: 'Credit History Length',
      weight: SCORE_WEIGHTS.creditAge * 100,
      description: 'How long you\'ve been using credit. Longer history is better.',
    },
    {
      name: 'New Credit',
      weight: SCORE_WEIGHTS.newCredit * 100,
      description: 'Recent credit inquiries and new accounts. Too many can hurt your score.',
    },
    {
      name: 'Credit Mix',
      weight: SCORE_WEIGHTS.creditMix * 100,
      description: 'Variety of credit types (cards, loans, mortgages). Diversity helps.',
    },
  ];
  
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-2">Credit Score Factors</h3>
        <p className="text-gray-600">
          Understanding how different factors contribute to your credit score and how your scenarios affect them.
        </p>
      </div>
      
      <div className="space-y-6">
        {factors.map((factor) => (
          <div key={factor.name}>
            <div className="flex items-baseline justify-between mb-2">
              <h4 className="font-semibold text-gray-900">{factor.name}</h4>
              <span className="text-sm text-gray-500">({Math.round(factor.weight)}% of score)</span>
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
  );
}
