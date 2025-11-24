import { Card } from './ui/card';
import { Scenario } from '../app/page';
import { 
  Target, 
  Calendar,
  CheckCircle,
  ArrowRight,
  Lightbulb,
  Star,
  TrendingUp,
  Clock
} from 'lucide-react';
import { Badge } from './ui/badge';

interface ImprovementPlanProps {
  currentScore: number;
  scenarios: Scenario[];
}

interface ActionItem {
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  impact: string;
  timeframe: string;
  steps: string[];
}

export function ImprovementPlan({ currentScore, scenarios }: ImprovementPlanProps) {
  const generatePlan = (): ActionItem[] => {
    const plan: ActionItem[] = [];
    
    // Always recommend payment history improvement
    plan.push({
      priority: 'high',
      title: 'Maintain Perfect Payment History',
      description: 'Payment history is 35% of your score. Never miss a payment to protect and improve your credit.',
      impact: '+40 to +60 points over 6 months',
      timeframe: 'Ongoing',
      steps: [
        'Set up automatic payments for at least the minimum due',
        'Create payment reminders 3-5 days before due dates',
        'Pay bills twice a month to stay on top of obligations',
        'Consider setting up autopay from your bank account'
      ]
    });
    
    // Check if utilization needs work
    if (currentScore < 740) {
      plan.push({
        priority: 'high',
        title: 'Reduce Credit Utilization Below 30%',
        description: 'High credit card balances hurt your score. Lowering utilization can provide quick improvements.',
        impact: '+25 to +45 points in 1-2 months',
        timeframe: '1-3 months',
        steps: [
          'Calculate your current utilization on each card',
          'Pay down cards with utilization over 30% first',
          'Make multiple payments per month to keep balances low',
          'Request credit limit increases (without hard inquiry) to improve ratio',
          'Aim for under 10% utilization for maximum benefit'
        ]
      });
    }
    
    // Build credit history
    if (currentScore < 700) {
      plan.push({
        priority: 'medium',
        title: 'Build and Preserve Credit History',
        description: 'Longer credit history demonstrates financial responsibility and experience.',
        impact: '+15 to +30 points over 6-12 months',
        timeframe: '6-12 months',
        steps: [
          'Keep your oldest credit accounts open and active',
          'Make small purchases on old cards and pay them off',
          'Become an authorized user on a family member\'s aged account',
          'Don\'t close accounts just because you\'re not using them'
        ]
      });
    }
    
    // Limit new credit applications
    const hasNewCreditScenarios = scenarios.some(s => 
      s.type === 'inquiry' || s.action.toLowerCase().includes('apply') || s.action.toLowerCase().includes('open')
    );
    
    if (hasNewCreditScenarios || currentScore < 670) {
      plan.push({
        priority: 'medium',
        title: 'Limit New Credit Applications',
        description: 'Too many inquiries and new accounts can hurt your score in the short term.',
        impact: 'Prevent -10 to -30 point drops',
        timeframe: 'Next 6-12 months',
        steps: [
          'Space out credit applications at least 6 months apart',
          'Only apply for credit when you truly need it',
          'Use pre-qualification tools to avoid hard inquiries',
          'If rate shopping for loans, do it within a 14-45 day window'
        ]
      });
    }
    
    // Diversify credit mix if score is good enough
    if (currentScore >= 670 && currentScore < 750) {
      plan.push({
        priority: 'low',
        title: 'Diversify Your Credit Mix',
        description: 'Having different types of credit (cards, loans, etc.) shows you can manage various accounts.',
        impact: '+10 to +20 points over 6-12 months',
        timeframe: '6-12 months',
        steps: [
          'Consider a credit builder loan if you only have credit cards',
          'Add an installment loan (auto, personal) to complement credit cards',
          'Don\'t take on debt just for credit mix - only if you need it',
          'A mortgage or car loan naturally adds to your credit mix'
        ]
      });
    }
    
    // Monitor credit
    plan.push({
      priority: 'high',
      title: 'Monitor Your Credit Regularly',
      description: 'Regular monitoring helps you track progress, spot errors, and detect fraud early.',
      impact: 'Essential for credit health',
      timeframe: 'Ongoing',
      steps: [
        'Sign up for free credit monitoring (Credit Karma, Credit Sesame)',
        'Get your free annual credit report from AnnualCreditReport.com',
        'Review reports for errors and dispute inaccuracies immediately',
        'Set up alerts for new accounts or inquiries',
        'Check your score monthly to track improvement'
      ]
    });
    
    return plan;
  };
  
  const plan = generatePlan();
  
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge className="bg-red-600">High Priority</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-600">Medium Priority</Badge>;
      default:
        return <Badge variant="secondary">Low Priority</Badge>;
    }
  };
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-red-200 bg-red-50';
      case 'medium':
        return 'border-yellow-200 bg-yellow-50';
      default:
        return 'border-blue-200 bg-blue-50';
    }
  };
  
  // Calculate target score
  const getTargetScore = () => {
    if (currentScore < 580) return 620;
    if (currentScore < 670) return 700;
    if (currentScore < 740) return 760;
    if (currentScore < 800) return 820;
    return 850;
  };
  
  const targetScore = getTargetScore();
  const scoreGap = targetScore - currentScore;
  
  return (
    <div className="space-y-6">
      {/* Goals Overview */}
      <Card className="p-6 bg-gradient-to-br from-blue-600 to-purple-600 text-white">
        <div className="flex items-center gap-2 mb-4">
          <Target className="size-5" />
          <h2>Your Credit Improvement Goals</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-blue-100 mb-1">Current Score</p>
            <p className="text-3xl">{currentScore}</p>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ArrowRight className="size-5" />
            </div>
            <p className="text-sm text-blue-100">
              Following this plan could help you improve your score over the next 6-12 months
            </p>
          </div>
          <div>
            <p className="text-sm text-blue-100 mb-1">Target Score</p>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl">{targetScore}</p>
              <span className="text-sm text-blue-100">
                (+{scoreGap} points)
              </span>
            </div>
          </div>
        </div>
      </Card>
      
      {/* Why This Matters */}
      <Card className="p-6">
        <div className="flex items-start gap-3">
          <Star className="size-5 text-yellow-600 shrink-0 mt-0.5" />
          <div className="space-y-2">
            <h3 className="text-sm">Why Improving Your Credit Matters</h3>
            <p className="text-sm text-gray-700">
              A higher credit score can save you thousands of dollars in interest on loans and credit cards. 
              It also gives you access to better credit products, lower insurance premiums, and can even help 
              with apartment rentals and some job applications.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">With Score 680</p>
                <p className="text-sm">30-year mortgage: ~7.5% APR</p>
                <p className="text-xs text-gray-600">$280,000 total interest</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">With Score 760+</p>
                <p className="text-sm">30-year mortgage: ~6.5% APR</p>
                <p className="text-xs text-gray-600">$230,000 total interest (Save $50k!)</p>
              </div>
            </div>
          </div>
        </div>
      </Card>
      
      {/* Action Plan */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Lightbulb className="size-5 text-yellow-600" />
          <h2>Personalized Action Plan</h2>
        </div>
        
        {plan.map((action, index) => (
          <Card key={index} className={`p-6 border-2 ${getPriorityColor(action.priority)}`}>
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-lg">{index + 1}</span>
                    <h3 className="text-sm">{action.title}</h3>
                  </div>
                  {getPriorityBadge(action.priority)}
                </div>
              </div>
              
              <p className="text-sm text-gray-700">{action.description}</p>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-white rounded border border-gray-200">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="size-4 text-green-600" />
                    <span className="text-xs text-gray-600">Potential Impact</span>
                  </div>
                  <p className="text-sm text-green-600">{action.impact}</p>
                </div>
                <div className="p-3 bg-white rounded border border-gray-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="size-4 text-blue-600" />
                    <span className="text-xs text-gray-600">Timeframe</span>
                  </div>
                  <p className="text-sm text-blue-600">{action.timeframe}</p>
                </div>
              </div>
              
              <div className="p-4 bg-white rounded border border-gray-200">
                <p className="text-xs text-gray-600 mb-3">Action Steps:</p>
                <ul className="space-y-2">
                  {action.steps.map((step, stepIndex) => (
                    <li key={stepIndex} className="flex items-start gap-2">
                      <CheckCircle className="size-4 text-green-600 shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700">{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>
        ))}
      </div>
      
      {/* Timeline */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="size-5 text-blue-600" />
          <h2>Expected Improvement Timeline</h2>
        </div>
        
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="w-3 h-3 bg-blue-600 rounded-full" />
              <div className="w-0.5 h-full bg-blue-200" />
            </div>
            <div className="flex-1 pb-6">
              <p className="text-sm mb-1">Month 1-2</p>
              <p className="text-sm text-gray-600">
                Set up automatic payments, review credit reports, and start lowering utilization. 
                Quick wins: +10 to +20 points
              </p>
            </div>
          </div>
          
          <div className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="w-3 h-3 bg-blue-600 rounded-full" />
              <div className="w-0.5 h-full bg-blue-200" />
            </div>
            <div className="flex-1 pb-6">
              <p className="text-sm mb-1">Month 3-6</p>
              <p className="text-sm text-gray-600">
                Consistent on-time payments and low utilization start showing results. 
                Expected: +20 to +40 points
              </p>
            </div>
          </div>
          
          <div className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="w-3 h-3 bg-blue-600 rounded-full" />
              <div className="w-0.5 h-full bg-blue-200" />
            </div>
            <div className="flex-1 pb-6">
              <p className="text-sm mb-1">Month 6-12</p>
              <p className="text-sm text-gray-600">
                Longer payment history and aged accounts improve your score further. 
                Expected: +30 to +60 points total
              </p>
            </div>
          </div>
          
          <div className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="w-3 h-3 bg-green-600 rounded-full" />
            </div>
            <div className="flex-1">
              <p className="text-sm mb-1">12+ Months</p>
              <p className="text-sm text-gray-600">
                Reach your target score and maintain good credit habits. You'll qualify for the best rates 
                and credit products available.
              </p>
            </div>
          </div>
        </div>
      </Card>
      
      {/* Important Note */}
      <Card className="p-6 bg-purple-50 border-purple-200">
        <div className="flex items-start gap-3">
          <Lightbulb className="size-5 text-purple-600 shrink-0 mt-0.5" />
          <div className="space-y-2">
            <h3 className="text-sm">Remember</h3>
            <ul className="text-sm text-gray-700 space-y-2">
              <li>• Credit improvement takes time - there are no quick fixes</li>
              <li>• Consistency is more important than perfection</li>
              <li>• This is a simulation - your actual results may vary</li>
              <li>• Always consult with financial advisors for personalized advice</li>
              <li>• These timelines and impacts are educational estimates</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}
