import { Card } from './ui/card';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';

interface CreditScoreDisplayProps {
  score: number;
  baseScore: number;
  totalImpact: number;
}

export function CreditScoreDisplay({ score, baseScore, totalImpact }: CreditScoreDisplayProps) {
  const getScoreColor = (score: number) => {
    if (score >= 800) return 'text-green-600';
    if (score >= 740) return 'text-lime-600';
    if (score >= 670) return 'text-yellow-600';
    if (score >= 580) return 'text-orange-600';
    return 'text-red-600';
  };
  
  const getScoreGradient = (score: number) => {
    if (score >= 800) return { start: '#22c55e', end: '#16a34a' }; // green-500 to green-600
    if (score >= 740) return { start: '#84cc16', end: '#16a34a' }; // lime-500 to green-600
    if (score >= 670) return { start: '#eab308', end: '#84cc16' }; // yellow-500 to lime-500
    if (score >= 580) return { start: '#f97316', end: '#eab308' }; // orange-500 to yellow-500
    return { start: '#ef4444', end: '#f97316' }; // red-500 to orange-500
  };
  
  const getScoreRating = (score: number) => {
    if (score >= 800) return 'Exceptional';
    if (score >= 740) return 'Very Good';
    if (score >= 670) return 'Good';
    if (score >= 580) return 'Fair';
    return 'Poor';
  };
  
  const percentage = ((score - 300) / (850 - 300)) * 100;
  
  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <p className="text-sm text-gray-600 mb-4">Simulated Credit Score</p>
          
          {/* Circular Gauge */}
          <div className="relative w-48 h-48 mx-auto">
            {/* Background Circle */}
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="96"
                cy="96"
                r="80"
                stroke="#e5e7eb"
                strokeWidth="12"
                fill="none"
              />
              {/* Progress Circle */}
              <circle
                cx="96"
                cy="96"
                r="80"
                stroke="url(#scoreGradient)"
                strokeWidth="12"
                fill="none"
                strokeDasharray={`${percentage * 5.03} 503`}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
              <defs>
                <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor={getScoreGradient(score).start} />
                  <stop offset="100%" stopColor={getScoreGradient(score).end} />
                </linearGradient>
              </defs>
            </svg>
            
            {/* Center Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className={`${getScoreColor(score)} transition-colors`}>
                <div className="text-5xl">{score}</div>
              </div>
              <div className="text-sm text-gray-600 mt-1">{getScoreRating(score)}</div>
            </div>
          </div>
        </div>
        
        {/* Score Range */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-gray-600">
            <span>300</span>
            <span>850</span>
          </div>
          <div className="h-2 bg-gradient-to-r from-red-500 via-yellow-500 via-lime-500 to-green-500 rounded-full" />
        </div>
        
        {/* Impact Display */}
        <div className="pt-4 border-t border-gray-200 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Starting Score</span>
            <span className="text-gray-900">{baseScore}</span>
          </div>
          
          {totalImpact !== 0 && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Impact</span>
              <div className="flex items-center gap-1">
                {totalImpact > 0 ? (
                  <>
                    <ArrowUp className="size-4 text-green-600" />
                    <span className="text-green-600">+{totalImpact}</span>
                  </>
                ) : totalImpact < 0 ? (
                  <>
                    <ArrowDown className="size-4 text-red-600" />
                    <span className="text-red-600">{totalImpact}</span>
                  </>
                ) : (
                  <>
                    <Minus className="size-4 text-gray-400" />
                    <span className="text-gray-600">0</span>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* Score Ranges Legend */}
        <div className="pt-4 border-t border-gray-200 space-y-2">
          <p className="text-xs text-gray-500">Credit Score Ranges</p>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-600">Poor</span>
              <span className="text-gray-500">300-579</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Fair</span>
              <span className="text-gray-500">580-669</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Good</span>
              <span className="text-gray-500">670-739</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Very Good</span>
              <span className="text-gray-500">740-799</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Exceptional</span>
              <span className="text-gray-500">800-850</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
