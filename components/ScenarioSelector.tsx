import { Scenario } from '../lib/credit-score';
import { 
  CheckCircle2, 
  XCircle, 
  TrendingDown, 
  AlertTriangle,
  ArrowUpCircle,
  CreditCard,
  Trash2,
  Car,
  Layers,
  UserPlus,
  Plus,
  X
} from 'lucide-react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';

const iconMap: Record<string, any> = {
  CheckCircle2,
  XCircle,
  TrendingDown,
  AlertTriangle,
  ArrowUpCircle,
  CreditCard,
  Trash2,
  Car,
  Layers,
  UserPlus,
};

interface ScenarioSelectorProps {
  scenarios: Scenario[];
  selectedScenarios: Scenario[];
  onToggleScenario: (scenario: Scenario) => void;
  onClearAll: () => void;
}

export function ScenarioSelector({
  scenarios,
  selectedScenarios,
  onToggleScenario,
  onClearAll,
}: ScenarioSelectorProps) {
  const isSelected = (scenario: Scenario) => 
    selectedScenarios.some(s => s.id === scenario.id);
  
  const categoryColors: Record<string, string> = {
    payment: 'bg-blue-100 text-blue-700 border-blue-300',
    debt: 'bg-purple-100 text-purple-700 border-purple-300',
    credit: 'bg-green-100 text-green-700 border-green-300',
    inquiry: 'bg-orange-100 text-orange-700 border-orange-300',
    account: 'bg-pink-100 text-pink-700 border-pink-300',
  };
  
  const riskColors: Record<string, string> = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800',
  };
  
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3>Select Financial Scenarios</h3>
          <p className="text-sm text-gray-600 mt-1">
            Choose actions to see their potential impact on your credit score
          </p>
        </div>
        {selectedScenarios.length > 0 && (
          <Button variant="outline" size="sm" onClick={onClearAll}>
            Clear All
          </Button>
        )}
      </div>
      
      {selectedScenarios.length > 0 && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600 mb-2">
            Active Scenarios ({selectedScenarios.length})
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedScenarios.map((scenario) => {
              const Icon = iconMap[scenario.icon];
              return (
                <div
                  key={scenario.id}
                  className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-md border border-gray-300 text-sm"
                >
                  {Icon && <Icon className="w-4 h-4" />}
                  {scenario.name}
                  <button
                    onClick={() => onToggleScenario(scenario)}
                    className="ml-1 hover:bg-gray-100 rounded p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {scenarios.map((scenario) => {
          const Icon = iconMap[scenario.icon];
          const selected = isSelected(scenario);
          const impact = scenario.impactRange;
          const impactText = impact.min >= 0 
            ? `+${impact.min} to +${impact.max}`
            : impact.max >= 0
            ? `${impact.min} to +${impact.max}`
            : `${impact.min} to ${impact.max}`;
          
          return (
            <button
              key={scenario.id}
              onClick={() => onToggleScenario(scenario)}
              className={`
                p-4 rounded-lg border-2 text-left transition-all hover:shadow-md
                ${selected 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 bg-white hover:border-gray-300'
                }
              `}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {Icon && <Icon className="w-5 h-5 text-gray-700" />}
                  <div className="text-sm">{scenario.name}</div>
                </div>
                {selected && (
                  <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                    <Plus className="w-3 h-3 text-white rotate-45" />
                  </div>
                )}
              </div>
              
              <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                {scenario.description}
              </p>
              
              <div className="flex flex-wrap gap-1.5 mb-2">
                <Badge 
                  variant="outline" 
                  className={categoryColors[scenario.category]}
                >
                  {scenario.category}
                </Badge>
                <Badge 
                  variant="outline" 
                  className={riskColors[scenario.riskLevel]}
                >
                  {scenario.riskLevel} risk
                </Badge>
              </div>
              
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">{scenario.timeframe}</span>
                <span className={`${
                  impact.min >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {impactText} pts
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
