import { useApp } from '@/context/AppContext';
import MapView from '@/components/MapView';
import { AlertsPanel, StatCard, SectionCard, PageHeader, DataQualityBadge, DismissableNote } from '@/components/shared';
import { HAZARD_LABELS, RISK_LABELS, RISK_COLORS } from '@/data/demoData';
import { calculateCapacityGap } from '@/utils/riskUtils';
import { Users, AlertTriangle, Building2, BedDouble, Activity, ShieldAlert, Database } from 'lucide-react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend,
} from 'recharts';

export default function OverviewDashboard() {
  const { riskZones, shelters, roads, rivers, studyArea, hazard, alerts, dataQuality, setCurrentPage } = useApp();

  const hazardZones = riskZones.filter((z) => z.hazard === hazard);
  const highRisk = hazardZones.filter((z) => z.riskLevel === 'high');
  const mediumRisk = hazardZones.filter((z) => z.riskLevel === 'medium');
  const lowRisk = hazardZones.filter((z) => z.riskLevel === 'low');

  const totalPop = hazardZones.reduce((s, z) => s + z.population, 0);
  const highRiskPop = highRisk.reduce((s, z) => s + z.population, 0);

  const verifiedShelters = shelters.filter((s) => s.verification === 'verified').length;
  const { totalSpare, gap, hasReliableData } = calculateCapacityGap(shelters, highRiskPop);

  const riskDistribution = [
    { name: 'High Risk', value: highRisk.length, color: RISK_COLORS.high },
    { name: 'Medium Risk', value: mediumRisk.length, color: RISK_COLORS.medium },
    { name: 'Low Risk', value: lowRisk.length, color: RISK_COLORS.low },
  ];

  const populationData = hazardZones.map((z) => ({
    name: z.name.length > 18 ? z.name.slice(0, 18) + '...' : z.name,
    population: z.population,
    score: z.riskScore,
  }));

  const criticalCount = alerts.filter((a) => a.severity === 'critical').length;
  const warningCount = alerts.filter((a) => a.severity === 'warning').length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Overview Dashboard"
        subtitle={`${studyArea.name} • Active hazard: ${HAZARD_LABELS[hazard]}`}
      />

      <DismissableNote>
        This prototype uses <strong>synthetic demo data</strong> for demonstration. Replace it with
        official datasets before any operational use. Risk classifications are screening categories,
        not official hazard designations.
      </DismissableNote>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="High-Risk Zones"
          value={highRisk.length}
          sublabel={`${highRiskPop.toLocaleString()} people exposed`}
          icon={AlertTriangle}
          color="red"
        />
        <StatCard
          label="Population at Risk"
          value={totalPop.toLocaleString()}
          sublabel={`across ${hazardZones.length} zones`}
          icon={Users}
          color="amber"
        />
        <StatCard
          label="Candidate Shelters"
          value={shelters.length}
          sublabel={`${verifiedShelters} verified`}
          icon={Building2}
          color="blue"
        />
        <StatCard
          label="Est. Spare Capacity"
          value={hasReliableData ? totalSpare.toLocaleString() : 'Unknown'}
          sublabel={gap > 0 ? `Gap: ${gap.toLocaleString()}` : 'Meets demand'}
          icon={BedDouble}
          color={gap > 0 ? 'red' : 'green'}
        />
      </div>

      {/* Map + Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SectionCard
            title="Study Area Map"
            subtitle="Risk zones, shelters, roads and rivers"
            action={
              <button
                onClick={() => setCurrentPage('risk-map')}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Open full map →
              </button>
            }
          >
            <MapView
              studyArea={studyArea}
              riskZones={hazardZones}
              shelters={shelters}
              roads={roads}
              rivers={rivers}
              height="400px"
            />
          </SectionCard>
        </div>

        <SectionCard
          title="Active Alerts"
          subtitle={`${criticalCount} critical • ${warningCount} warnings`}
        >
          <AlertsPanel maxItems={6} />
        </SectionCard>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionCard title="Risk Zone Distribution" subtitle="Number of zones by risk class">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={riskDistribution}
                cx="50%"
                cy="50%"
                outerRadius={90}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {riskDistribution.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title="Population Exposure by Zone" subtitle="Population and risk score per zone">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={populationData} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 10 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="population" fill="#3b82f6" name="Population" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>
      </div>

      {/* Data quality */}
      <SectionCard title="Data Quality Indicators" subtitle="Current data source availability">
        <div className="flex flex-wrap gap-3">
          <DataQualityBadge ok={dataQuality.rainfall} label="Rainfall" />
          <DataQualityBadge ok={dataQuality.temperature} label="Temperature" />
          <DataQualityBadge ok={dataQuality.elevation} label="Elevation" />
          <DataQualityBadge ok={dataQuality.population} label="Population" />
          <DataQualityBadge ok={dataQuality.historical} label="Historical Events" />
          <DataQualityBadge ok={dataQuality.shelters} label="Shelters" />
          <DataQualityBadge ok={dataQuality.roads} label="Roads" />
          <DataQualityBadge ok={dataQuality.rivers} label="Rivers" />
        </div>
        <div className="mt-4 p-3 bg-gray-50 rounded-lg flex items-center gap-3">
          <Database className="w-5 h-5 text-gray-500" />
          <span className="text-sm text-gray-600">
            Data freshness: <strong>Synthetic</strong> • Last updated: Demo • Source: Generated for prototype
          </span>
        </div>
      </SectionCard>
    </div>
  );
}
