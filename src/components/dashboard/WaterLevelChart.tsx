import { HydrometricStation } from "@/data/riverData";
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip, ReferenceLine, CartesianGrid } from "recharts";
import { TrendingUp } from "lucide-react";

interface WaterLevelChartProps {
  station: HydrometricStation;
}

export function WaterLevelChart({ station }: WaterLevelChartProps) {
  const chartData = station.historicalData.map(reading => ({
    time: new Date(reading.timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
    level: reading.level,
    rainfall: reading.rainfall || 0,
  }));

  const minLevel = Math.min(...station.historicalData.map(r => r.level)) - 0.5;
  const maxLevel = Math.max(...station.historicalData.map(r => r.level), station.majorFloodLevel) + 0.5;

  return (
    <div className="glass rounded-xl p-4 h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary" />
          <h3 className="font-display font-semibold text-foreground">
            Water Level at {station.name}
          </h3>
        </div>
        <span className="text-xs text-muted-foreground">Last 4 Days</span>
      </div>
      
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="waterGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(190, 80%, 50%)" stopOpacity={0.4} />
                <stop offset="100%" stopColor="hsl(190, 80%, 50%)" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="hsl(220, 20%, 20%)" 
              vertical={false}
            />
            
            <XAxis 
              dataKey="time" 
              tick={{ fill: 'hsl(200, 15%, 55%)', fontSize: 10 }}
              axisLine={{ stroke: 'hsl(220, 20%, 20%)' }}
              tickLine={false}
              interval="preserveStartEnd"
            />
            
            <YAxis 
              domain={[minLevel, maxLevel]}
              tick={{ fill: 'hsl(200, 15%, 55%)', fontSize: 10 }}
              axisLine={{ stroke: 'hsl(220, 20%, 20%)' }}
              tickLine={false}
              tickFormatter={(value) => `${value}m`}
            />
            
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(220, 25%, 12%)',
                border: '1px solid hsl(220, 20%, 20%)',
                borderRadius: '8px',
                padding: '8px 12px',
              }}
              labelStyle={{ color: 'hsl(200, 20%, 95%)', fontWeight: 600, marginBottom: 4 }}
              itemStyle={{ color: 'hsl(190, 80%, 50%)' }}
              formatter={(value: number) => [`${value.toFixed(2)}m`, 'Level']}
            />
            
            <ReferenceLine 
              y={station.alertLevel} 
              stroke="hsl(0, 72%, 55%)" 
              strokeDasharray="5 5" 
              strokeWidth={1}
            />
            <ReferenceLine 
              y={station.minorFloodLevel} 
              stroke="hsl(38, 95%, 55%)" 
              strokeDasharray="5 5" 
              strokeWidth={1}
            />
            <ReferenceLine 
              y={station.majorFloodLevel} 
              stroke="hsl(280, 70%, 55%)" 
              strokeDasharray="5 5" 
              strokeWidth={1}
            />
            
            <Area
              type="monotone"
              dataKey="level"
              stroke="hsl(190, 80%, 50%)"
              strokeWidth={2}
              fill="url(#waterGradient)"
              dot={false}
              activeDot={{ r: 4, fill: 'hsl(190, 80%, 50%)', stroke: 'hsl(220, 25%, 8%)', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      <div className="flex items-center justify-center gap-6 mt-4 pt-3 border-t border-border/30">
        <div className="flex items-center gap-2 text-xs">
          <div className="w-4 h-0.5 bg-alert rounded" style={{ borderStyle: 'dashed' }} />
          <span className="text-muted-foreground">Alert ({station.alertLevel}m)</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <div className="w-4 h-0.5 bg-minor rounded" />
          <span className="text-muted-foreground">Minor ({station.minorFloodLevel}m)</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <div className="w-4 h-0.5 bg-major rounded" />
          <span className="text-muted-foreground">Major ({station.majorFloodLevel}m)</span>
        </div>
      </div>
    </div>
  );
}
