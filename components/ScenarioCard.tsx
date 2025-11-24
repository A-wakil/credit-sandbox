import { Card } from './ui/card';
import { Button } from './ui/button';
import { Scenario } from '../app/page';
import { 
  CreditCard, 
  DollarSign, 
  Landmark, 
  Search, 
  Calendar, 
  TrendingUp, 
  X,
  ArrowUp,
  ArrowDown,
  Clock
} from 'lucide-react';

interface ScenarioCardProps {
  scenario: Scenario;
  onRemove: (id: string) => void;
  onSelect: (scenario: Scenario) => void;
  isSelected: boolean;
}

const scenarioIcons = {
  payment: DollarSign,
  credit_card: CreditCard,
  loan: Landmark,
  inquiry: Search,
  credit_limit: TrendingUp,
  account_age: Calendar
};

const scenarioColors = {
  payment: 'bg-green-100 text-green-700',
  credit_card: 'bg-blue-100 text-blue-700',
  loan: 'bg-purple-100 text-purple-700',
  inquiry: 'bg-orange-100 text-orange-700',
  credit_limit: 'bg-cyan-100 text-cyan-700',
  account_age: 'bg-pink-100 text-pink-700'
};

export function ScenarioCard({ scenario, onRemove, onSelect, isSelected }: ScenarioCardProps) {
  const Icon = scenarioIcons[scenario.type];
  const colorClass = scenarioColors[scenario.type];
  
  return (
    <Card 
      className={`p-4 transition-all cursor-pointer hover:shadow-md ${
        isSelected ? 'ring-2 ring-blue-600 shadow-md' : ''
      }`}
      onClick={() => onSelect(scenario)}
    >
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1">
            <div className={`p-2 rounded-lg ${colorClass}`}>
              <Icon className="size-4" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm line-clamp-2">{scenario.action}</h3>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="size-8 p-0 shrink-0 hover:bg-red-50 hover:text-red-600"
            onClick={(e) => {
              e.stopPropagation();
              onRemove(scenario.id);
            }}
          >
            <X className="size-4" />
          </Button>
        </div>
        
        {/* Description */}
        <p className="text-xs text-gray-600 line-clamp-2">
          {scenario.description}
        </p>
        
        {/* Stats */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-200">
          <div className="flex items-center gap-1">
            {scenario.impact > 0 ? (
              <ArrowUp className="size-4 text-green-600" />
            ) : (
              <ArrowDown className="size-4 text-red-600" />
            )}
            <span className={`text-sm ${scenario.impact > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {scenario.impact > 0 ? '+' : ''}{scenario.impact} pts
            </span>
          </div>
          
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Clock className="size-3" />
            <span>{scenario.timeframe} {scenario.timeframe === 1 ? 'month' : 'months'}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
