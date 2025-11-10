import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin } from 'lucide-react';

// Fix for default marker icons in Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface CarerLocationMapProps {
  latitude: number;
  longitude: number;
  carerName: string;
}

export default function CarerLocationMap({ latitude, longitude, carerName }: CarerLocationMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // Initialize map
    map.current = L.map(mapContainer.current).setView([latitude, longitude], 13);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map.current);

    // Add marker with custom popup
    const marker = L.marker([latitude, longitude]).addTo(map.current);
    marker.bindPopup(`
      <div class="text-center p-2">
        <div class="flex items-center gap-2 justify-center mb-1">
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
          <strong>${carerName}</strong>
        </div>
        <small class="text-muted-foreground">Current Location</small>
      </div>
    `).openPopup();

    // Add a circle to show approximate area
    L.circle([latitude, longitude], {
      color: 'hsl(var(--primary))',
      fillColor: 'hsl(var(--primary))',
      fillOpacity: 0.1,
      radius: 500,
    }).addTo(map.current);

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [latitude, longitude, carerName]);

  return (
    <div className="space-y-2">
      <div ref={mapContainer} className="h-[400px] w-full rounded-lg border border-border" />
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <MapPin className="h-4 w-4" />
        <span>
          Coordinates: {latitude.toFixed(6)}, {longitude.toFixed(6)}
        </span>
      </div>
    </div>
  );
}
