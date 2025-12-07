import { LiveStation } from "@/hooks/useLiveWaterData";
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip, ReferenceLine, CartesianGrid } from "recharts";
import { TrendingUp, AlertCircle } from "lucide-react";

interface LiveWaterLevelChartProps {
  station: LiveStation;
}

export function LiveWaterLevelChart({ station }: LiveWaterLevelChartProps) {
  // Create chart data showing current level against thresholds
  const chartData = [
    { name: 'Alert', level: station.alertLevel || 0, type: 'threshold' },
    { name: 'Current', level: station.currentLevel, type: 'current' },
    { name: 'Minor', level: station.minorFloodLevel || 0, type: 'threshold' },
    { name: 'Major', level: station.majorFloodLevel || 0, type: 'threshold' },
  ].filter(d => d.level > 0);

  const maxLevel = Math.max(
    station.currentLevel,
    station.majorFloodLevel || 0,
    station.minorFloodLevel || 0,
    station.alertLevel || 0
  ) * 1.2;

  const minLevel = 0;

  // Calculate percentage of each threshold
  const getPercentage = (value: number | null) => {
    if (!value || !station.majorFloodLevel) return 0;
    return (value / station.majorFloodLevel) * 100;
  };

  return (
    <div className="glass rounded-xl p-4 h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary" />
          <h3 className="font-display font-semibold text-foreground">
            Water Level at {station.name}
          </h3>
        </div>
        <span className="text-xs text-muted-foreground">
          {new Date(station.lastUpdated).toLocaleString()}
        </span>
      </div>
      
      {/* Visual level indicator */}
      <div className="mb-6">
        <div className="relative h-32 bg-secondary/30 rounded-lg overflow-hidden">
          {/* Threshold markers */}
          {station.majorFloodLevel && (
            <div 
              className="absolute left-0 right-0 border-t-2 border-dashed border-major/60 z-10"
              style={{ bottom: `${getPercentage(station.majorFloodLevel)}%` }}
            >
              <span className="absolute right-2 -top-4 text-xs text-major">
                Major {station.majorFloodLevel}m
              </span>
            </div>
          )}
          {station.minorFloodLevel && (
            <div 
              className="absolute left-0 right-0 border-t-2 border-dashed border-minor/60 z-10"
              style={{ bottom: `${getPercentage(station.minorFloodLevel)}%` }}
            >
              <span className="absolute right-2 -top-4 text-xs text-minor">
                Minor {station.minorFloodLevel}m
              </span>
            </div>
          )}
          {station.alertLevel && (
            <div 
              className="absolute left-0 right-0 border-t-2 border-dashed border-alert/60 z-10"
              style={{ bottom: `${getPercentage(station.alertLevel)}%` }}
            >
              <span className="absolute right-2 -top-4 text-xs text-alert">
                Alert {station.alertLevel}m
              </span>
            </div>
          )}
          
          {/* Water level fill */}
          <div 
            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-primary/60 to-primary/20 transition-all duration-1000"
            style={{ 
              height: `${Math.min((station.currentLevel / (station.majorFloodLevel || station.currentLevel * 1.5)) * 100, 100)}%` 
            }}
          >
            <div className="absolute top-0 left-0 right-0 h-2 bg-primary/80 animate-pulse" />
          </div>
          
          {/* Current level label */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p className="text-4xl font-display font-bold text-foreground">
                {station.currentLevel.toFixed(2)}
              </p>
              <p className="text-sm text-muted-foreground">meters</p>
            </div>
          </div>
        </div>
      </div>

      {/* Station info grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-border/30">
        <div className="text-center">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Basin</p>
          <p className="text-sm font-medium text-foreground mt-1">{station.basinName}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Rainfall</p>
          <p className="text-sm font-medium text-primary mt-1">{station.rainfall.toFixed(1)} mm</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Latitude</p>
          <p className="text-sm font-medium text-foreground mt-1">{station.latitude.toFixed(4)}°</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Longitude</p>
          <p className="text-sm font-medium text-foreground mt-1">{station.longitude.toFixed(4)}°</p>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-4 pt-3 border-t border-border/30">
        <div className="flex items-center gap-2 text-xs">
          <div className="w-4 h-0.5 bg-alert rounded" />
          <span className="text-muted-foreground">Alert Level</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <div className="w-4 h-0.5 bg-minor rounded" />
          <span className="text-muted-foreground">Minor Flood</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <div className="w-4 h-0.5 bg-major rounded" />
          <span className="text-muted-foreground">Major Flood</span>
        </div>
      </div>
    </div>
  );
}
