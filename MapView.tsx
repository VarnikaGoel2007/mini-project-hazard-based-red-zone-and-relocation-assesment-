import { useEffect } from 'react';
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Polyline,
  Polygon,
  Tooltip,
  Popup,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { RiskZone, Shelter, RoadSegment, RiverSegment, StudyArea } from '@/types';
import { RISK_COLORS, RISK_LABELS } from '@/data/demoData';
import { HAZARD_LABELS } from '@/data/demoData';

interface RouteLine {
  id: string;
  coords: [number, number][];
  label?: string;
}

interface MapViewProps {
  studyArea: StudyArea;
  riskZones?: RiskZone[];
  shelters?: Shelter[];
  roads?: RoadSegment[];
  rivers?: RiverSegment[];
  routes?: RouteLine[];
  showRiskZones?: boolean;
  showShelters?: boolean;
  showRoads?: boolean;
  showRivers?: boolean;
  showBoundary?: boolean;
  selectedZoneId?: string | null;
  onSelectZone?: (id: string) => void;
  onSelectShelter?: (id: string) => void;
  height?: string;
  fitBounds?: boolean;
}

function FitBounds({ bounds }: { bounds: L.LatLngBoundsExpression }) {
  const map = useMap();
  useEffect(() => {
    map.fitBounds(bounds, { padding: [30, 30] });
  }, [map, bounds]);
  return null;
}

const shelterColors: Record<string, string> = {
  verified: '#2563eb',
  estimated: '#0891b2',
  unverified: '#9ca3af',
};

export default function MapView({
  studyArea,
  riskZones = [],
  shelters = [],
  roads = [],
  rivers = [],
  showRiskZones = true,
  showShelters = true,
  showRoads = true,
  showRivers = true,
  showBoundary = true,
  routes = [],
  selectedZoneId,
  onSelectZone,
  onSelectShelter,
  height = '500px',
  fitBounds = true,
}: MapViewProps) {
  const boundary: [number, number][] = studyArea.boundary;
  const bounds = L.latLngBounds(boundary.map(([lat, lng]) => [lat, lng] as [number, number]));

  const roadColors: Record<string, string> = {
    highway: '#1e40af',
    main: '#3b82f6',
    secondary: '#93c5fd',
  };

  const roadDashArray: Record<string, string | undefined> = {
    highway: undefined,
    main: undefined,
    secondary: '6,4',
  };

  return (
    <div style={{ height, width: '100%' }} className="rounded-lg overflow-hidden border border-gray-300 z-0">
      <MapContainer
        center={studyArea.center}
        zoom={studyArea.zoom}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />

        {fitBounds && <FitBounds bounds={bounds} />}

        {showBoundary && (
          <Polygon
            positions={boundary}
            pathOptions={{
              color: '#4b5563',
              weight: 2,
              dashArray: '8,4',
              fillOpacity: 0.03,
            }}
          >
            <Tooltip sticky>{studyArea.name}</Tooltip>
          </Polygon>
        )}

        {showRivers &&
          rivers.map((river) => (
            <Polyline
              key={river.id}
              positions={river.coords}
              pathOptions={{ color: '#0ea5e9', weight: 4, opacity: 0.7 }}
            >
              <Tooltip sticky>{river.name}</Tooltip>
            </Polyline>
          ))}

        {showRoads &&
          roads.map((road) => (
            <Polyline
              key={road.id}
              positions={road.coords}
              pathOptions={{
                color: roadColors[road.type] ?? '#6b7280',
                weight: road.type === 'highway' ? 4 : road.type === 'main' ? 3 : 2,
                opacity: 0.8,
                dashArray: roadDashArray[road.type],
              }}
            >
              <Tooltip sticky>
                <div className="text-xs">
                  <div className="font-semibold">{road.name}</div>
                  {!road.verified && (
                    <div className="text-amber-600 mt-1">Unverified road</div>
                  )}
                </div>
              </Tooltip>
            </Polyline>
          ))}

        {showRiskZones &&
          riskZones.map((zone) => {
            const isSelected = selectedZoneId === zone.id;
            const color = RISK_COLORS[zone.riskLevel] ?? '#6b7280';
            return (
              <CircleMarker
                key={zone.id}
                center={[zone.lat, zone.lng]}
                radius={isSelected ? 16 : 12}
                pathOptions={{
                  color: color,
                  weight: isSelected ? 3 : 2,
                  fillColor: color,
                  fillOpacity: 0.5,
                }}
                eventHandlers={{
                  click: () => onSelectZone?.(zone.id),
                }}
              >
                <Popup>
                  <div className="text-sm min-w-[200px]">
                    <div className="font-bold text-gray-900 mb-1">{zone.name}</div>
                    <div className="text-xs text-gray-600 mb-2">
                      {HAZARD_LABELS[zone.hazard]} • {RISK_LABELS[zone.riskLevel]}
                    </div>
                    <div className="space-y-1 text-xs">
                      <div>Risk Score: <span className="font-semibold">{zone.riskScore}/100</span></div>
                      <div>Population: <span className="font-semibold">{zone.population.toLocaleString()}</span></div>
                      <div>Area: {zone.area_km2} km²</div>
                    </div>
                  </div>
                </Popup>
                <Tooltip sticky>
                  <div className="text-xs">
                    <div className="font-semibold">{zone.name}</div>
                    <div>Score: {zone.riskScore} • {RISK_LABELS[zone.riskLevel]}</div>
                  </div>
                </Tooltip>
              </CircleMarker>
            );
          })}

        {routes.map((route) => (
          <Polyline
            key={route.id}
            positions={route.coords}
            pathOptions={{ color: '#2563eb', weight: 3, opacity: 0.6, dashArray: '10,6' }}
          >
            {route.label && <Tooltip sticky>{route.label}</Tooltip>}
          </Polyline>
        ))}

        {showShelters &&
          shelters.map((shelter) => (
            <CircleMarker
              key={shelter.id}
              center={[shelter.lat, shelter.lng]}
              radius={9}
              pathOptions={{
                color: shelterColors[shelter.verification] ?? '#6b7280',
                weight: 2,
                fillColor: shelterColors[shelter.verification] ?? '#6b7280',
                fillOpacity: 0.8,
              }}
              eventHandlers={{
                click: () => onSelectShelter?.(shelter.id),
              }}
            >
              <Popup>
                <div className="text-sm min-w-[200px]">
                  <div className="font-bold text-gray-900 mb-1">{shelter.name}</div>
                  <div className="text-xs text-gray-600 mb-2 capitalize">
                    {shelter.type.replace('_', ' ')} • {shelter.verification}
                  </div>
                  <div className="space-y-1 text-xs">
                    <div>Capacity: {shelter.totalCapacity ?? 'Unknown'}</div>
                    <div>Spare: {shelter.spareCapacity ?? 'Unknown'}</div>
                    <div>Water: {shelter.water} | Sanitation: {shelter.sanitation}</div>
                    <div>Healthcare: {shelter.healthcare} | Road: {shelter.roadAccessible}</div>
                  </div>
                </div>
              </Popup>
              <Tooltip sticky>
                <div className="text-xs">
                  <div className="font-semibold">{shelter.name}</div>
                  <div>Spare: {shelter.spareCapacity ?? 'Unknown'} • {shelter.verification}</div>
                </div>
              </Tooltip>
            </CircleMarker>
          ))}
      </MapContainer>
    </div>
  );
}
