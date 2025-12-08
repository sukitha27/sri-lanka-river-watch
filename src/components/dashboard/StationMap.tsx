import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { LiveStation } from '@/hooks/useLiveWaterData';
import { Map } from 'lucide-react';

const MAPBOX_TOKEN = 'pk.eyJ1Ijoic3VraXRoYTI3IiwiYSI6ImNtaWp6bnc3NzEzZDIzanNmY2ZyYzd5cHYifQ.XuOERurYe_jUp3QM8j4cag';

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

  useEffect(() => {
    if (!mapContainer.current) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [80.5, 7.5],
      zoom: 7,
      pitch: 30,
    });

    map.current.addControl(
      new mapboxgl.NavigationControl({ visualizePitch: true }),
      'top-right'
    );

    map.current.addControl(new mapboxgl.FullscreenControl(), 'top-right');

    return () => {
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];
      map.current?.remove();
    };
  }, []);

  // Update markers when stations change
  useEffect(() => {
    if (!map.current) return;

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
  }, [stations, selectedStation, onStationClick]);

  // Fly to selected station
  useEffect(() => {
    if (!map.current || !selectedStation?.latitude || !selectedStation?.longitude) return;
    
    map.current.flyTo({
      center: [selectedStation.longitude, selectedStation.latitude],
      zoom: 10,
      duration: 1500,
    });
  }, [selectedStation]);

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
    </div>
  );
};
