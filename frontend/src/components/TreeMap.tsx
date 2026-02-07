import { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface MapProps {
  trees: Array<{
    _id: string;
    treeId: string;
    species: string;
    commonName: string;
    location: {
      coordinates: [number, number];
      address: string;
    };
    currentHealth: string;
    images?: string[];
  }>;
  center?: { lat: number; lng: number };
  zoom?: number;
  height?: string;
}

export default function TreeMap({ trees, center, zoom = 12, height = '500px' }: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);
  const [loading, setLoading] = useState(true);

  // Default center to Gampaha, Sri Lanka
  const defaultCenter: [number, number] = center ? [center.lat, center.lng] : [7.0917, 80.0167];

  // Fix Leaflet default icon issue
  useEffect(() => {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });
  }, []);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Initialize Map
    const map = L.map(mapRef.current).setView(defaultCenter, zoom);

    // Add Tile Layer (OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    mapInstanceRef.current = map;
    markersRef.current = L.layerGroup().addTo(map);
    setLoading(false);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current || !markersRef.current || !trees.length) return;

    const map = mapInstanceRef.current;
    const markerGroup = markersRef.current;

    // Clear existing markers
    markerGroup.clearLayers();

    // Health status colors
    const healthColors: Record<string, string> = {
      excellent: '#22c55e',
      good: '#84cc16',
      fair: '#eab308',
      poor: '#f97316',
      dead: '#ef4444',
    };

    const bounds: L.LatLngExpression[] = [];

    trees.forEach((tree) => {
      if (!tree.location?.coordinates || tree.location.coordinates.length < 2) return;
      
      const [lng, lat] = tree.location.coordinates;
      const position: [number, number] = [lat, lng];
      bounds.push(position);

      const markerColor = healthColors[tree.currentHealth] || '#22c55e';
      
      // Create custom div icon for colored markers
      const customIcon = L.divIcon({
        className: 'custom-tree-marker',
        html: `<div style="background-color: ${markerColor}; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.3);"></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });

      const marker = L.marker(position, { icon: customIcon });

      // Get first image or use a reliable placeholder
      const treeImage = tree.images?.[0] || 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400';

      // Create popup content
      const popupContent = `
        <div style="padding: 2px; min-width: 220px; font-family: 'Inter', sans-serif;">
          ${tree.images?.length > 0 ? `
            <div style="width: 100%; height: 120px; border-radius: 8px; overflow: hidden; margin-bottom: 10px; border: 1px solid #e5e7eb;">
              <img src="${treeImage}" style="width: 100%; height: 100%; object-fit: cover;" alt="${tree.commonName}" />
            </div>
          ` : ''}
          <h3 style="margin: 0 0 6px 0; font-size: 15px; font-weight: 800; color: #111827;">
            ${tree.commonName}
          </h3>
          <div style="display: flex; flex-direction: column; gap: 4px; font-size: 11px; color: #4b5563;">
            <span><strong>Species:</strong> ${tree.species}</span>
            <span><strong>Tree ID:</strong> <code style="background: #f3f4f6; padding: 1px 4px; border-radius: 4px; font-size: 10px;">${tree.treeId}</code></span>
            <span><strong>Location:</strong> ${tree.location.address}</span>
            <div style="margin-top: 4px; display: flex; items-center; gap: 6px;">
              <strong>Health:</strong>
              <span style="color: ${markerColor}; font-weight: 800; text-transform: capitalize;">${tree.currentHealth}</span>
            </div>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);
      markerGroup.addLayer(marker);
    });

    // Fit map to markers
    if (bounds.length > 1) {
      map.fitBounds(L.latLngBounds(bounds), { padding: [40, 40] });
    } else if (bounds.length === 1) {
      map.setView(bounds[0], 15);
    }
  }, [trees]);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-border shadow-xl" style={{ height }}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-[1000]">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm font-medium text-muted-foreground tracking-tight">Loading map...</p>
          </div>
        </div>
      )}
      <div ref={mapRef} className="w-full h-full z-0" />
      
      {/* Legend */}
      <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl p-4 border border-white/40 z-[1000] min-w-[140px]">
        <p className="text-xs font-black text-slate-900 uppercase tracking-widest mb-3 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          Tree Health
        </p>
        <div className="grid gap-2">
          {[
            { label: 'Excellent', color: '#22c55e' },
            { label: 'Good', color: '#84cc16' },
            { label: 'Fair', color: '#eab308' },
            { label: 'Poor', color: '#f97316' },
            { label: 'Dead', color: '#ef4444' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-3 group">
              <div
                className="w-3.5 h-3.5 rounded-full border-2 border-white shadow-sm transition-transform group-hover:scale-110"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-[11px] font-bold text-slate-600 tracking-tight group-hover:text-slate-900 transition-colors uppercase">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .leaflet-container {
          background-color: #f8fafc;
        }
        .leaflet-popup-content-wrapper {
          border-radius: 12px;
          padding: 0;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        }
        .leaflet-popup-content {
          margin: 12px;
        }
        .leaflet-top.leaflet-left {
          margin: 12px;
        }
        .leaflet-bar {
          border: none !important;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1) !important;
          border-radius: 8px !important;
          overflow: hidden;
        }
        .leaflet-bar a {
          background-color: white !important;
          border-bottom: 1px solid #f1f5f9 !important;
          color: #475569 !important;
        }
        .leaflet-bar a:hover {
          background-color: #f8fafc !important;
          color: #1e293b !important;
        }
      `}</style>
    </div>
  );
}
