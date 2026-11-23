import { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import MapView from '@/components/MapView';
import { SectionCard, PageHeader, RiskBadge, DismissableNote } from '@/components/shared';
import { rankShelters, calculateCapacityGap } from '@/utils/riskUtils';
import { HAZARD_LABELS } from '@/data/demoData';
import { Navigation, MapPin, ArrowRight, Info, ShieldCheck, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function SafeLocationPage() {
  const { riskZones, shelters, roads, rivers, studyArea, hazard } = useApp();
  const [selectedZoneForRelocation, setSelectedZoneForRelocation] = useState<string>(
    riskZones.filter((z) => z.hazard === hazard && z.riskLevel === 'high')[0]?.id ?? '',
  );

  const highRiskZones = riskZones.filter((z) => z.hazard === hazard && z.riskLevel === 'high');
  const selectedZone = riskZones.find((z) => z.id === selectedZoneForRelocation);
  const displacedPop = selectedZone?.population ?? 0;

  const rankedShelters = useMemo(
    () => rankShelters(shelters, hazard, displacedPop),
    [shelters, hazard, displacedPop],
  );

  const topShelters = rankedShelters.slice(0, 5);

  const { totalSpare, gap } = calculateCapacityGap(shelters, displacedPop);

  // Generate simple routes from selected zone to top shelters
  const routes = useMemo(() => {
    if (!selectedZone) return [];
    return topShelters.slice(0, 3).map((shelter, i) => ({
      id: `route-${i}`,
      shelterId: shelter.id,
      shelterName: shelter.name,
      rank: i + 1,
      coords: [
        [selectedZone.lat, selectedZone.lng] as [number, number],
        [shelter.lat, shelter.lng] as [number, number],
      ] as [number, number][],
      distanceKm: haversine(selectedZone.lat, selectedZone.lng, shelter.lat, shelter.lng),
      verified: false,
    }));
  }, [selectedZone, topShelters]);

  const rankData = topShelters.map((s) => ({
    name: s.name.length > 15 ? s.name.slice(0, 15) + '...' : s.name,
    score: s.rankScore ?? 0,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Safe Location & Route Suggestions"
        subtitle="Ranked candidate shelters with suggested relocation routes"
      />

      <DismissableNote>
        Routes are <strong>unverified</strong> and shown for planning purposes only. Road closures, flooding,
        accessibility and current local conditions must be checked before any movement. No route or site is
        guaranteed safe.
      </DismissableNote>

      {/* Zone selector */}
      <SectionCard title="Select Source Zone for Relocation" subtitle="Choose a high-risk zone to plan relocation from">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {highRiskZones.map((z) => (
            <button
              key={z.id}
              onClick={() => setSelectedZoneForRelocation(z.id)}
              className={`p-4 rounded-lg border text-left transition-all ${
                selectedZoneForRelocation === z.id
                  ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              <div className="font-medium text-gray-900 text-sm">{z.name}</div>
              <div className="flex items-center gap-2 mt-1">
                <RiskBadge level={z.riskLevel} />
              </div>
              <div className="text-xs text-gray-500 mt-2">
                Population: {z.population.toLocaleString()} • Score: {z.riskScore}/100
              </div>
            </button>
          ))}
        </div>
        {highRiskZones.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-4">
            No high-risk zones for {HAZARD_LABELS[hazard]}. Select a different hazard type.
          </p>
        )}
      </SectionCard>

      {selectedZone && (
        <>
          {/* Relocation summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-xl border p-5 bg-amber-50 border-amber-200">
              <div className="text-sm text-gray-600">Population to Relocate</div>
              <div className="text-2xl font-bold text-gray-900">{displacedPop.toLocaleString()}</div>
            </div>
            <div className="rounded-xl border p-5 bg-green-50 border-green-200">
              <div className="text-sm text-gray-600">Available Spare Capacity</div>
              <div className="text-2xl font-bold text-gray-900">{totalSpare.toLocaleString()}</div>
            </div>
            <div className={`rounded-xl border p-5 ${gap > 0 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
              <div className="text-sm text-gray-600">Capacity Gap</div>
              <div className={`text-2xl font-bold ${gap > 0 ? 'text-red-700' : 'text-green-700'}`}>
                {gap > 0 ? gap.toLocaleString() : 'None'}
              </div>
            </div>
          </div>

          {/* Map with routes */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <SectionCard title="Suggested Routes" subtitle={`From ${selectedZone.name} to top-ranked shelters`}>
                <MapView
                  studyArea={studyArea}
                  riskZones={highRiskZones}
                  shelters={topShelters}
                  roads={roads}
                  rivers={rivers}
                  routes={routes.map((r) => ({ id: r.id, coords: r.coords, label: `Route #${r.rank} to ${r.shelterName}` }))}
                  selectedZoneId={selectedZone.id}
                  height="450px"
                  fitBounds={false}
                />
                {/* Draw routes as overlays */}
                <div className="mt-3 space-y-2">
                  {routes.map((route) => (
                    <div key={route.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                        {route.rank}
                      </div>
                      <Navigation className="w-4 h-4 text-gray-500" />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">{route.shelterName}</div>
                        <div className="text-xs text-gray-500">
                          Est. distance: {route.distanceKm.toFixed(1)} km • Unverified route
                        </div>
                      </div>
                      <span className="text-xs text-amber-600 font-medium bg-amber-50 px-2 py-1 rounded">
                        Unverified
                      </span>
                    </div>
                  ))}
                </div>
              </SectionCard>
            </div>

            {/* Ranking explanation */}
            <SectionCard title="Why These Locations?" subtitle="Ranking criteria">
              <div className="space-y-3 text-sm text-gray-700">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>Low hazard exposure</strong> — Sites outside high-risk zones are prioritized.
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>Available capacity</strong> — Shelters with verified spare capacity rank higher.
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <ArrowRight className="w-5 h-5 text-gray-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>Accessibility</strong> — Road connectivity, water, sanitation, and healthcare access.
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>Verification status</strong> — Verified shelters are preferred over unverified ones.
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>Route verification</strong> — All routes are marked unverified until road conditions are confirmed.
                  </div>
                </div>
              </div>
            </SectionCard>
          </div>

          {/* Ranking chart */}
          <SectionCard title="Shelter Ranking Scores" subtitle="Top 5 candidate shelters by composite score">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={rankData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 100]} />
                <YAxis dataKey="name" type="category" width={130} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="score" name="Rank Score" radius={[0, 4, 4, 0]}>
                  {rankData.map((_, i) => (
                    <Cell key={i} fill={
                      i === 0 ? '#16a34a' : i === 1 ? '#2563eb' : i === 2 ? '#0891b2' : '#6b7280'
                    } />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </SectionCard>

          {/* Detailed ranking table */}
          <SectionCard title="Detailed Shelter Rankings">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left">
                    <th className="py-3 px-3 font-semibold text-gray-700">Rank</th>
                    <th className="py-3 px-3 font-semibold text-gray-700">Shelter</th>
                    <th className="py-3 px-3 font-semibold text-gray-700 text-right">Score</th>
                    <th className="py-3 px-3 font-semibold text-gray-700 text-right">Spare Cap.</th>
                    <th className="py-3 px-3 font-semibold text-gray-700">Hazard Exposure</th>
                    <th className="py-3 px-3 font-semibold text-gray-700">Status</th>
                    <th className="py-3 px-3 font-semibold text-gray-700">Road Access</th>
                  </tr>
                </thead>
                <tbody>
                  {rankedShelters.map((s) => (
                    <tr key={s.id} className={`border-b border-gray-100 ${s.rank! <= 3 ? 'bg-blue-50/30' : ''}`}>
                      <td className="py-3 px-3">
                        <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                          s.rank === 1 ? 'bg-green-600 text-white' :
                          s.rank === 2 ? 'bg-blue-600 text-white' :
                          s.rank === 3 ? 'bg-cyan-600 text-white' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {s.rank}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-medium text-gray-900">{s.name}</td>
                      <td className="py-3 px-3 text-right font-semibold text-gray-900">{s.rankScore}/100</td>
                      <td className="py-3 px-3 text-right text-gray-700">
                        {s.spareCapacity?.toLocaleString() ?? 'Unknown'}
                      </td>
                      <td className="py-3 px-3"><RiskBadge level={s.hazardExposure} /></td>
                      <td className="py-3 px-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          s.verification === 'verified' ? 'bg-green-100 text-green-700' :
                          s.verification === 'estimated' ? 'bg-cyan-100 text-cyan-700' :
                          'bg-gray-100 text-gray-500'
                        }`}>
                          {s.verification}
                        </span>
                      </td>
                      <td className="py-3 px-3 capitalize text-gray-600">{s.roadAccessible}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>
        </>
      )}
    </div>
  );
}

function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
