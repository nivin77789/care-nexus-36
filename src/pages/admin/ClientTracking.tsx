import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Users, Navigation } from 'lucide-react';
import { useFirebaseCollection } from '@/hooks/useFirebaseData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface Client {
  id: string;
  name: string;
  address: string;
  phone: string;
  careLevel: string;
  latitude?: number;
  longitude?: number;
}

interface Carer {
  id: string;
  name: string;
  email: string;
  phone: string;
  latitude?: number;
  longitude?: number;
}

interface Visit {
  id: string;
  clientId: string;
  clientName: string;
  carerId: string;
  carerName: string;
  status: string;
  scheduledDate: any;
}

export default function ClientTracking() {
  const { data: clients } = useFirebaseCollection<Client>('clients');
  const { data: carers } = useFirebaseCollection<Carer>('carers');
  const { data: visits } = useFirebaseCollection<Visit>('visits');
  const [map, setMap] = useState<L.Map | null>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  // Initialize map
  useEffect(() => {
    if (!map) {
      const newMap = L.map('tracking-map').setView([51.5074, -0.1278], 12);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(newMap);

      setMap(newMap);
    }

    return () => {
      if (map) {
        map.remove();
      }
    };
  }, []);

  // Update markers when data changes
  useEffect(() => {
    if (!map) return;

    // Clear existing markers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        map.removeLayer(layer);
      }
    });

    // Add client markers (blue)
    clients.forEach((client) => {
      if (client.latitude && client.longitude) {
        const clientIcon = L.divIcon({
          className: 'custom-marker',
          html: `<div class="w-8 h-8 bg-blue-600 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
            <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
            </svg>
          </div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        const marker = L.marker([client.latitude, client.longitude], { icon: clientIcon })
          .addTo(map)
          .bindPopup(`
            <div class="p-2">
              <strong class="text-blue-600">Client</strong><br/>
              <strong>${client.name}</strong><br/>
              <small>${client.address}</small><br/>
              <small class="text-muted-foreground">Care Level: ${client.careLevel}</small>
            </div>
          `);

        marker.on('click', () => setSelectedClient(client));
      }
    });

    // Add carer markers (green)
    carers.forEach((carer) => {
      if (carer.latitude && carer.longitude) {
        const carerIcon = L.divIcon({
          className: 'custom-marker',
          html: `<div class="w-8 h-8 bg-green-600 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
            <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
            </svg>
          </div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        L.marker([carer.latitude, carer.longitude], { icon: carerIcon })
          .addTo(map)
          .bindPopup(`
            <div class="p-2">
              <strong class="text-green-600">Carer</strong><br/>
              <strong>${carer.name}</strong><br/>
              <small>${carer.email}</small>
            </div>
          `);
      }
    });

    // Fit bounds if we have locations
    const bounds: L.LatLngBoundsExpression = [];
    clients.forEach((c) => {
      if (c.latitude && c.longitude) bounds.push([c.latitude, c.longitude]);
    });
    carers.forEach((c) => {
      if (c.latitude && c.longitude) bounds.push([c.latitude, c.longitude]);
    });
    
    if (bounds.length > 0) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [map, clients, carers]);

  const activeVisits = visits.filter((v) => v.status === 'in-progress');
  const clientsWithLocation = clients.filter((c) => c.latitude && c.longitude);
  const carersWithLocation = carers.filter((c) => c.latitude && c.longitude);

  return (
    <div className="min-h-screen bg-background p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-7xl space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Client Tracking</h1>
            <p className="mt-1 text-muted-foreground">Real-time location monitoring</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{clients.length}</div>
              <p className="text-xs text-muted-foreground">
                {clientsWithLocation.length} with location
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Carers</CardTitle>
              <Navigation className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{carers.length}</div>
              <p className="text-xs text-muted-foreground">
                {carersWithLocation.length} with location
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Visits</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeVisits.length}</div>
              <p className="text-xs text-muted-foreground">In progress now</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Coverage</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {clients.length > 0 
                  ? Math.round((clientsWithLocation.length / clients.length) * 100)
                  : 0}%
              </div>
              <p className="text-xs text-muted-foreground">Clients tracked</p>
            </CardContent>
          </Card>
        </div>

        {/* Map and Details */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Map */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Live Tracking Map
                </CardTitle>
                <div className="flex gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-blue-600"></div>
                    <span>Clients</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-green-600"></div>
                    <span>Carers</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div id="tracking-map" className="h-[500px] w-full rounded-lg border" />
              </CardContent>
            </Card>
          </div>

          {/* Details Panel */}
          <div className="space-y-4">
            {selectedClient ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Selected Client</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-foreground">{selectedClient.name}</h3>
                    <div className="mt-2 space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        {selectedClient.address}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{selectedClient.careLevel}</Badge>
                      </div>
                    </div>
                  </div>
                  
                  {/* Assigned Carer */}
                  {(() => {
                    const todayVisit = visits.find(
                      (v) => v.clientId === selectedClient.id && v.status !== 'completed'
                    );
                    if (todayVisit) {
                      const assignedCarer = carers.find((c) => c.id === todayVisit.carerId);
                      return (
                        <div className="border-t pt-4">
                          <p className="text-xs font-medium text-muted-foreground mb-2">
                            Assigned Carer
                          </p>
                          <div className="rounded-lg bg-muted p-3">
                            <p className="font-medium">{todayVisit.carerName}</p>
                            {assignedCarer?.phone && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {assignedCarer.phone}
                              </p>
                            )}
                            <Badge className="mt-2" variant={
                              todayVisit.status === 'in-progress' ? 'default' : 'secondary'
                            }>
                              {todayVisit.status}
                            </Badge>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })()}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Active Visits</CardTitle>
                </CardHeader>
                <CardContent>
                  {activeVisits.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No active visits</p>
                  ) : (
                    <div className="space-y-3">
                      {activeVisits.slice(0, 5).map((visit) => (
                        <div key={visit.id} className="rounded-lg border p-3">
                          <p className="font-medium text-sm">{visit.clientName}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Carer: {visit.carerName}
                          </p>
                          <Badge variant="outline" className="mt-2 text-xs">
                            In Progress
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
