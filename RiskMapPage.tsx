import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import MapView from '@/components/MapView';
import { SectionCard, PageHeader, RiskBadge, DismissableNote } from '@/components/shared';
import { HAZARD_LABELS, RISK_LABELS, RISK_COLORS } from '@/data/demoData';
import { Layers, MapPin, Building2, Waves, Route } from 'lucide-react';

export default function RiskMapPage() {
  const { riskZones, shelters, roads, rivers, studyArea, hazard, selectedZoneId, setSelectedZoneId } = useApp();
  const [layers, setLayers] = useState({
    riskZones: true,
    shelters: true,
    roads: true,
    rivers: true,
    boundary: true,
  });

  const hazardZones = riskZones.filter((z) => z.hazard === hazard);
  const selectedZone = hazardZones.find((z) => z.id === selectedZoneId);

  const toggle = (key: keyof typeof layers) => {
    setLayers((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const LayerToggle = ({ label, icon: Icon, active, onClick }: {
    label: string; icon: typeof MapPin; active: boolean; onClick: () => void;
  }) => (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
        active ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-gray-50 text-gray-400 border border-gray-200'
      }`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Interactive Risk Map"
        subtitle={`${studyArea.name} • ${HAZARD_LABELS[hazard]} hazard`}
      />

      <DismissableNote>
        Risk zones are <strong>screening categories</strong> based on synthetic data, not official hazard
        classifications. Areas marked "Insufficient Data" should not be assumed safe.
      </DismissableNote>

      {/* Layer toggles */}
      <div className="flex flex-wrap gap-2">
        <LayerToggle label="Risk Zones" icon={MapPin} active={layers.riskZones} onClick={() => toggle('riskZones')} />
        <LayerToggle label="Shelters" icon={Building2} active={layers.shelters} onClick={() => toggle('shelters')} />
        <LayerToggle label="Roads" icon={Route} active={layers.roads} onClick={() => toggle('roads')} />
        <LayerToggle label="Rivers" icon={Waves} active={layers.rivers} onClick={() => toggle('rivers')} />
        <LayerToggle label="Study Area Boundary" icon={Layers} active={layers.boundary} onClick={() => toggle('boundary')} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map */}
        <div className="lg:col-span-2">
          <SectionCard title="Map View" subtitle="Click markers for details">
            <MapView
              studyArea={studyArea}
              riskZones={layers.riskZones ? hazardZones : []}
              shelters={layers.shelters ? shelters : []}
              roads={layers.roads ? roads : []}
              rivers={layers.rivers ? rivers : []}
              showBoundary={layers.boundary}
              selectedZoneId={selectedZoneId}
              onSelectZone={(id) => setSelectedZoneId(id)}
              height="550px"
              fitBounds={false}
            />
          </SectionCard>
        </div>

        {/* Side panel */}
        <div className="space-y-4">
          {/* Legend */}
          <SectionCard title="Legend">
            <div className="space-y-3">
              <div className="text-xs font-semibold text-gray-500 uppercase">Risk Zones</div>
              {Object.entries(RISK_LABELS).map(([key, label]) => (
                <div key={key} className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: RISK_COLORS[key], opacity: 0.7 }}
                  />
                  <span className="text-sm text-gray-700">{label}</span>
                </div>
              ))}
              <div className="text-xs font-semibold text-gray-500 uppercase pt-2">Shelters</div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-blue-600" />
                <span className="text-sm text-gray-700">Verified</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-cyan-600" />
                <span className="text-sm text-gray-700">Estimated</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-gray-400" />
                <span className="text-sm text-gray-700">Unverified</span>
              </div>
              <div className="text-xs font-semibold text-gray-500 uppercase pt-2">Infrastructure</div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-1 bg-blue-900" />
                <span className="text-sm text-gray-700">Highway</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-1 bg-blue-500" />
                <span className="text-sm text-gray-700">Main Road</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-1 bg-blue-300 border-t border-dashed" />
                <span className="text-sm text-gray-700">Secondary (may be unverified)</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-1 bg-sky-500" />
                <span className="text-sm text-gray-700">River</span>
              </div>
            </div>
          </SectionCard>

          {/* Selected zone details */}
          {selectedZone ? (
            <SectionCard title="Selected Zone" subtitle={selectedZone.name}>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Risk Level</span>
                  <RiskBadge level={selectedZone.riskLevel} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Risk Score</span>
                  <span className="font-bold text-gray-900">{selectedZone.riskScore}/100</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Population</span>
                  <span className="font-semibold text-gray-900">{selectedZone.population.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Area</span>
                  <span className="font-semibold text-gray-900">{selectedZone.area_km2} km²</span>
                </div>
                <div className="pt-3 border-t border-gray-100">
                  <div className="text-xs font-semibold text-gray-500 uppercase mb-2">Contributing Factors</div>
                  <div className="space-y-2">
                    {selectedZone.factors.map((f) => (
                      <div key={f.name} className="flex items-center justify-between text-sm">
                        <span className="text-gray-700">{f.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500 text-xs">{f.value}</span>
                          <span className="font-semibold text-gray-900 text-xs">+{f.contribution}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </SectionCard>
          ) : (
            <SectionCard title="Zone Details">
              <p className="text-sm text-gray-500 text-center py-4">
                Click a risk zone on the map to see details.
              </p>
            </SectionCard>
          )}
        </div>
      </div>
    </div>
  );
}
