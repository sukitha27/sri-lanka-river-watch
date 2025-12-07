import { LiveStation } from "@/hooks/useLiveWaterData";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus, Clock, Droplets } from "lucide-react";

interface LiveWaterLevelCardProps {
  station: LiveStation;
  onClick?: () => void;
  isSelected?: boolean;
}

const statusConfig = {
  normal: {
    bg: 'bg-success/10',
    border: 'border-success/30',
    text: 'text-success',
    label: 'Normal',
  },
  alert: {
    bg: 'bg-alert/10',
    border: 'border-alert/30',
    text: 'text-alert',
    label: 'Alert',
  },
  minor: {
    bg: 'bg-minor/10',
    border: 'border-minor/30',
    text: 'text-minor',
    label: 'Minor Flood',
  },
  major: {
    bg: 'bg-major/10',
    border: 'border-major/30',
    text: 'text-major',
    label: 'Major Flood',
  },
};

export function LiveWaterLevelCard({ station, onClick, isSelected }: LiveWaterLevelCardProps) {
  const config = statusConfig[station.status];
  
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "glass rounded-xl p-4 cursor-pointer transition-all duration-300 hover:scale-[1.02]",
        isSelected && "ring-2 ring-primary glow",
        config.border
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-display font-semibold text-foreground">{station.name}</h3>
          <p className="text-xs text-muted-foreground">{station.basinName}</p>
        </div>
        <div className={cn("px-2 py-0.5 rounded-full text-xs font-medium", config.bg, config.text)}>
          {config.label}
        </div>
      </div>
      
      <div className="flex items-end justify-between">
        <div>
          <div className="flex items-baseline gap-1">
            <span className={cn("text-3xl font-display font-bold", config.text)}>
              {station.currentLevel.toFixed(2)}
            </span>
            <span className="text-sm text-muted-foreground">m</span>
          </div>
          
          {station.rainfall > 0 && (
            <div className="flex items-center gap-1 mt-1">
              <Droplets className="w-3 h-3 text-primary" />
              <span className="text-xs text-primary">
                {station.rainfall.toFixed(1)}mm rain
              </span>
            </div>
          )}
        </div>
        
        <div className="text-right">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>{formatTime(station.lastUpdated)}</span>
          </div>
          <p className="text-xs text-muted-foreground/70">{formatDate(station.lastUpdated)}</p>
        </div>
      </div>
      
      {(station.alertLevel || station.minorFloodLevel || station.majorFloodLevel) && (
        <div className="mt-3 pt-3 border-t border-border/30">
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div>
              <p className="text-muted-foreground">Alert</p>
              <p className="font-medium text-alert">{station.alertLevel?.toFixed(1) ?? '-'}m</p>
            </div>
            <div>
              <p className="text-muted-foreground">Minor</p>
              <p className="font-medium text-minor">{station.minorFloodLevel?.toFixed(1) ?? '-'}m</p>
            </div>
            <div>
              <p className="text-muted-foreground">Major</p>
              <p className="font-medium text-major">{station.majorFloodLevel?.toFixed(1) ?? '-'}m</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
