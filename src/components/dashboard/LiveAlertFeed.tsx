import { LiveStation } from "@/hooks/useLiveWaterData";
import { cn } from "@/lib/utils";
import { AlertTriangle, ArrowRight, RefreshCw } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface LiveAlertFeedProps {
  stations: LiveStation[];
  onStationClick: (station: LiveStation) => void;
  isLoading?: boolean;
  lastUpdated?: Date;
}

const statusConfig = {
  normal: { bg: 'bg-success/10', text: 'text-success', dot: 'bg-success' },
  alert: { bg: 'bg-alert/10', text: 'text-alert', dot: 'bg-alert' },
  minor: { bg: 'bg-minor/10', text: 'text-minor', dot: 'bg-minor' },
  major: { bg: 'bg-major/10', text: 'text-major', dot: 'bg-major' },
};

export function LiveAlertFeed({ stations, onStationClick, isLoading, lastUpdated }: LiveAlertFeedProps) {
  // Sort by status priority (major > minor > alert > normal) then by water level
  const sortedStations = [...stations].sort((a, b) => {
    const statusPriority = { major: 4, minor: 3, alert: 2, normal: 1 };
    const priorityDiff = statusPriority[b.status] - statusPriority[a.status];
    if (priorityDiff !== 0) return priorityDiff;
    return b.currentLevel - a.currentLevel;
  });

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <div className="glass rounded-xl h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-border/30">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-warning" />
          <h3 className="font-display font-semibold text-foreground">
            Live Station Feed
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {isLoading && <RefreshCw className="w-3 h-3 text-primary animate-spin" />}
          <span className="text-xs text-muted-foreground">
            {stations.length} stations
          </span>
        </div>
      </div>
      
      {lastUpdated && (
        <div className="px-4 py-2 border-b border-border/20 text-xs text-muted-foreground">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </div>
      )}
      
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {sortedStations.map((station) => {
            const config = statusConfig[station.status];
            
            return (
              <div
                key={station.id}
                onClick={() => onStationClick(station)}
                className={cn(
                  "group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all duration-200",
                  "hover:bg-secondary/50"
                )}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={cn(
                    "w-2 h-2 rounded-full flex-shrink-0",
                    config.dot,
                    station.status !== 'normal' && "animate-pulse-slow"
                  )} />
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground truncate">
                      {formatTime(station.lastUpdated)}
                    </p>
                    <p className="text-sm font-medium text-foreground truncate">
                      {station.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {station.basinName}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={cn("text-sm font-bold", config.text)}>
                    {station.currentLevel.toFixed(2)}m
                  </span>
                  <ArrowRight className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
