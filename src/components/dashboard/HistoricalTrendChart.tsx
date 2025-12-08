import { LiveStation } from "@/hooks/useLiveWaterData";
import { useHistoricalData } from "@/hooks/useHistoricalData";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  CartesianGrid,
} from "recharts";
import { TrendingUp, Clock, Loader2 } from "lucide-react";

interface HistoricalTrendChartProps {
  station: LiveStation;
}

export function HistoricalTrendChart({ station }: HistoricalTrendChartProps) {
  const { data: historicalData, isLoading, error } = useHistoricalData(station.name, 48);

  const hasData = historicalData && historicalData.length > 0;

  // Calculate domain for Y axis
  const allLevels = hasData ? historicalData.map((d) => d.waterLevel) : [station.currentLevel];
  const thresholds = [
    station.alertLevel,
    station.minorFloodLevel,
    station.majorFloodLevel,
  ].filter((v): v is number => v !== null);
  
  const minLevel = Math.max(0, Math.min(...allLevels) - 0.5);
  const maxLevel = Math.max(...allLevels, ...thresholds) * 1.1;

  if (isLoading) {
    return (
      <div className="glass rounded-xl p-4 h-full flex items-center justify-center">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Loading historical data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="glass rounded-xl p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary" />
          <h3 className="font-display font-semibold text-foreground">
            48-Hour Trend: {station.name}
          </h3>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="w-3 h-3" />
          <span>{hasData ? `${historicalData.length} readings` : 'No historical data'}</span>
        </div>
      </div>

      {hasData ? (
        <>
          <div className="flex-1 min-h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={historicalData}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="waterGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis
                  dataKey="formattedTime"
                  tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                  tickLine={false}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                  interval="preserveStartEnd"
                  minTickGap={50}
                />
                <YAxis
                  domain={[minLevel, maxLevel]}
                  tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                  tickLine={false}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                  tickFormatter={(value) => `${value.toFixed(1)}m`}
                  width={50}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                  }}
                  labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600 }}
                  itemStyle={{ color: 'hsl(var(--primary))' }}
                  formatter={(value: number) => [`${value.toFixed(2)}m`, 'Water Level']}
                />
                
                {/* Threshold reference lines */}
                {station.alertLevel && (
                  <ReferenceLine
                    y={station.alertLevel}
                    stroke="hsl(var(--alert))"
                    strokeDasharray="5 5"
                    strokeWidth={1.5}
                  />
                )}
                {station.minorFloodLevel && (
                  <ReferenceLine
                    y={station.minorFloodLevel}
                    stroke="hsl(var(--minor))"
                    strokeDasharray="5 5"
                    strokeWidth={1.5}
                  />
                )}
                {station.majorFloodLevel && (
                  <ReferenceLine
                    y={station.majorFloodLevel}
                    stroke="hsl(var(--major))"
                    strokeDasharray="5 5"
                    strokeWidth={1.5}
                  />
                )}
                
                <Area
                  type="monotone"
                  dataKey="waterLevel"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fill="url(#waterGradient)"
                  dot={false}
                  activeDot={{ r: 4, fill: 'hsl(var(--primary))' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-6 mt-3 pt-3 border-t border-border/30">
            <div className="flex items-center gap-2 text-xs">
              <div className="w-4 h-0.5 bg-alert rounded" />
              <span className="text-muted-foreground">Alert</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-4 h-0.5 bg-minor rounded" />
              <span className="text-muted-foreground">Minor</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-4 h-0.5 bg-major rounded" />
              <span className="text-muted-foreground">Major</span>
            </div>
          </div>
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
          No historical data available for this station
        </div>
      )}
    </div>
  );
}
