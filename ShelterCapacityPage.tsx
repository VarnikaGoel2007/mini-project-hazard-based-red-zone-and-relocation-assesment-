import { useApp } from '@/context/AppContext';
import { SectionCard, PageHeader, RiskBadge, DismissableNote } from '@/components/shared';
import { calculateCapacityGap } from '@/utils/riskUtils';
import { HAZARD_LABELS } from '@/data/demoData';
import { BedDouble, Users, AlertTriangle, CheckCircle, XCircle, HelpCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function ShelterCapacityPage() {
  const { shelters, riskZones, hazard } = useApp();

  const highRiskPop = riskZones
    .filter((z) => z.hazard === hazard && z.riskLevel === 'high')
    .reduce((s, z) => s + z.population, 0);

  const { totalSpare, gap, hasReliableData } = calculateCapacityGap(shelters, highRiskPop);

  const capacityData = shelters
    .filter((s) => s.totalCapacity !== null)
    .map((s) => ({
      name: s.name.length > 15 ? s.name.slice(0, 15) + '...' : s.name,
      total: s.totalCapacity ?? 0,
      spare: s.spareCapacity ?? 0,
      occupancy: s.currentOccupancy ?? 0,
    }));

  const AmenityIcon = ({ status }: { status: 'yes' | 'no' | 'unknown' }) => {
    if (status === 'yes') return <CheckCircle className="w-4 h-4 text-green-600" />;
    if (status === 'no') return <XCircle className="w-4 h-4 text-red-500" />;
    return <HelpCircle className="w-4 h-4 text-gray-400" />;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Shelter Capacity Assessment"
        subtitle="Candidate shelter evaluation with capacity and amenities"
      />

      <DismissableNote>
        Not every school, hospital, or public building is an approved evacuation shelter. Verification
        status must be confirmed with local authorities. Spare capacity is only shown when reliable total
        and occupancy data are available.
      </DismissableNote>

      {/* Summary stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border p-5 bg-blue-50 border-blue-200">
          <div className="flex items-center gap-3">
            <BedDouble className="w-8 h-8 text-blue-600" />
            <div>
              <div className="text-sm text-gray-600">Total Shelters</div>
              <div className="text-2xl font-bold text-gray-900">{shelters.length}</div>
            </div>
          </div>
        </div>
        <div className="rounded-xl border p-5 bg-green-50 border-green-200">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div>
              <div className="text-sm text-gray-600">Verified</div>
              <div className="text-2xl font-bold text-gray-900">
                {shelters.filter((s) => s.verification === 'verified').length}
              </div>
            </div>
          </div>
        </div>
        <div className="rounded-xl border p-5 bg-amber-50 border-amber-200">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-amber-600" />
            <div>
              <div className="text-sm text-gray-600">Est. Spare Capacity</div>
              <div className="text-2xl font-bold text-gray-900">
                {hasReliableData ? totalSpare.toLocaleString() : 'Unknown'}
              </div>
            </div>
          </div>
        </div>
        <div className={`rounded-xl border p-5 ${gap > 0 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
          <div className="flex items-center gap-3">
            <AlertTriangle className={`w-8 h-8 ${gap > 0 ? 'text-red-600' : 'text-green-600'}`} />
            <div>
              <div className="text-sm text-gray-600">Capacity Gap</div>
              <div className={`text-2xl font-bold ${gap > 0 ? 'text-red-700' : 'text-green-700'}`}>
                {hasReliableData ? gap.toLocaleString() : 'Unknown'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Capacity chart */}
      <SectionCard title="Shelter Capacity Comparison" subtitle="Total capacity vs. spare capacity vs. current occupancy">
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={capacityData} margin={{ left: 10, right: 10 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-15} textAnchor="end" height={70} />
            <YAxis />
            <Tooltip />
            <Bar dataKey="total" name="Total Capacity" fill="#93c5fd" radius={[4, 4, 0, 0]} />
            <Bar dataKey="occupancy" name="Current Occupancy" fill="#fbbf24" radius={[4, 4, 0, 0]} />
            <Bar dataKey="spare" name="Spare Capacity" fill="#22c55e" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </SectionCard>

      {/* Shelter table */}
      <SectionCard
        title="Candidate Shelter Assessment"
        subtitle="Detailed evaluation of each candidate site"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left">
                <th className="py-3 px-3 font-semibold text-gray-700">Site Name</th>
                <th className="py-3 px-3 font-semibold text-gray-700">Type</th>
                <th className="py-3 px-3 font-semibold text-gray-700 text-right">Total Cap.</th>
                <th className="py-3 px-3 font-semibold text-gray-700 text-right">Occupancy</th>
                <th className="py-3 px-3 font-semibold text-gray-700 text-right">Spare</th>
                <th className="py-3 px-3 font-semibold text-gray-700 text-center">Water</th>
                <th className="py-3 px-3 font-semibold text-gray-700 text-center">Sanitation</th>
                <th className="py-3 px-3 font-semibold text-gray-700 text-center">Healthcare</th>
                <th className="py-3 px-3 font-semibold text-gray-700 text-center">Road</th>
                <th className="py-3 px-3 font-semibold text-gray-700">Hazard</th>
                <th className="py-3 px-3 font-semibold text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {shelters.map((s) => (
                <tr key={s.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-3 font-medium text-gray-900">{s.name}</td>
                  <td className="py-3 px-3 text-gray-600 capitalize">{s.type.replace('_', ' ')}</td>
                  <td className="py-3 px-3 text-right text-gray-700">
                    {s.totalCapacity?.toLocaleString() ?? <span className="text-gray-400">Unknown</span>}
                  </td>
                  <td className="py-3 px-3 text-right text-gray-700">
                    {s.currentOccupancy?.toLocaleString() ?? <span className="text-gray-400">Unknown</span>}
                  </td>
                  <td className="py-3 px-3 text-right font-semibold text-gray-900">
                    {s.spareCapacity !== null ? (
                      s.spareCapacity.toLocaleString()
                    ) : (
                      <span className="text-gray-400 font-normal">Unknown</span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-center"><AmenityIcon status={s.water} /></td>
                  <td className="py-3 px-3 text-center"><AmenityIcon status={s.sanitation} /></td>
                  <td className="py-3 px-3 text-center"><AmenityIcon status={s.healthcare} /></td>
                  <td className="py-3 px-3 text-center"><AmenityIcon status={s.roadAccessible} /></td>
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* Capacity gap analysis */}
      <SectionCard title="Capacity Gap Analysis" subtitle={`High-risk population for ${HAZARD_LABELS[hazard]}: ${highRiskPop.toLocaleString()}`}>
        {hasReliableData ? (
          <div className="space-y-4">
            <div className="flex items-center gap-6">
              <div>
                <div className="text-sm text-gray-600">High-Risk Population</div>
                <div className="text-3xl font-bold text-gray-900">{highRiskPop.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Available Spare Capacity</div>
                <div className="text-3xl font-bold text-blue-600">{totalSpare.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Shortfall</div>
                <div className={`text-3xl font-bold ${gap > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {gap > 0 ? gap.toLocaleString() : 'None'}
                </div>
              </div>
            </div>
            <div className="w-full h-6 bg-gray-100 rounded-full overflow-hidden flex">
              <div
                className="h-full bg-green-500"
                style={{ width: `${Math.min(100, (totalSpare / Math.max(1, highRiskPop)) * 100)}%` }}
              />
              {gap > 0 && (
                <div
                  className="h-full bg-red-500"
                  style={{ width: `${Math.min(100, (gap / Math.max(1, highRiskPop)) * 100)}%` }}
                />
              )}
            </div>
            <p className="text-sm text-gray-600">
              {gap > 0
                ? `There is an estimated shortfall of ${gap.toLocaleString()} shelter spaces. Additional shelters or evacuation sites are needed.`
                : 'Current estimated spare capacity meets the high-risk population demand.'}
            </p>
          </div>
        ) : (
          <div className="text-sm text-gray-500">
            Capacity data is incomplete. Spare capacity is shown as "Unknown" for shelters without verified
            total capacity and occupancy figures.
          </div>
        )}
      </SectionCard>
    </div>
  );
}
