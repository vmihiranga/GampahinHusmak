/// <reference types="@types/google.maps" />
import { useEffect, useRef, useState } from 'react';
import { Loader } from 'lucide-react';

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
  }>;
  center?: { lat: number; lng: number };
  zoom?: number;
  height?: string;
}

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8';

export default function TreeMap({ trees, center, zoom = 12, height = '500px' }: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [loading, setLoading] = useState(true);
  const markersRef = useRef<google.maps.Marker[]>([]);

  // Default center to Gampaha, Sri Lanka
  const defaultCenter = center || { lat: 7.0917, lng: 80.0167 };

  useEffect(() => {
    // Load Google Maps script
    const loadGoogleMaps = () => {
      if (window.google && window.google.maps) {
        initMap();
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => initMap();
      document.head.appendChild(script);
    };

    const initMap = () => {
      if (!mapRef.current) return;

      const mapInstance = new google.maps.Map(mapRef.current, {
        center: defaultCenter,
        zoom: zoom,
        mapTypeControl: true,
        streetViewControl: false,
        fullscreenControl: true,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ]
      });

      setMap(mapInstance);
      setLoading(false);
    };

    loadGoogleMaps();
  }, []);

  useEffect(() => {
    if (!map || !trees.length) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // Health status colors
    const healthColors: Record<string, string> = {
      excellent: '#22c55e',
      good: '#84cc16',
      fair: '#eab308',
      poor: '#f97316',
      dead: '#ef4444',
    };

    // Add markers for each tree
    const bounds = new google.maps.LatLngBounds();

    trees.forEach((tree) => {
      const [lng, lat] = tree.location.coordinates;
      const position = { lat, lng };

      // Create custom marker icon
      const markerColor = healthColors[tree.currentHealth] || '#22c55e';
      
      const marker = new google.maps.Marker({
        position,
        map,
        title: tree.commonName,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: markerColor,
          fillOpacity: 0.9,
          strokeColor: '#ffffff',
          strokeWeight: 2,
        },
        animation: google.maps.Animation.DROP,
      });

      // Create info window
      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="padding: 8px; max-width: 250px;">
            <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #1f2937;">
              ${tree.commonName}
            </h3>
            <p style="margin: 0 0 4px 0; font-size: 13px; color: #6b7280;">
              <strong>Species:</strong> ${tree.species}
            </p>
            <p style="margin: 0 0 4px 0; font-size: 13px; color: #6b7280;">
              <strong>Tree ID:</strong> ${tree.treeId}
            </p>
            <p style="margin: 0 0 4px 0; font-size: 13px; color: #6b7280;">
              <strong>Location:</strong> ${tree.location.address}
            </p>
            <p style="margin: 0; font-size: 13px;">
              <strong>Health:</strong> 
              <span style="color: ${markerColor}; font-weight: 600; text-transform: capitalize;">
                ${tree.currentHealth}
              </span>
            </p>
          </div>
        `,
      });

      marker.addListener('click', () => {
        infoWindow.open(map, marker);
      });

      markersRef.current.push(marker);
      bounds.extend(position);
    });

    // Fit map to show all markers
    if (trees.length > 1) {
      map.fitBounds(bounds);
    } else if (trees.length === 1) {
      const [lng, lat] = trees[0].location.coordinates;
      map.setCenter({ lat, lng });
      map.setZoom(15);
    }
  }, [map, trees]);

  return (
    <div className="relative w-full rounded-lg overflow-hidden border border-border shadow-lg" style={{ height }}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-10">
          <div className="flex flex-col items-center gap-3">
            <Loader className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading map...</p>
          </div>
        </div>
      )}
      <div ref={mapRef} className="w-full h-full" />
      
      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-3 border border-border">
        <p className="text-xs font-semibold text-foreground mb-2">Tree Health</p>
        <div className="space-y-1">
          {[
            { label: 'Excellent', color: '#22c55e' },
            { label: 'Good', color: '#84cc16' },
            { label: 'Fair', color: '#eab308' },
            { label: 'Poor', color: '#f97316' },
            { label: 'Dead', color: '#ef4444' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full border-2 border-white"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-xs text-muted-foreground">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

declare global {
  interface Window {
    google: typeof google;
  }
}
