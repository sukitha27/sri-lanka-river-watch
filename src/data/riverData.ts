export interface RiverBasin {
  id: string;
  name: string;
  stations: HydrometricStation[];
}

export interface HydrometricStation {
  id: string;
  name: string;
  basinId: string;
  currentLevel: number;
  alertLevel: number;
  minorFloodLevel: number;
  majorFloodLevel: number;
  status: 'normal' | 'alert' | 'minor' | 'major';
  lastUpdated: string;
  historicalData: WaterLevelReading[];
}

export interface WaterLevelReading {
  timestamp: string;
  level: number;
  rainfall?: number;
}

export const riverBasins: RiverBasin[] = [
  {
    id: 'malwathu-oya',
    name: 'Malwathu Oya',
    stations: [
      {
        id: 'thanthirimale',
        name: 'Thanthirimale',
        basinId: 'malwathu-oya',
        currentLevel: 5.85,
        alertLevel: 5.0,
        minorFloodLevel: 6.0,
        majorFloodLevel: 7.0,
        status: 'alert',
        lastUpdated: '2025-12-07T05:31:00',
        historicalData: generateHistoricalData(5.85, 4.5, 6.5),
      },
    ],
  },
  {
    id: 'aththanagalu-oya',
    name: 'Aththanagalu Oya',
    stations: [
      {
        id: 'dunamale',
        name: 'Dunamale',
        basinId: 'aththanagalu-oya',
        currentLevel: 1.95,
        alertLevel: 3.0,
        minorFloodLevel: 4.0,
        majorFloodLevel: 5.0,
        status: 'normal',
        lastUpdated: '2025-12-07T08:39:00',
        historicalData: generateHistoricalData(1.95, 1.2, 2.5),
      },
    ],
  },
  {
    id: 'kelani-river',
    name: 'Kelani River',
    stations: [
      {
        id: 'nagalagam-street',
        name: 'Nagalagam Street',
        basinId: 'kelani-river',
        currentLevel: 2.34,
        alertLevel: 4.5,
        minorFloodLevel: 5.5,
        majorFloodLevel: 6.5,
        status: 'normal',
        lastUpdated: '2025-12-07T08:30:00',
        historicalData: generateHistoricalData(2.34, 1.8, 3.2),
      },
      {
        id: 'hanwella',
        name: 'Hanwella',
        basinId: 'kelani-river',
        currentLevel: 3.78,
        alertLevel: 4.0,
        minorFloodLevel: 5.0,
        majorFloodLevel: 6.0,
        status: 'normal',
        lastUpdated: '2025-12-07T08:25:00',
        historicalData: generateHistoricalData(3.78, 2.5, 4.5),
      },
    ],
  },
  {
    id: 'kalu-river',
    name: 'Kalu River',
    stations: [
      {
        id: 'putupaula',
        name: 'Putupaula',
        basinId: 'kalu-river',
        currentLevel: 4.12,
        alertLevel: 4.0,
        minorFloodLevel: 5.0,
        majorFloodLevel: 6.5,
        status: 'alert',
        lastUpdated: '2025-12-07T08:20:00',
        historicalData: generateHistoricalData(4.12, 3.0, 5.0),
      },
      {
        id: 'ratnapura',
        name: 'Ratnapura',
        basinId: 'kalu-river',
        currentLevel: 5.45,
        alertLevel: 5.0,
        minorFloodLevel: 6.0,
        majorFloodLevel: 7.5,
        status: 'minor',
        lastUpdated: '2025-12-07T08:15:00',
        historicalData: generateHistoricalData(5.45, 4.0, 6.2),
      },
    ],
  },
  {
    id: 'nilwala-river',
    name: 'Nilwala River',
    stations: [
      {
        id: 'pitabeddara',
        name: 'Pitabeddara',
        basinId: 'nilwala-river',
        currentLevel: 2.89,
        alertLevel: 3.5,
        minorFloodLevel: 4.5,
        majorFloodLevel: 5.5,
        status: 'normal',
        lastUpdated: '2025-12-07T08:10:00',
        historicalData: generateHistoricalData(2.89, 2.0, 3.5),
      },
    ],
  },
  {
    id: 'gin-river',
    name: 'Gin River',
    stations: [
      {
        id: 'baddegama',
        name: 'Baddegama',
        basinId: 'gin-river',
        currentLevel: 3.21,
        alertLevel: 4.0,
        minorFloodLevel: 5.0,
        majorFloodLevel: 6.0,
        status: 'normal',
        lastUpdated: '2025-12-07T08:05:00',
        historicalData: generateHistoricalData(3.21, 2.5, 4.0),
      },
    ],
  },
];

function generateHistoricalData(currentLevel: number, minLevel: number, maxLevel: number): WaterLevelReading[] {
  const data: WaterLevelReading[] = [];
  const now = new Date();
  
  for (let i = 96; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
    const variation = (Math.random() - 0.5) * (maxLevel - minLevel) * 0.3;
    const trend = (96 - i) / 96 * (currentLevel - (minLevel + maxLevel) / 2);
    let level = (minLevel + maxLevel) / 2 + variation + trend;
    level = Math.max(minLevel, Math.min(maxLevel, level));
    
    if (i === 0) level = currentLevel;
    
    data.push({
      timestamp: timestamp.toISOString(),
      level: Math.round(level * 100) / 100,
      rainfall: Math.random() > 0.7 ? Math.round(Math.random() * 25 * 10) / 10 : 0,
    });
  }
  
  return data;
}

export function getAllStations(): HydrometricStation[] {
  return riverBasins.flatMap(basin => basin.stations);
}

export function getAlertStations(): HydrometricStation[] {
  return getAllStations().filter(station => station.status !== 'normal');
}
