import { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import MapView from '@/components/MapView';
import { SectionCard, PageHeader, RiskBadge, DismissableNote } from '@/components/shared';
import { HAZARD_LABELS, RISK_LABELS } from '@/data/demoData';
import { getDefaultWeightsForHazard, classifyRisk } from '@/utils/riskUtils';
import type { HazardType, RiskWeights } from '@/types';
import { Sliders, Info, AlertTriangle, BarChart3 } from 'lucide-react';
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell,
} from 'recharts';

export default function HazardAssessmentPage() {
  const { riskZones, studyArea, hazard, setHazard, mlModelTrained, setMlModelTrained } = useApp();
  const [weights, setWeights] = useState<RiskWeights>(getDefaultWeightsForHazard(hazard));
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);

  const hazardZones = riskZones.filter((z) => z.hazard === hazard);
  const selectedZone = hazardZones.find((z) => z.id === selectedZoneId) ?? hazardZones[0];

  const handleHazardChange = (h: HazardType) => {
    setHazard(h);
    setWeights(getDefaultWeightsForHazard(h));
  };

  const weightLabels: Record<keyof RiskWeights, string> = {
    rainfall: 'Rainfall',
    temperature: 'Temperature',
    elevation: 'Elevation',
    slope: 'Slope',
    riverDistance: 'River Distance',
    historical: 'Historical Events',
    population: 'Population',
    builtUp: 'Built-up Area',
  };

  const totalWeight = Object.values(weights).reduce((s, w) => s + w, 0);

  // Radar chart data for selected zone
  const radarData = useMemo(() => {
    if (!selectedZone) return [];
    return selectedZone.factors.map((f) => ({
      factor: f.name.length > 14 ? f.name.slice(0, 14) + '...' : f.name,
      contribution: f.contribution,
    }));
  }, [selectedZone]);

  // Bar chart: risk scores for all zones
  const scoreData = hazardZones.map((z) => ({
    name: z.name.length > 15 ? z.name.slice(0, 15) + '...' : z.name,
    score: z.riskScore,
    level: z.riskLevel,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Hazard Assessment"
        subtitle="Transparent risk scoring with configurable factors"
      />

      <DismissableNote>
        Risk scores are <strong>prototype screening scores</strong> from synthetic data, not official
        hazard assessments. Areas with no historical disasters are not assumed safe. Insufficient data
        is shown as such.
      </DismissableNote>

      {/* Hazard selector */}
      <div className="flex flex-wrap gap-2">
        {(['flood', 'heat', 'landslide', 'other'] as const).map((h) => (
          <button
            key={h}
            onClick={() => handleHazardChange(h)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              hazard === h
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-300'
            }`}
          >
            {HAZARD_LABELS[h]}
          </button>
        ))}
      </div>

      {/* ML model status */}
      <div className={`flex items-center gap-4 p-4 rounded-xl border ${mlModelTrained ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${mlModelTrained ? 'bg-green-100' : 'bg-gray-200'}`}>
          <BarChart3 className={`w-5 h-5 ${mlModelTrained ? 'text-green-600' : 'text-gray-500'}`} />
        </div>
        <div className="flex-1">
          <div className="font-semibold text-gray-900">
            {mlModelTrained ? 'Random Forest Model: Trained' : 'Random Forest Model: Not Trained'}
          </div>
          <div className="text-sm text-gray-600">
            {mlModelTrained
              ? 'ML model is active using labelled training data.'
              : 'Insufficient labelled training data. Using transparent rule-based scoring method.'}
          </div>
        </div>
        <button
          onClick={() => setMlModelTrained(!mlModelTrained)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
            mlModelTrained ? 'bg-gray-200 text-gray-700' : 'bg-blue-600 text-white'
          }`}
        >
          {mlModelTrained ? 'Disable ML' : 'Simulate ML Training'}
        </button>
      </div>

      {/* Weight configuration */}
      <SectionCard
        title="Scoring Weights"
        subtitle="Adjust factor weights. Total should ideally sum to 1.0."
        action={
          <div className={`text-sm font-semibold ${Math.abs(totalWeight - 1.0) < 0.01 ? 'text-green-600' : 'text-amber-600'}`}>
            Total: {totalWeight.toFixed(2)}
          </div>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {(Object.keys(weights) as (keyof RiskWeights)[]).map((key) => (
            <div key={key}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-700">{weightLabels[key]}</span>
                <span className="text-sm font-semibold text-gray-900">{weights[key].toFixed(2)}</span>
              </div>
              <input
                type="range"
                min={0}
                max={0.5}
                step={0.05}
                value={weights[key]}
                onChange={(e) => setWeights((prev) => ({ ...prev, [key]: parseFloat(e.target.value) }))}
                className="w-full accent-blue-600"
              />
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Zone analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Map */}
        <SectionCard title="Risk Zones Map">
          <MapView
            studyArea={studyArea}
            riskZones={hazardZones}
            showShelters={false}
            showRoads={false}
            showRivers={false}
            selectedZoneId={selectedZone?.id}
            onSelectZone={(id) => setSelectedZoneId(id)}
            height="380px"
            fitBounds={false}
          />
        </SectionCard>

        {/* Selected zone details with factor breakdown */}
        <SectionCard title="Zone Risk Breakdown" subtitle={selectedZone?.name}>
          {selectedZone && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <RiskBadge level={selectedZone.riskLevel} />
                <div className="text-2xl font-bold text-gray-900">
                  {selectedZone.riskScore}<span className="text-sm text-gray-500">/100</span>
                </div>
              </div>

              <ResponsiveContainer width="100%" height={220}>
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="factor" tick={{ fontSize: 10 }} />
                  <PolarRadiusAxis domain={[0, 30]} tick={{ fontSize: 9 }} />
                  <Radar dataKey="contribution" stroke="#2563eb" fill="#2563eb" fillOpacity={0.4} />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>

              <div className="space-y-2 pt-2 border-t border-gray-100">
                <div className="text-xs font-semibold text-gray-500 uppercase">Contributing Factors</div>
                {selectedZone.factors.map((f) => (
                  <div key={f.name} className="flex items-center justify-between text-sm">
                    <div>
                      <span className="text-gray-700">{f.name}</span>
                      <span className="text-gray-400 ml-2 text-xs">{f.value}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${Math.min(100, (f.contribution / 30) * 100)}%` }}
                        />
                      </div>
                      <span className="font-semibold text-gray-900 text-xs w-8 text-right">+{f.contribution}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </SectionCard>
      </div>

      {/* Score comparison chart */}
      <SectionCard title="Risk Score Comparison" subtitle="All zones for current hazard">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={scoreData} margin={{ left: 10, right: 10 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-15} textAnchor="end" height={70} />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Bar dataKey="score" name="Risk Score" radius={[4, 4, 0, 0]}>
              {scoreData.map((entry, i) => (
                <Cell key={i} fill={
                  entry.level === 'high' ? '#dc2626' :
                  entry.level === 'medium' ? '#f59e0b' : '#16a34a'
                } />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </SectionCard>

      {/* Methodology note */}
      <SectionCard title="Scoring Method & Limitations">
        <div className="space-y-3 text-sm text-gray-700">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <p>
              <strong>Method:</strong> {mlModelTrained
                ? 'A Random Forest classifier was trained on labelled historical data. Feature importance is reflected in the risk scores.'
                : 'A transparent rule-based weighted scoring method is used. Each factor contributes proportionally to its weight and normalized value.'}
            </p>
          </div>
          <div className="flex items-start gap-3">
            <Sliders className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <p>
              <strong>Classification thresholds:</strong> Score ≥ 65 = Potential High Risk, 40–64 = Medium Risk, &lt; 40 = Lower Relative Risk.
              These are screening categories, not official hazard classifications.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <p>
              <strong>Limitations:</strong> Scores depend on data quality. Missing data is shown as "Insufficient Data",
              not as safe. No historical disaster record does not mean no risk. Results support human decision-making
              and must not be used as the sole basis for evacuation orders.
            </p>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
