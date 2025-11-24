import { Card } from './ui/card';
import { Scenario } from '../app/page';
import { 
  Shield, 
  AlertTriangle, 
  AlertCircle, 
  CheckCircle, 
  XCircle,
  Clock,
  TrendingDown,
  Info
} from 'lucide-react';
import { Badge } from './ui/badge';

interface RiskAnalysisProps {
  scenarios: Scenario[];
  currentScore: number;
}

interface Risk {
  level: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  recommendation: string;
  scenarios: string[];
}

export function RiskAnalysis({ scenarios, currentScore }: RiskAnalysisProps) {
  const analyzeRisks = (): Risk[] => {
    const risks: Risk[] = [];
    
    // Check for missed payments
    const missedPayments = scenarios.filter(s => 
      s.action.toLowerCase().includes('miss') || s.impact < -70
    );
    if (missedPayments.length > 0) {
      risks.push({
        level: 'critical',
        title: 'Missed Payments Detected',
        description: 'Missing payments can severely damage your credit score and remain on your credit report for up to 7 years.',
        recommendation: 'Set up automatic payments or payment reminders to ensure you never miss a due date. Even one missed payment can drop your score by 80-100 points.',
        scenarios: missedPayments.map(s => s.action)
      });
    }
    
    // Check for multiple inquiries
    const multipleInquiries = scenarios.filter(s => 
      s.type === 'inquiry' && s.action.toLowerCase().includes('multiple')
    );
    if (multipleInquiries.length > 0) {
      risks.push({
        level: 'high',
        title: 'Multiple Hard Inquiries',
        description: 'Applying for multiple credit accounts in a short period signals credit risk to lenders.',
        recommendation: 'Limit credit applications to only when necessary. If shopping for loans, do it within a 14-45 day window so inquiries count as one.',
        scenarios: multipleInquiries.map(s => s.action)
      });
    }
    
    // Check for closing old accounts
    const closingOldAccounts = scenarios.filter(s => 
      s.action.toLowerCase().includes('close') && s.action.toLowerCase().includes('old')
    );
    if (closingOldAccounts.length > 0) {
      risks.push({
        level: 'high',
        title: 'Closing Aged Accounts',
        description: 'Closing your oldest credit accounts reduces your average account age and available credit.',
        recommendation: 'Keep old accounts open even if you don\'t use them often. They contribute to your credit history length. Consider making small purchases occasionally to keep them active.',
        scenarios: closingOldAccounts.map(s => s.action)
      });
    }
    
    // Check for maxed out cards
    const maxedCards = scenarios.filter(s => 
      s.action.toLowerCase().includes('max') || s.action.toLowerCase().includes('minimum only')
    );
    if (maxedCards.length > 0) {
      risks.push({
        level: 'high',
        title: 'High Credit Utilization',
        description: 'Using too much of your available credit (especially over 30%) negatively impacts your score.',
        recommendation: 'Try to keep utilization below 30% on each card, and ideally below 10%. Pay down balances or request credit limit increases to improve your ratio.',
        scenarios: maxedCards.map(s => s.action)
      });
    }
    
    // Check for too many new accounts
    const newAccounts = scenarios.filter(s => 
      s.action.toLowerCase().includes('open') || s.action.toLowerCase().includes('apply')
    );
    if (newAccounts.length >= 3) {
      risks.push({
        level: 'medium',
        title: 'Opening Multiple New Accounts',
        description: 'Too many new accounts in a short time lowers your average account age and suggests financial stress.',
        recommendation: 'Space out new credit applications over time. Wait at least 6 months between applications unless necessary.',
        scenarios: newAccounts.map(s => s.action)
      });
    }
    
    // Check projected score
    if (currentScore < 580) {
      risks.push({
        level: 'critical',
        title: 'Poor Credit Score Range',
        description: 'A score below 580 severely limits your credit options and results in very high interest rates or denials.',
        recommendation: 'Focus on payment history and reducing utilization. Consider becoming an authorized user on a good account or using a secured credit card to rebuild.',
        scenarios: []
      });
    } else if (currentScore < 670) {
      risks.push({
        level: 'medium',
        title: 'Fair Credit Score Range',
        description: 'While not terrible, a score in the fair range means higher interest rates and fewer credit options.',
        recommendation: 'Work on consistent on-time payments and keeping utilization low. Your score has room for significant improvement.',
        scenarios: []
      });
    }
    
    return risks;
  };
  
  const risks = analyzeRisks();
  
  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'critical':
        return <XCircle className="size-5 text-red-600" />;
      case 'high':
        return <AlertTriangle className="size-5 text-orange-600" />;
      case 'medium':
        return <AlertCircle className="size-5 text-yellow-600" />;
      default:
        return <Info className="size-5 text-blue-600" />;
    }
  };
  
  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical':
        return 'bg-red-50 border-red-200';
      case 'high':
        return 'bg-orange-50 border-orange-200';
      case 'medium':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };
  
  const getRiskBadge = (level: string) => {
    switch (level) {
      case 'critical':
        return <Badge variant="destructive">Critical Risk</Badge>;
      case 'high':
        return <Badge className="bg-orange-600">High Risk</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-600">Medium Risk</Badge>;
      default:
        return <Badge variant="secondary">Low Risk</Badge>;
    }
  };
  
  // Calculate risk score
  const calculateRiskScore = () => {
    let score = 0;
    risks.forEach(risk => {
      switch (risk.level) {
        case 'critical':
          score += 40;
          break;
        case 'high':
          score += 25;
          break;
        case 'medium':
          score += 10;
          break;
        default:
          score += 5;
      }
    });
    return Math.min(100, score);
  };
  
  const riskScore = calculateRiskScore();
  
  return (
    <div className="space-y-6">
      {/* Risk Score Overview */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="size-5 text-blue-600" />
          <h2>Risk Assessment</h2>
        </div>
        
        {scenarios.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <CheckCircle className="size-12 mx-auto mb-3 text-green-400" />
            <p>No scenarios to analyze. Add financial actions to see potential risks.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Overall Risk Score */}
            <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm">Overall Risk Level</span>
                <span className="text-2xl">
                  {riskScore === 0 ? '0' : riskScore}
                  <span className="text-sm text-gray-600">/100</span>
                </span>
              </div>
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-1000 ${
                    riskScore >= 60 ? 'bg-red-600' : 
                    riskScore >= 30 ? 'bg-orange-600' : 
                    riskScore >= 15 ? 'bg-yellow-600' : 
                    'bg-green-600'
                  }`}
                  style={{ width: `${riskScore}%` }}
                />
              </div>
              <p className="text-xs text-gray-600 mt-2">
                {riskScore >= 60 && 'High risk: Multiple factors could significantly harm your credit'}
                {riskScore >= 30 && riskScore < 60 && 'Moderate risk: Some actions may negatively impact your credit'}
                {riskScore >= 15 && riskScore < 30 && 'Low-moderate risk: Minor concerns to be aware of'}
                {riskScore < 15 && 'Low risk: Your scenarios show minimal risk to credit health'}
              </p>
            </div>
            
            {/* Risk Summary */}
            {risks.length > 0 && (
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="p-3 bg-red-50 rounded-lg">
                  <div className="text-2xl text-red-600">
                    {risks.filter(r => r.level === 'critical').length}
                  </div>
                  <div className="text-xs text-gray-600">Critical</div>
                </div>
                <div className="p-3 bg-orange-50 rounded-lg">
                  <div className="text-2xl text-orange-600">
                    {risks.filter(r => r.level === 'high').length}
                  </div>
                  <div className="text-xs text-gray-600">High</div>
                </div>
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <div className="text-2xl text-yellow-600">
                    {risks.filter(r => r.level === 'medium').length}
                  </div>
                  <div className="text-xs text-gray-600">Medium</div>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl text-green-600">
                    {risks.filter(r => r.level === 'low').length}
                  </div>
                  <div className="text-xs text-gray-600">Low</div>
                </div>
              </div>
            )}
          </div>
        )}
      </Card>
      
      {/* Detailed Risks */}
      {risks.length > 0 && (
        <div className="space-y-4">
          <h2>Identified Risks</h2>
          {risks.map((risk, index) => (
            <Card key={index} className={`p-6 border-2 ${getRiskColor(risk.level)}`}>
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    {getRiskIcon(risk.level)}
                    <div>
                      <h3 className="text-sm mb-1">{risk.title}</h3>
                      {getRiskBadge(risk.level)}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm text-gray-700">{risk.description}</p>
                  
                  {risk.scenarios.length > 0 && (
                    <div className="p-3 bg-white rounded border border-gray-200">
                      <p className="text-xs text-gray-600 mb-2">Related scenarios:</p>
                      <ul className="text-sm space-y-1">
                        {risk.scenarios.map((scenario, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <TrendingDown className="size-4 text-red-600 shrink-0 mt-0.5" />
                            <span>{scenario}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <div className="p-3 bg-white rounded border border-gray-200">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="size-4 text-green-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Recommendation:</p>
                        <p className="text-sm text-gray-700">{risk.recommendation}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
      
      {/* Positive Actions */}
      {scenarios.length > 0 && (
        <Card className="p-6 bg-green-50 border-green-200">
          <div className="flex items-start gap-3">
            <CheckCircle className="size-5 text-green-600 shrink-0 mt-0.5" />
            <div className="space-y-2">
              <h3 className="text-sm">Protective Measures</h3>
              <ul className="text-sm text-gray-700 space-y-2">
                <li className="flex items-start gap-2">
                  <Clock className="size-4 shrink-0 mt-0.5" />
                  <span>Monitor your credit regularly using free services like Credit Karma or AnnualCreditReport.com</span>
                </li>
                <li className="flex items-start gap-2">
                  <Clock className="size-4 shrink-0 mt-0.5" />
                  <span>Set up fraud alerts if you're concerned about identity theft</span>
                </li>
                <li className="flex items-start gap-2">
                  <Clock className="size-4 shrink-0 mt-0.5" />
                  <span>Review your credit reports annually for errors and dispute any inaccuracies</span>
                </li>
                <li className="flex items-start gap-2">
                  <Clock className="size-4 shrink-0 mt-0.5" />
                  <span>Keep credit utilization below 30% on all cards, ideally under 10%</span>
                </li>
              </ul>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
