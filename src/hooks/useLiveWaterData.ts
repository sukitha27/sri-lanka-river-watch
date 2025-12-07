import { useQuery } from '@tanstack/react-query';
import { 
  fetchLiveGaugeData, 
  fetchHydroStations, 
  determineStatus, 
  formatTimestamp,
  type GaugeReading,
  type ArcGISFeature 
} from '@/services/arcgisApi';

export interface LiveStation {
  id: string;
  name: string;
  basinId: string;
  basinName: string;
  currentLevel: number;
  rainfall: number;
  alertLevel: number | null;
  minorFloodLevel: number | null;
  majorFloodLevel: number | null;
  status: 'normal' | 'alert' | 'minor' | 'major';
  lastUpdated: string;
  latitude: number;
  longitude: number;
}

export interface LiveRiverBasin {
  id: string;
  name: string;
  stations: LiveStation[];
}

function transformGaugeData(features: ArcGISFeature<GaugeReading>[]): {
  stations: LiveStation[];
  basins: LiveRiverBasin[];
} {
  const stationsMap = new Map<string, LiveStation>();
  const basinsMap = new Map<string, LiveRiverBasin>();

  features.forEach((feature) => {
    const { attributes, geometry } = feature;
    
    // Skip entries with no gauge name or invalid coordinates
    if (!attributes.gauge || !attributes.basin) return;
    
    const stationId = attributes.gauge.toLowerCase().replace(/\s+/g, '-');
    const basinId = attributes.basin.toLowerCase().replace(/\s+/g, '-');
    
    // Only keep the latest reading for each station
    if (!stationsMap.has(stationId) || 
        attributes.CreationDate > (stationsMap.get(stationId)?.lastUpdated ? new Date(stationsMap.get(stationId)!.lastUpdated).getTime() : 0)) {
      
      const station: LiveStation = {
        id: stationId,
        name: attributes.gauge,
        basinId: basinId,
        basinName: attributes.basin,
        currentLevel: attributes.water_level ?? 0,
        rainfall: attributes.rain_fall ?? 0,
        alertLevel: attributes.alertpull,
        minorFloodLevel: attributes.minorpull,
        majorFloodLevel: attributes.majorpull,
        status: determineStatus(
          attributes.water_level ?? 0,
          attributes.alertpull,
          attributes.minorpull,
          attributes.majorpull
        ),
        lastUpdated: formatTimestamp(attributes.CreationDate),
        latitude: geometry?.y ?? 0,
        longitude: geometry?.x ?? 0,
      };
      
      stationsMap.set(stationId, station);
    }
  });

  // Group stations by basin
  stationsMap.forEach((station) => {
    if (!basinsMap.has(station.basinId)) {
      basinsMap.set(station.basinId, {
        id: station.basinId,
        name: station.basinName,
        stations: [],
      });
    }
    basinsMap.get(station.basinId)!.stations.push(station);
  });

  // Sort basins and stations alphabetically
  const basins = Array.from(basinsMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  basins.forEach((basin) => {
    basin.stations.sort((a, b) => a.name.localeCompare(b.name));
  });

  return {
    stations: Array.from(stationsMap.values()),
    basins,
  };
}

export function useLiveWaterData() {
  return useQuery({
    queryKey: ['liveWaterData'],
    queryFn: async () => {
      const features = await fetchLiveGaugeData();
      return transformGaugeData(features);
    },
    refetchInterval: 60000, // Refetch every minute
    staleTime: 30000, // Consider data stale after 30 seconds
    retry: 3,
  });
}

export function useHydroStations() {
  return useQuery({
    queryKey: ['hydroStations'],
    queryFn: fetchHydroStations,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
