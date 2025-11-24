import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

interface TimelineChartProps {
  data: { month: number; score: number }[];
  currentScore: number;
}

export function TimelineChart({ data, currentScore }: TimelineChartProps) {
  return (
    <div>
      <h3 className="mb-1">12-Month Score Projection</h3>
      <p className="text-sm text-gray-600 mb-4">
        See how your credit score may evolve over the next year
      </p>
      
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="month" 
            label={{ value: 'Months', position: 'insideBottom', offset: -5 }}
            stroke="#6b7280"
          />
          <YAxis 
            domain={[300, 850]}
            label={{ value: 'Credit Score', angle: -90, position: 'insideLeft' }}
            stroke="#6b7280"
          />
          <Tooltip 
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
                    <p className="text-sm text-gray-600">
                      Month {data.month}
                    </p>
                    <p className="text-lg">
                      Score: {data.score}
                    </p>
                    {data.month === 0 && (
                      <p className="text-xs text-gray-500 mt-1">Current</p>
                    )}
                  </div>
                );
              }
              return null;
            }}
          />
          
          {/* Reference lines for credit score categories */}
          <ReferenceLine y={670} stroke="#3b82f6" strokeDasharray="3 3" opacity={0.3} />
          <ReferenceLine y={740} stroke="#22c55e" strokeDasharray="3 3" opacity={0.3} />
          <ReferenceLine y={800} stroke="#10b981" strokeDasharray="3 3" opacity={0.3} />
          
          {/* Main score line */}
          <Line 
            type="monotone" 
            dataKey="score" 
            stroke="#3b82f6" 
            strokeWidth={3}
            dot={{ fill: '#3b82f6', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
      
      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4 text-xs text-gray-600">
        <div className="flex items-center gap-2">
          <div className="w-8 h-0.5 bg-gray-300" style={{ borderTop: '2px dashed #10b981' }} />
          <span>Exceptional (800+)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-0.5 bg-gray-300" style={{ borderTop: '2px dashed #22c55e' }} />
          <span>Very Good (740+)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-0.5 bg-gray-300" style={{ borderTop: '2px dashed #3b82f6' }} />
          <span>Good (670+)</span>
        </div>
      </div>
    </div>
  );
}
