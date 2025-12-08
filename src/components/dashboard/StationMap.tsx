import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { LiveStation } from '@/hooks/useLiveWaterData';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Map, Key } from 'lucide-react';

interface StationMapProps {
  stations: LiveStation[];
  selectedStation: LiveStation | null;
  onStationClick: (station: LiveStation) => void;
}

const STATUS_COLORS: Record<string, string> = {
  normal: '#22c55e',
  alert: '#eab308',
  minor: '#f97316',
  major: '#ef4444',
};

export const StationMap: React.FC<StationMapProps> = ({
  stations,
  selectedStation,
  onStationClick,
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [mapboxToken, setMapboxToken] = useState<string>(() => {
    return localStorage.getItem('mapbox_token') || '';
  });
  const [showTokenInput, setShowTokenInput] = useState(!mapboxToken);
  const [tokenInput, setTokenInput] = useState('');

  const handleTokenSubmit = () => {
    if (tokenInput.trim()) {
      localStorage.setItem('mapbox_token', tokenInput.trim());
      setMapboxToken(tokenInput.trim());
      setShowTokenInput(false);
    }
  };

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;

    mapboxgl.accessToken = mapboxToken;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [80.5, 7.5], // Center of Sri Lanka
      zoom: 7,
      pitch: 30,
    });

    map.current.addControl(
      new mapboxgl.NavigationControl({ visualizePitch: true }),
      'top-right'
    );

    return () => {
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];
      map.current?.remove();
    };
  }, [mapboxToken]);

  // Update markers when stations change
  useEffect(() => {
    if (!map.current || !mapboxToken) return;

    // Remove existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add new markers
    stations.forEach(station => {
      if (!station.latitude || !station.longitude) return;

      const el = document.createElement('div');
      el.className = 'station-marker';
      el.style.cssText = `
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background: ${STATUS_COLORS[station.status]};
        border: 2px solid white;
        box-shadow: 0 0 10px ${STATUS_COLORS[station.status]}80;
        cursor: pointer;
        transition: transform 0.2s, box-shadow 0.2s;
      `;

      if (selectedStation?.id === station.id) {
        el.style.transform = 'scale(1.5)';
        el.style.boxShadow = `0 0 20px ${STATUS_COLORS[station.status]}`;
      }

      el.addEventListener('mouseenter', () => {
        el.style.transform = 'scale(1.3)';
      });
      el.addEventListener('mouseleave', () => {
        if (selectedStation?.id !== station.id) {
          el.style.transform = 'scale(1)';
        }
      });

      const popup = new mapboxgl.Popup({ offset: 25, closeButton: false })
        .setHTML(`
          <div style="padding: 8px; color: #fff; background: #1a1a2e; border-radius: 8px;">
            <div style="font-weight: 600; margin-bottom: 4px;">${station.name}</div>
            <div style="font-size: 12px; opacity: 0.8;">${station.basinName}</div>
            <div style="font-size: 14px; font-weight: 600; color: ${STATUS_COLORS[station.status]}; margin-top: 4px;">
              ${station.currentLevel.toFixed(2)}m
            </div>
          </div>
        `);

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([station.longitude, station.latitude])
        .setPopup(popup)
        .addTo(map.current!);

      el.addEventListener('click', () => {
        onStationClick(station);
      });

      markersRef.current.push(marker);
    });
  }, [stations, selectedStation, onStationClick, mapboxToken]);

  // Fly to selected station
  useEffect(() => {
    if (!map.current || !selectedStation?.latitude || !selectedStation?.longitude) return;
    
    map.current.flyTo({
      center: [selectedStation.longitude, selectedStation.latitude],
      zoom: 10,
      duration: 1500,
    });
  }, [selectedStation]);

  if (showTokenInput) {
    return (
      <div className="glass rounded-xl p-6 h-full flex flex-col items-center justify-center gap-4">
        <div className="text-center space-y-2">
          <Map className="w-12 h-12 text-primary mx-auto" />
          <h3 className="font-display font-semibold text-foreground">Map Visualization</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            Enter your Mapbox public token to display an interactive map of station locations.
            Get your token from{' '}
            <a 
              href="https://mapbox.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              mapbox.com
            </a>
          </p>
        </div>
        <div className="flex gap-2 w-full max-w-md">
          <Input
            type="text"
            placeholder="pk.eyJ1..."
            value={tokenInput}
            onChange={(e) => setTokenInput(e.target.value)}
            className="flex-1"
          />
          <Button onClick={handleTokenSubmit} disabled={!tokenInput.trim()}>
            <Key className="w-4 h-4 mr-2" />
            Set Token
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="glass rounded-xl overflow-hidden h-full relative">
      <div ref={mapContainer} className="w-full h-full min-h-[300px]" />
      <div className="absolute top-3 left-3 glass-strong rounded-lg px-3 py-2">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Map className="w-4 h-4 text-primary" />
          Station Map
        </h3>
      </div>
      <div className="absolute bottom-3 left-3 glass-strong rounded-lg px-3 py-2">
        <div className="flex items-center gap-3 text-xs">
          {Object.entries(STATUS_COLORS).map(([status, color]) => (
            <div key={status} className="flex items-center gap-1.5">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}80` }}
              />
              <span className="capitalize text-muted-foreground">{status === 'minor' ? 'Minor Flood' : status === 'major' ? 'Major Flood' : status}</span>
            </div>
          ))}
        </div>
      </div>
      <button
        onClick={() => {
          localStorage.removeItem('mapbox_token');
          setMapboxToken('');
          setShowTokenInput(true);
        }}
        className="absolute top-3 right-12 glass-strong rounded-lg px-2 py-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        Change Token
      </button>
    </div>
  );
};
