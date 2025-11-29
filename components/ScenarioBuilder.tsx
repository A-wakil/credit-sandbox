import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Plus, CreditCard, DollarSign, Landmark, Search, Calendar, TrendingUp, Sparkles, Loader2 } from 'lucide-react';
import { Scenario } from '../app/page';

interface ScenarioBuilderProps {
  onAddScenario: (scenario: Omit<Scenario, 'id' | 'addedAt'>) => void;
  currentScore: number;
  existingScenarios: Scenario[];
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

export function ScenarioBuilder({ onAddScenario, currentScore, existingScenarios }: ScenarioBuilderProps) {
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [customScenario, setCustomScenario] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  
  // Generate month+year options starting from current month, extending 3 years into the future
  const generateMonthYearOptions = () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-11
    const options: string[] = [];
    
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    // Start from current month, go 3 years into the future
    for (let yearOffset = 0; yearOffset < 3; yearOffset++) {
      const year = currentYear + yearOffset;
      const startMonth = yearOffset === 0 ? currentMonth : 0;
      
      for (let month = startMonth; month < 12; month++) {
        options.push(`${monthNames[month]} ${year}`);
      }
    }
    
    return options;
  };
  
  const monthYearOptions = generateMonthYearOptions();

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
      description: template.description,
      month: selectedMonth
    });
    
    setSelectedTemplate('');
    setSelectedMonth('');
  };

  const handleAnalyzeCustomScenario = async () => {
    if (!customScenario.trim()) return;
    
    setAnalyzing(true);
    setError('');

    try {
      const response = await fetch('/api/analyze-scenario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentScore,
          scenarioDescription: customScenario,
          existingScenarios: existingScenarios.map(s => ({
            type: s.type,
            action: s.action,
            description: s.description,
          })),
        }),
      });

      if (!response.ok) throw new Error('Failed to analyze scenario');

      const analysis = await response.json();

      // Determine scenario type based on description (simple heuristic)
      let type: Scenario['type'] = 'payment';
      const lowerDesc = customScenario.toLowerCase();
      if (lowerDesc.includes('card') || lowerDesc.includes('credit card')) type = 'credit_card';
      else if (lowerDesc.includes('loan') || lowerDesc.includes('mortgage')) type = 'loan';
      else if (lowerDesc.includes('inquiry') || lowerDesc.includes('apply')) type = 'inquiry';
      else if (lowerDesc.includes('limit') || lowerDesc.includes('utilization')) type = 'credit_limit';
      else if (lowerDesc.includes('age') || lowerDesc.includes('old') || lowerDesc.includes('close')) type = 'account_age';

      onAddScenario({
        type,
        action: customScenario.substring(0, 50) + (customScenario.length > 50 ? '...' : ''),
        impact: analysis.impactPoints,
        timeframe: analysis.timeframeMonths,
        description: analysis.explanation,
        month: selectedMonth, // Include selected month
      });

      setCustomScenario('');
      setSelectedMonth(''); // Reset month selection
    } catch (err) {
      setError('Failed to analyze scenario. Please try again.');
      console.error(err);
    } finally {
      setAnalyzing(false);
    }
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

        <Tabs defaultValue="quick" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="quick">Quick Select</TabsTrigger>
            <TabsTrigger value="custom">
              <Sparkles className="mr-2 h-4 w-4" />
              AI Custom
            </TabsTrigger>
          </TabsList>

          <TabsContent value="quick" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          
          {/* Month & Year Selection */}
          <div className="space-y-2">
            <Label>Target Month & Year</Label>
            <Select 
              value={selectedMonth} 
              onValueChange={setSelectedMonth}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select month & year..." />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {monthYearOptions.map((monthYear) => (
                  <SelectItem key={monthYear} value={monthYear}>
                    {monthYear}
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
              <div className="flex items-center gap-4 text-sm flex-wrap">
                <span className="text-gray-600">
                  Impact: <span className={scenarioTemplates[selectedType as keyof typeof scenarioTemplates][parseInt(selectedTemplate)].impact > 0 ? 'text-green-600' : 'text-red-600'}>
                    {scenarioTemplates[selectedType as keyof typeof scenarioTemplates][parseInt(selectedTemplate)].impact > 0 ? '+' : ''}
                    {scenarioTemplates[selectedType as keyof typeof scenarioTemplates][parseInt(selectedTemplate)].impact} points
                  </span>
                </span>
                <span className="text-gray-600">
                  Timeframe: {scenarioTemplates[selectedType as keyof typeof scenarioTemplates][parseInt(selectedTemplate)].timeframe} months
                </span>
                {selectedMonth && (
                  <span className="text-gray-600">
                    Target Month: <span className="font-medium text-blue-600">{selectedMonth}</span>
                  </span>
                )}
              </div>
            </div>
          )}
            
            <Button 
              onClick={handleAddScenario}
              disabled={!selectedType || !selectedTemplate || !selectedMonth}
              className="w-full"
            >
              <Plus className="size-4 mr-2" />
              Add Scenario
            </Button>
          </TabsContent>

          <TabsContent value="custom" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Describe Your Financial Scenario</Label>
              <Textarea
                placeholder="Example: I want to apply for a new credit card with a $5,000 limit while keeping my utilization under 20%..."
                value={customScenario}
                onChange={(e) => setCustomScenario(e.target.value)}
                rows={4}
                disabled={analyzing}
              />
              <p className="text-xs text-gray-500">
                AI will analyze your scenario considering your current score of {currentScore} and existing scenarios.
              </p>
            </div>

            {/* Month & Year Selection for AI Custom */}
            <div className="space-y-2">
              <Label>Target Month & Year (Optional)</Label>
              <Select 
                value={selectedMonth} 
                onValueChange={setSelectedMonth}
                disabled={analyzing}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select month & year (optional)..." />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {monthYearOptions.map((monthYear) => (
                    <SelectItem key={monthYear} value={monthYear}>
                      {monthYear}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                When should this scenario take effect? Leave blank to start immediately.
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                {error}
              </div>
            )}

            <Button 
              onClick={handleAnalyzeCustomScenario}
              disabled={!customScenario.trim() || analyzing}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {analyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing with AI...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Analyze with AI
                </>
              )}
            </Button>
          </TabsContent>
        </Tabs>
      </div>
    </Card>
  );
}
