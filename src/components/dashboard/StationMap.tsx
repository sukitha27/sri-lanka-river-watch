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
      
      const isSelected = selectedStation?.id === station.id;
      const size = isSelected ? 20 : 14;
      
      el.style.cssText = `
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        background: ${STATUS_COLORS[station.status]};
        border: 2px solid white;
        box-shadow: 0 0 ${isSelected ? 20 : 10}px ${STATUS_COLORS[station.status]}${isSelected ? '' : '80'};
        cursor: pointer;
        transition: box-shadow 0.2s ease;
      `;

      el.addEventListener('mouseenter', () => {
        el.style.boxShadow = `0 0 20px ${STATUS_COLORS[station.status]}, 0 0 30px ${STATUS_COLORS[station.status]}60`;
      });
      el.addEventListener('mouseleave', () => {
        el.style.boxShadow = `0 0 ${isSelected ? 20 : 10}px ${STATUS_COLORS[station.status]}${isSelected ? '' : '80'}`;
      });

      const statusLabel = station.status === 'minor' ? 'Minor Flood' : station.status === 'major' ? 'Major Flood' : station.status.charAt(0).toUpperCase() + station.status.slice(1);
      
      const popup = new mapboxgl.Popup({ offset: 15, closeButton: false, className: 'station-popup' })
        .setHTML(`
          <div style="
            padding: 12px 16px;
            color: #fff;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            border-radius: 12px;
            border: 1px solid rgba(255,255,255,0.1);
            box-shadow: 0 8px 32px rgba(0,0,0,0.4);
            min-width: 180px;
          ">
            <div style="font-weight: 700; font-size: 14px; margin-bottom: 6px; color: #fff;">${station.name}</div>
            <div style="font-size: 11px; color: rgba(255,255,255,0.6); margin-bottom: 10px;">${station.basinName}</div>
            <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.1);">
              <div>
                <div style="font-size: 10px; color: rgba(255,255,255,0.5); text-transform: uppercase; letter-spacing: 0.5px;">Water Level</div>
                <div style="font-size: 18px; font-weight: 700; color: ${STATUS_COLORS[station.status]};">${station.currentLevel.toFixed(2)}m</div>
              </div>
              <div style="
                padding: 4px 10px;
                border-radius: 20px;
                font-size: 10px;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                background: ${STATUS_COLORS[station.status]}20;
                color: ${STATUS_COLORS[station.status]};
                border: 1px solid ${STATUS_COLORS[station.status]}40;
              ">${statusLabel}</div>
            </div>
            ${station.rainfall > 0 ? `
              <div style="margin-top: 8px; font-size: 11px; color: rgba(255,255,255,0.7);">
                🌧️ Rainfall: ${station.rainfall.toFixed(1)}mm
              </div>
            ` : ''}
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
