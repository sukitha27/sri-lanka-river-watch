// ArcGIS REST API endpoints for Sri Lanka Irrigation Department
const BASE_URL = 'https://services3.arcgis.com/J7ZFXmR8rSmQ3FGf/ArcGIS/rest/services';

export const API_ENDPOINTS = {
  GAUGES: `${BASE_URL}/gauges_2_view/FeatureServer/0/query`,
  HYDROSTATIONS: `${BASE_URL}/hydrostations/FeatureServer/0/query`,
  RIVER_BASINS: `${BASE_URL}/river_basins/FeatureServer/0/query`,
};

export interface ArcGISFeature<T> {
  attributes: T;
  geometry?: {
    x: number;
    y: number;
  };
}

export interface ArcGISQueryResponse<T> {
  features: ArcGISFeature<T>[];
  exceededTransferLimit?: boolean;
}

export interface GaugeReading {
  objectid: number;
  globalid: string;
  basin: string;
  gauge: string;
  water_level: number;
  rain_fall: number | null;
  CreationDate: number;
  EditDate: number;
  alertpull: number | null;
  minorpull: number | null;
  majorpull: number | null;
}

export interface HydroStation {
  objectid: number;
  no_: number;
  station: string;
  latitude: number;
  longitude: number;
  basin: string;
  Tributory: string;
}

async function queryFeatures<T>(
  endpoint: string,
  params: Record<string, string> = {}
): Promise<ArcGISFeature<T>[]> {
  const defaultParams = {
    where: '1=1',
    outFields: '*',
    f: 'json',
    returnGeometry: 'true',
  };

  const queryParams = new URLSearchParams({ ...defaultParams, ...params });
  const url = `${endpoint}?${queryParams.toString()}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }
    const data: ArcGISQueryResponse<T> = await response.json();
    return data.features || [];
  } catch (error) {
    console.error('Error fetching from ArcGIS API:', error);
    throw error;
  }
}

export async function fetchLiveGaugeData(): Promise<ArcGISFeature<GaugeReading>[]> {
  return queryFeatures<GaugeReading>(API_ENDPOINTS.GAUGES, {
    resultRecordCount: '100',
    orderByFields: 'CreationDate DESC',
  });
}

export async function fetchHistoricalGaugeData(
  stationName: string,
  hoursBack: number = 48
): Promise<ArcGISFeature<GaugeReading>[]> {
  const cutoffTime = Date.now() - hoursBack * 60 * 60 * 1000;
  
  return queryFeatures<GaugeReading>(API_ENDPOINTS.GAUGES, {
    where: `gauge = '${stationName}' AND CreationDate >= ${cutoffTime}`,
    resultRecordCount: '500',
    orderByFields: 'CreationDate ASC',
  });
}

export async function fetchHydroStations(): Promise<ArcGISFeature<HydroStation>[]> {
  return queryFeatures<HydroStation>(API_ENDPOINTS.HYDROSTATIONS, {
    resultRecordCount: '200',
  });
}

export function determineStatus(
  waterLevel: number,
  alert: number | null,
  minor: number | null,
  major: number | null
): 'normal' | 'alert' | 'minor' | 'major' {
  if (major !== null && waterLevel >= major) return 'major';
  if (minor !== null && waterLevel >= minor) return 'minor';
  if (alert !== null && waterLevel >= alert) return 'alert';
  return 'normal';
}

export function formatTimestamp(timestamp: number): string {
  return new Date(timestamp).toISOString();
}
