import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
import { Plus, CreditCard, DollarSign, Landmark, Search, Calendar, TrendingUp } from 'lucide-react';
import { Scenario } from '../app/page';

interface ScenarioBuilderProps {
  onAddScenario: (scenario: Omit<Scenario, 'id' | 'addedAt'>) => void;
}

const scenarioTemplates = {
  payment: [
    { action: 'Pay off credit card balance', impact: 35, timeframe: 2, description: 'Paying off your credit card reduces utilization and improves payment history' },
    { action: 'Make on-time payments for 6 months', impact: 40, timeframe: 6, description: 'Consistent on-time payments significantly boost your payment history' },
    { action: 'Miss a payment', impact: -80, timeframe: 1, description: 'Missing a payment can severely damage your credit score' },
    { action: 'Pay minimum only', impact: -5, timeframe: 3, description: 'Only paying minimums increases utilization over time' }
  ],
  credit_card: [
    { action: 'Open a new credit card', impact: -15, timeframe: 2, description: 'New account lowers average age and adds a hard inquiry' },
    { action: 'Close oldest credit card', impact: -25, timeframe: 1, description: 'Closing your oldest card reduces credit history length' },
    { action: 'Become authorized user on old account', impact: 30, timeframe: 3, description: 'Being added to an aged account improves your credit history' },
    { action: 'Max out credit card', impact: -45, timeframe: 1, description: 'High utilization negatively impacts your score' }
  ],
  loan: [
    { action: 'Apply for auto loan', impact: -10, timeframe: 2, description: 'New loan adds a hard inquiry and new account' },
    { action: 'Pay off auto loan', impact: 20, timeframe: 3, description: 'Paying off a loan reduces debt and improves payment history' },
    { action: 'Apply for mortgage', impact: -15, timeframe: 3, description: 'Mortgage application includes hard inquiry and increases debt' },
    { action: 'Consolidate debt', impact: 25, timeframe: 4, description: 'Debt consolidation can lower utilization and simplify payments' }
  ],
  inquiry: [
    { action: 'Apply for 1 new credit account', impact: -5, timeframe: 1, description: 'A single hard inquiry has minimal impact' },
    { action: 'Apply for multiple accounts (rate shopping)', impact: -8, timeframe: 2, description: 'Multiple inquiries in short period treated as one for mortgages/auto loans' },
    { action: 'Apply for 3+ unrelated accounts', impact: -30, timeframe: 3, description: 'Multiple hard inquiries indicate credit risk' },
    { action: 'Wait 12 months (inquiry falls off)', impact: 10, timeframe: 12, description: 'Hard inquiries impact score less over time' }
  ],
  credit_limit: [
    { action: 'Request credit limit increase', impact: 25, timeframe: 2, description: 'Higher limit lowers utilization ratio without hard inquiry' },
    { action: 'Get automatic limit increase', impact: 20, timeframe: 1, description: 'Automatic increases improve utilization with no inquiry' },
    { action: 'Reduce credit limit', impact: -20, timeframe: 1, description: 'Lower limit increases utilization ratio' },
    { action: 'Keep utilization under 30%', impact: 30, timeframe: 4, description: 'Maintaining low utilization significantly improves score' }
  ],
  account_age: [
    { action: 'Wait 12 months (age accounts)', impact: 15, timeframe: 12, description: 'Time naturally improves average account age' },
    { action: 'Keep old accounts open', impact: 10, timeframe: 6, description: 'Maintaining aged accounts helps credit history length' },
    { action: 'Close recent account', impact: 5, timeframe: 1, description: 'Removing young account slightly improves average age' },
    { action: 'Close multiple old accounts', impact: -35, timeframe: 2, description: 'Closing aged accounts significantly hurts credit history' }
  ]
};

const scenarioIcons = {
  payment: DollarSign,
  credit_card: CreditCard,
  loan: Landmark,
  inquiry: Search,
  credit_limit: TrendingUp,
  account_age: Calendar
};

export function ScenarioBuilder({ onAddScenario }: ScenarioBuilderProps) {
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  
  const handleAddScenario = () => {
    if (!selectedType || !selectedTemplate) return;
    
    const type = selectedType as Scenario['type'];
    const templates = scenarioTemplates[type];
    const template = templates[parseInt(selectedTemplate)];
    
    onAddScenario({
      type,
      action: template.action,
      impact: template.impact,
      timeframe: template.timeframe,
      description: template.description
    });
    
    setSelectedTemplate('');
  };
  
  const getTypeLabel = (type: string) => {
    return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };
  
  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Plus className="size-5 text-blue-600" />
          <h2>Add Financial Scenario</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Scenario Type Selection */}
          <div className="space-y-2">
            <Label>Scenario Category</Label>
            <Select value={selectedType} onValueChange={(value) => {
              setSelectedType(value);
              setSelectedTemplate('');
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Select category..." />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(scenarioTemplates).map((type) => {
                  const Icon = scenarioIcons[type as keyof typeof scenarioIcons];
                  return (
                    <SelectItem key={type} value={type}>
                      <div className="flex items-center gap-2">
                        <Icon className="size-4" />
                        <span>{getTypeLabel(type)}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
          
          {/* Action Selection */}
          <div className="space-y-2">
            <Label>Financial Action</Label>
            <Select 
              value={selectedTemplate} 
              onValueChange={setSelectedTemplate}
              disabled={!selectedType}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select action..." />
              </SelectTrigger>
              <SelectContent>
                {selectedType && scenarioTemplates[selectedType as keyof typeof scenarioTemplates].map((template, index) => (
                  <SelectItem key={index} value={index.toString()}>
                    <div className="flex items-center justify-between gap-4">
                      <span>{template.action}</span>
                      <span className={`text-xs ${template.impact > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {template.impact > 0 ? '+' : ''}{template.impact}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Preview */}
        {selectedType && selectedTemplate && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-2">
            <p className="text-sm">
              {scenarioTemplates[selectedType as keyof typeof scenarioTemplates][parseInt(selectedTemplate)].description}
            </p>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-gray-600">
                Impact: <span className={scenarioTemplates[selectedType as keyof typeof scenarioTemplates][parseInt(selectedTemplate)].impact > 0 ? 'text-green-600' : 'text-red-600'}>
                  {scenarioTemplates[selectedType as keyof typeof scenarioTemplates][parseInt(selectedTemplate)].impact > 0 ? '+' : ''}
                  {scenarioTemplates[selectedType as keyof typeof scenarioTemplates][parseInt(selectedTemplate)].impact} points
                </span>
              </span>
              <span className="text-gray-600">
                Timeframe: {scenarioTemplates[selectedType as keyof typeof scenarioTemplates][parseInt(selectedTemplate)].timeframe} months
              </span>
            </div>
          </div>
        )}
        
        <Button 
          onClick={handleAddScenario}
          disabled={!selectedType || !selectedTemplate}
          className="w-full"
        >
          <Plus className="size-4 mr-2" />
          Add Scenario
        </Button>
      </div>
    </Card>
  );
}
