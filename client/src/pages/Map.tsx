import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Layers, Navigation } from "lucide-react";
import { mockData } from "@/lib/mockData";

// Fix for default marker icon in Leaflet with React
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

export default function Map() {
  const { jobs } = mockData;
  const center: [number, number] = [40.7128, -74.0060];

  // Mock fiber route
  const fiberRoute: [number, number][] = [
    [40.7128, -74.0060],
    [40.7138, -74.0070],
    [40.7150, -74.0100],
    [40.7160, -74.0110]
  ];

  return (
    <div className="h-[calc(100vh-8rem)] w-full relative rounded-xl overflow-hidden border border-primary/20 shadow-2xl neon-box">
      <MapContainer 
        center={center} 
        zoom={14} 
        scrollWheelZoom={true} 
        style={{ height: '100%', width: '100%', background: '#0f172a' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        
        {/* Fiber Route Line */}
        <Polyline 
          positions={fiberRoute} 
          color="cyan" 
          weight={4} 
          opacity={0.7} 
          dashArray="10, 10" 
        />

        {/* Job Markers */}
        {jobs.map((job) => (
          <Marker key={job.id} position={job.coordinates}>
            <Popup className="custom-popup">
              <div className="p-2 min-w-[200px]">
                <h3 className="font-bold text-slate-900">{job.clientName}</h3>
                <p className="text-xs text-slate-600 mb-2">{job.address}</p>
                <Badge className="mb-2">{job.type}</Badge>
                <Button size="sm" className="w-full mt-2 h-7 text-xs">
                  Start Job
                </Button>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* User Location */}
        <Marker position={center} icon={L.divIcon({
          className: 'bg-transparent',
          html: '<div class="h-4 w-4 bg-primary rounded-full shadow-[0_0_15px_rgba(6,182,212,1)] border-2 border-white animate-pulse"></div>'
        })} />
      </MapContainer>

      {/* Map Overlays */}
      <div className="absolute top-4 left-4 z-[400] flex flex-col gap-2">
         <Card className="bg-card/80 backdrop-blur-md border-border/50 w-64 p-3">
           <h3 className="font-bold text-sm text-white mb-1">Technician Location</h3>
           <p className="text-xs text-muted-foreground flex items-center gap-1">
             <Navigation className="h-3 w-3 text-primary" />
             40.7128° N, 74.0060° W
           </p>
         </Card>
      </div>

      <div className="absolute bottom-8 right-4 z-[400] flex flex-col gap-2">
        <Button size="icon" className="rounded-full bg-card/80 border-border/50 hover:bg-primary/20 hover:text-primary">
          <Layers className="h-5 w-5" />
        </Button>
        <Button size="icon" className="rounded-full bg-primary text-black shadow-[0_0_15px_rgba(6,182,212,0.5)]">
          <Plus className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
}
