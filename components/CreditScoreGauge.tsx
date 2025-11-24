import { motion } from 'motion/react';
import { getScoreRating } from '../lib/credit-score';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';

interface CreditScoreGaugeProps {
  currentScore: number;
  projectedScore?: number;
  showProjection?: boolean;
}

export function CreditScoreGauge({ 
  currentScore, 
  projectedScore, 
  showProjection = false 
}: CreditScoreGaugeProps) {
  const currentRating = getScoreRating(currentScore);
  const projectedRating = projectedScore ? getScoreRating(projectedScore) : null;
  
  const scoreDiff = projectedScore ? projectedScore - currentScore : 0;
  
  // Calculate gauge angle (180 degrees = 300-850 range)
  const currentAngle = ((currentScore - 300) / 550) * 180 - 90;
  const projectedAngle = projectedScore ? ((projectedScore - 300) / 550) * 180 - 90 : currentAngle;
  
  return (
    <div className="relative">
      {/* SVG Gauge */}
      <svg viewBox="0 0 200 120" className="w-full max-w-md mx-auto">
        {/* Background arc segments */}
        <path
          d="M 20 100 A 80 80 0 0 1 100 20"
          fill="none"
          stroke="#fee2e2"
          strokeWidth="12"
          strokeLinecap="round"
        />
        <path
          d="M 100 20 A 80 80 0 0 1 180 100"
          fill="none"
          stroke="#dcfce7"
          strokeWidth="12"
          strokeLinecap="round"
        />
        
        {/* Color segments for score ranges */}
        <defs>
          <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="25%" stopColor="#f59e0b" />
            <stop offset="50%" stopColor="#eab308" />
            <stop offset="75%" stopColor="#22c55e" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
        </defs>
        
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke="url(#scoreGradient)"
          strokeWidth="12"
          strokeLinecap="round"
          opacity="0.3"
        />
        
        {/* Current score indicator */}
        <motion.g
          initial={{ rotate: -90 }}
          animate={{ rotate: currentAngle }}
          transition={{ duration: 1, ease: "easeOut" }}
          style={{ transformOrigin: '100px 100px' }}
        >
          <line
            x1="100"
            y1="100"
            x2="100"
            y2="35"
            stroke="#1f2937"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <circle cx="100" cy="100" r="6" fill="#1f2937" />
        </motion.g>
        
        {/* Projected score indicator (if showing projection) */}
        {showProjection && projectedScore && (
          <motion.g
            initial={{ rotate: currentAngle }}
            animate={{ rotate: projectedAngle }}
            transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
            style={{ transformOrigin: '100px 100px' }}
          >
            <line
              x1="100"
              y1="100"
              x2="100"
              y2="40"
              stroke="#3b82f6"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray="4 2"
            />
            <circle cx="100" cy="100" r="4" fill="#3b82f6" />
          </motion.g>
        )}
        
        {/* Score labels */}
        <text x="20" y="115" className="text-xs fill-gray-500">300</text>
        <text x="170" y="115" className="text-xs fill-gray-500">850</text>
      </svg>
      
      {/* Score display */}
      <div className="text-center mt-4">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className={currentRating.color}>
            {currentRating.rating}
          </div>
          <div className="mt-1">{currentScore}</div>
        </motion.div>
        
        <p className="text-gray-600 text-sm mt-2 max-w-xs mx-auto">
          {currentRating.description}
        </p>
        
        {/* Projected score info */}
        {showProjection && projectedScore && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200"
          >
            <div className="text-sm text-gray-600">Projected Score</div>
            <div className="flex items-center justify-center gap-2 mt-1">
              <span className={projectedRating?.color}>{projectedScore}</span>
              {scoreDiff !== 0 && (
                <span className={`flex items-center gap-1 text-sm ${
                  scoreDiff > 0 ? 'text-green-600' : scoreDiff < 0 ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {scoreDiff > 0 ? <ArrowUp className="w-4 h-4" /> : 
                   scoreDiff < 0 ? <ArrowDown className="w-4 h-4" /> : 
                   <Minus className="w-4 h-4" />}
                  {Math.abs(scoreDiff)} points
                </span>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
