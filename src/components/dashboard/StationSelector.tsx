import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { riverBasins, RiverBasin, HydrometricStation } from "@/data/riverData";
import { MapPin, Waves } from "lucide-react";

interface StationSelectorProps {
  selectedBasin: RiverBasin | null;
  selectedStation: HydrometricStation | null;
  onBasinChange: (basin: RiverBasin | null) => void;
  onStationChange: (station: HydrometricStation | null) => void;
}

export function StationSelector({
  selectedBasin,
  selectedStation,
  onBasinChange,
  onStationChange,
}: StationSelectorProps) {
  const handleBasinChange = (basinId: string) => {
    if (basinId === "all") {
      onBasinChange(null);
      onStationChange(null);
    } else {
      const basin = riverBasins.find(b => b.id === basinId);
      onBasinChange(basin || null);
      onStationChange(basin?.stations[0] || null);
    }
  };

  const handleStationChange = (stationId: string) => {
    if (stationId === "all") {
      onStationChange(null);
    } else {
      const station = selectedBasin?.stations.find(s => s.id === stationId);
      onStationChange(station || null);
    }
  };

  return (
    <div className="glass rounded-xl p-4 space-y-4">
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        <MapPin className="w-4 h-4 text-primary" />
        <span>Station Selection</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground uppercase tracking-wide">
            River Basin
          </label>
          <Select
            value={selectedBasin?.id || "all"}
            onValueChange={handleBasinChange}
          >
            <SelectTrigger className="bg-secondary border-border/50 hover:border-primary/50 transition-colors">
              <SelectValue placeholder="Select River Basin" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              <SelectItem value="all">All Basins</SelectItem>
              {riverBasins.map(basin => (
                <SelectItem key={basin.id} value={basin.id}>
                  {basin.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground uppercase tracking-wide">
            Hydrometric Station
          </label>
          <Select
            value={selectedStation?.id || "all"}
            onValueChange={handleStationChange}
            disabled={!selectedBasin}
          >
            <SelectTrigger className="bg-secondary border-border/50 hover:border-primary/50 transition-colors disabled:opacity-50">
              <SelectValue placeholder="Select Station" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              <SelectItem value="all">All Stations</SelectItem>
              {selectedBasin?.stations.map(station => (
                <SelectItem key={station.id} value={station.id}>
                  <div className="flex items-center gap-2">
                    <Waves className="w-3 h-3" />
                    {station.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
