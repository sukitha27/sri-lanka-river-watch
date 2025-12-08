import { useQuery } from '@tanstack/react-query';
import { fetchHistoricalGaugeData, type GaugeReading, type ArcGISFeature } from '@/services/arcgisApi';

export interface HistoricalReading {
  timestamp: number;
  waterLevel: number;
  rainfall: number;
  formattedTime: string;
}

function transformHistoricalData(features: ArcGISFeature<GaugeReading>[]): HistoricalReading[] {
  return features.map((feature) => ({
    timestamp: feature.attributes.CreationDate,
    waterLevel: feature.attributes.water_level ?? 0,
    rainfall: feature.attributes.rain_fall ?? 0,
    formattedTime: new Date(feature.attributes.CreationDate).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
  }));
}

export function useHistoricalData(stationName: string | null, hoursBack: number = 48) {
  return useQuery({
    queryKey: ['historicalData', stationName, hoursBack],
    queryFn: async () => {
      if (!stationName) return [];
      const features = await fetchHistoricalGaugeData(stationName, hoursBack);
      return transformHistoricalData(features);
    },
    enabled: !!stationName,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}
