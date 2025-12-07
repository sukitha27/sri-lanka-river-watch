import { HydrometricStation, riverBasins } from "@/data/riverData";
import { cn } from "@/lib/utils";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AlertFeedProps {
  stations: HydrometricStation[];
  onStationClick: (station: HydrometricStation) => void;
}

interface FeedItem {
  station: HydrometricStation;
  basinName: string;
  timestamp: string;
}

export function AlertFeed({ stations, onStationClick }: AlertFeedProps) {
  // Create feed items from recent readings
  const feedItems: FeedItem[] = [];
  
  stations.forEach(station => {
    const basin = riverBasins.find(b => b.id === station.basinId);
    const recentReadings = station.historicalData.slice(-24);
    
    recentReadings.forEach(reading => {
      feedItems.push({
        station,
        basinName: basin?.name || '',
        timestamp: reading.timestamp,
      });
    });
  });

  // Sort by timestamp descending
  feedItems.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getReading = (station: HydrometricStation, timestamp: string) => {
    return station.historicalData.find(r => r.timestamp === timestamp)?.level || station.currentLevel;
  };

  const statusConfig = {
    normal: { bg: 'bg-success/10', text: 'text-success', dot: 'bg-success' },
    alert: { bg: 'bg-alert/10', text: 'text-alert', dot: 'bg-alert' },
    minor: { bg: 'bg-minor/10', text: 'text-minor', dot: 'bg-minor' },
    major: { bg: 'bg-major/10', text: 'text-major', dot: 'bg-major' },
  };

  return (
    <div className="glass rounded-xl h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-border/30">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-warning" />
          <h3 className="font-display font-semibold text-foreground">
            Alert Level Stations
          </h3>
        </div>
        <span className="text-xs text-muted-foreground">Last 24 Hours</span>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {feedItems.slice(0, 50).map((item, index) => {
            const config = statusConfig[item.station.status];
            const level = getReading(item.station, item.timestamp);
            
            return (
              <div
                key={`${item.station.id}-${item.timestamp}-${index}`}
                onClick={() => onStationClick(item.station)}
                className={cn(
                  "group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all duration-200",
                  "hover:bg-secondary/50"
                )}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={cn("w-2 h-2 rounded-full flex-shrink-0", config.dot)} />
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground truncate">
                      {formatTime(item.timestamp)}
                    </p>
                    <p className="text-sm font-medium text-foreground truncate">
                      {item.station.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      River Basin: {item.basinName}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={cn("text-sm font-bold", config.text)}>
                    {level.toFixed(2)}m
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
