import { Card } from './ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { TimelinePoint } from '../app/page';
import { Calendar } from 'lucide-react';

interface ScoreTimelineProps {
  timeline: TimelinePoint[];
  baseScore: number;
}

export function ScoreTimeline({ timeline, baseScore }: ScoreTimelineProps) {
  const getScoreColor = (score: number) => {
    if (score >= 800) return '#16a34a';
    if (score >= 740) return '#84cc16';
    if (score >= 670) return '#eab308';
    if (score >= 580) return '#f97316';
    return '#ef4444';
  };
  
  // Helper function to format date labels
  const formatDateLabel = (monthOffset: number): string => {
    const now = new Date();
    const targetDate = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
    
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = monthNames[targetDate.getMonth()];
    const year = targetDate.getFullYear();
    
    if (monthOffset === 0) {
      return 'Now';
    }
    
    // Show year only if it's different from current year or if it's January
    if (targetDate.getFullYear() !== now.getFullYear() || monthOffset >= 12) {
      return `${month} ${year}`;
    }
    
    return month;
  };
  
  // Helper function to format full date for tooltip
  const formatFullDate = (monthOffset: number): string => {
    const now = new Date();
    const targetDate = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
    
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                        'July', 'August', 'September', 'October', 'November', 'December'];
    const month = monthNames[targetDate.getMonth()];
    const year = targetDate.getFullYear();
    
    if (monthOffset === 0) {
      return `${month} ${year} (Now)`;
    }
    
    return `${month} ${year}`;
  };
  
  const chartData = timeline.map(point => ({
    month: point.month,
    score: point.score,
    label: formatDateLabel(point.month),
    fullDate: formatFullDate(point.month),
    events: point.events
  }));
  
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200 min-w-[200px]">
          <p className="text-sm font-semibold text-gray-700 mb-1">{data.fullDate}</p>
          <p className="text-lg font-bold mb-2" style={{ color: getScoreColor(data.score) }}>
            Score: {data.score}
          </p>
          {data.events && data.events.length > 0 && (
            <div className="mt-2 pt-2 border-t border-gray-200">
              <p className="text-xs text-gray-500 mb-1">Events:</p>
              {data.events.map((event: string, idx: number) => (
                <p key={idx} className="text-xs text-gray-600">• {event}</p>
              ))}
            </div>
          )}
        </div>
      );
    }
    return null;
  };
  
  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="size-5 text-blue-600" />
            <h2>24-Month Credit Score Projection</h2>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-400 rounded-full" />
              <span className="text-gray-600">Starting</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-600 rounded-full" />
              <span className="text-gray-600">Projected</span>
            </div>
          </div>
        </div>
        
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="label" 
                stroke="#9ca3af"
                tick={{ fontSize: 11 }}
                interval="preserveStartEnd"
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                domain={[300, 850]}
                stroke="#9ca3af"
                tick={{ fontSize: 12 }}
                ticks={[300, 450, 600, 750, 850]}
              />
              <Tooltip content={<CustomTooltip />} />
              
              {/* Reference line for base score */}
              <ReferenceLine 
                y={baseScore} 
                stroke="#9ca3af" 
                strokeDasharray="5 5"
                label={{ value: 'Start', position: 'insideTopLeft', fill: '#6b7280', fontSize: 12 }}
              />
              
              {/* Score range reference lines */}
              <ReferenceLine y={580} stroke="#fca5a5" strokeDasharray="2 2" strokeOpacity={0.3} />
              <ReferenceLine y={670} stroke="#fde047" strokeDasharray="2 2" strokeOpacity={0.3} />
              <ReferenceLine y={740} stroke="#bef264" strokeDasharray="2 2" strokeOpacity={0.3} />
              <ReferenceLine y={800} stroke="#86efac" strokeDasharray="2 2" strokeOpacity={0.3} />
              
              <Line 
                type="monotone" 
                dataKey="score" 
                stroke="#2563eb" 
                strokeWidth={3}
                dot={{ fill: '#2563eb', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        <div className="flex items-center justify-between text-xs text-gray-500 px-2">
          <span>Poor (300-579)</span>
          <span>Fair (580-669)</span>
          <span>Good (670-739)</span>
          <span>Very Good (740-799)</span>
          <span>Exceptional (800+)</span>
        </div>
      </div>
    </Card>
  );
}
