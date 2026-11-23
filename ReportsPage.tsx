import { useApp } from '@/context/AppContext';
import { SectionCard, PageHeader, RiskBadge, DismissableNote } from '@/components/shared';
import { rankShelters, calculateCapacityGap } from '@/utils/riskUtils';
import { HAZARD_LABELS, RISK_LABELS } from '@/data/demoData';
import { downloadFile } from '@/utils/dataUtils';
import { Download, FileText, AlertTriangle, Info, Database } from 'lucide-react';

export default function ReportsPage() {
  const { riskZones, shelters, hazard, studyArea, mlModelTrained, dataQuality } = useApp();

  const hazardZones = riskZones.filter((z) => z.hazard === hazard);
  const highRiskZones = hazardZones.filter((z) => z.riskLevel === 'high');
  const highRiskPop = highRiskZones.reduce((s, z) => s + z.population, 0);
  const totalPop = hazardZones.reduce((s, z) => s + z.population, 0);

  const ranked = rankShelters(shelters, hazard, highRiskPop);
  const { totalSpare, gap, hasReliableData } = calculateCapacityGap(shelters, highRiskPop);

  const generateCSV = (rows: string[][], headers: string[]): string => {
    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  };

  const exportRiskZones = () => {
    const headers = ['Zone ID', 'Name', 'Hazard', 'Risk Level', 'Risk Score', 'Population', 'Area (km²)'];
    const rows = hazardZones.map((z) => [
      z.id, z.name, HAZARD_LABELS[z.hazard], RISK_LABELS[z.riskLevel], String(z.riskScore),
      String(z.population), String(z.area_km2),
    ]);
    downloadFile(`risk_zones_${hazard}.csv`, generateCSV(rows, headers));
  };

  const exportShelterRankings = () => {
    const headers = ['Rank', 'ID', 'Name', 'Score', 'Spare Capacity', 'Hazard Exposure', 'Verification', 'Road Access'];
    const rows = ranked.map((s) => [
      String(s.rank), s.id, s.name, String(s.rankScore),
      s.spareCapacity?.toString() ?? 'Unknown', s.hazardExposure, s.verification, s.roadAccessible,
    ]);
    downloadFile(`shelter_rankings_${hazard}.csv`, generateCSV(rows, headers));
  };

  const exportPopulationExposure = () => {
    const headers = ['Zone ID', 'Name', 'Risk Level', 'Population', 'Risk Score'];
    const rows = hazardZones.map((z) => [
      z.id, z.name, RISK_LABELS[z.riskLevel], String(z.population), String(z.riskScore),
    ]);
    downloadFile(`population_exposure_${hazard}.csv`, generateCSV(rows, headers));
  };

  const exportCapacityGaps = () => {
    const headers = ['Metric', 'Value'];
    const rows = [
      ['High-Risk Population', String(highRiskPop)],
      ['Total Spare Capacity', hasReliableData ? String(totalSpare) : 'Unknown'],
      ['Capacity Gap', hasReliableData ? String(gap) : 'Unknown'],
      ['Shelters Verified', String(shelters.filter((s) => s.verification === 'verified').length)],
      ['Shelters Unverified', String(shelters.filter((s) => s.verification === 'unverified').length)],
    ];
    downloadFile(`capacity_gaps_${hazard}.csv`, generateCSV(rows, headers));
  };

  const dataQualityItems = [
    { key: 'rainfall', label: 'Rainfall Data', ok: dataQuality.rainfall },
    { key: 'temperature', label: 'Temperature Data', ok: dataQuality.temperature },
    { key: 'elevation', label: 'Elevation Data', ok: dataQuality.elevation },
    { key: 'population', label: 'Population Data', ok: dataQuality.population },
    { key: 'historical', label: 'Historical Events', ok: dataQuality.historical },
    { key: 'shelters', label: 'Shelter Data', ok: dataQuality.shelters },
    { key: 'roads', label: 'Road Network', ok: dataQuality.roads },
    { key: 'rivers', label: 'River Data', ok: dataQuality.rivers },
  ];

  const missingData = dataQualityItems.filter((d) => !d.ok);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports & Methodology"
        subtitle="Export summaries and review the risk-scoring approach"
      />

      <DismissableNote>
        All reports are generated from <strong>synthetic demo data</strong>. Export and use only after
        replacing with official datasets. Reports include data limitations and verification warnings.
      </DismissableNote>

      {/* Export buttons */}
      <SectionCard title="Export Reports" subtitle="Download CSV summaries for each report type">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={exportRiskZones}
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50/30 transition-all text-left"
          >
            <Download className="w-5 h-5 text-blue-600 shrink-0" />
            <div>
              <div className="text-sm font-medium text-gray-900">Risk Zone Summary</div>
              <div className="text-xs text-gray-500">Zone IDs, risk levels, scores, population</div>
            </div>
          </button>
          <button
            onClick={exportPopulationExposure}
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50/30 transition-all text-left"
          >
            <Download className="w-5 h-5 text-blue-600 shrink-0" />
            <div>
              <div className="text-sm font-medium text-gray-900">Population Exposure Summary</div>
              <div className="text-xs text-gray-500">Population by zone and risk level</div>
            </div>
          </button>
          <button
            onClick={exportShelterRankings}
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50/30 transition-all text-left"
          >
            <Download className="w-5 h-5 text-blue-600 shrink-0" />
            <div>
              <div className="text-sm font-medium text-gray-900">Candidate Shelter Rankings</div>
              <div className="text-xs text-gray-500">Ranked shelters with scores and capacity</div>
            </div>
          </button>
          <button
            onClick={exportCapacityGaps}
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50/30 transition-all text-left"
          >
            <Download className="w-5 h-5 text-blue-600 shrink-0" />
            <div>
              <div className="text-sm font-medium text-gray-900">Capacity Gap Report</div>
              <div className="text-xs text-gray-500">Spare capacity vs. population demand</div>
            </div>
          </button>
        </div>
      </SectionCard>

      {/* Summary report */}
      <SectionCard title="Summary Report" subtitle={`${studyArea.name} • ${HAZARD_LABELS[hazard]} hazard`}>
        <div className="space-y-6">
          {/* Risk zones summary */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Risk Zone Summary</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left">
                    <th className="py-2 px-3 font-semibold text-gray-600">Zone</th>
                    <th className="py-2 px-3 font-semibold text-gray-600">Risk Level</th>
                    <th className="py-2 px-3 font-semibold text-gray-600 text-right">Score</th>
                    <th className="py-2 px-3 font-semibold text-gray-600 text-right">Population</th>
                  </tr>
                </thead>
                <tbody>
                  {hazardZones.map((z) => (
                    <tr key={z.id} className="border-b border-gray-100">
                      <td className="py-2 px-3 text-gray-900">{z.name}</td>
                      <td className="py-2 px-3"><RiskBadge level={z.riskLevel} /></td>
                      <td className="py-2 px-3 text-right font-semibold text-gray-900">{z.riskScore}/100</td>
                      <td className="py-2 px-3 text-right text-gray-700">{z.population.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-gray-200 font-semibold">
                    <td className="py-2 px-3 text-gray-900" colSpan={3}>Total Population at Risk</td>
                    <td className="py-2 px-3 text-right text-gray-900">{totalPop.toLocaleString()}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Shelter ranking summary */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Top 5 Shelter Rankings</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left">
                    <th className="py-2 px-3 font-semibold text-gray-600">Rank</th>
                    <th className="py-2 px-3 font-semibold text-gray-600">Shelter</th>
                    <th className="py-2 px-3 font-semibold text-gray-600 text-right">Score</th>
                    <th className="py-2 px-3 font-semibold text-gray-600 text-right">Spare</th>
                    <th className="py-2 px-3 font-semibold text-gray-600">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {ranked.slice(0, 5).map((s) => (
                    <tr key={s.id} className="border-b border-gray-100">
                      <td className="py-2 px-3 font-bold text-gray-900">#{s.rank}</td>
                      <td className="py-2 px-3 text-gray-900">{s.name}</td>
                      <td className="py-2 px-3 text-right font-semibold text-gray-900">{s.rankScore}</td>
                      <td className="py-2 px-3 text-right text-gray-700">
                        {s.spareCapacity?.toLocaleString() ?? 'Unknown'}
                      </td>
                      <td className="py-2 px-3 text-gray-600">{s.verification}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Capacity gap */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Capacity Gap Summary</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-500">High-Risk Population</div>
                <div className="text-xl font-bold text-gray-900">{highRiskPop.toLocaleString()}</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-500">Available Spare Capacity</div>
                <div className="text-xl font-bold text-gray-900">
                  {hasReliableData ? totalSpare.toLocaleString() : 'Unknown'}
                </div>
              </div>
              <div className={`p-4 rounded-lg ${gap > 0 ? 'bg-red-50' : 'bg-green-50'}`}>
                <div className="text-xs text-gray-500">Capacity Gap</div>
                <div className={`text-xl font-bold ${gap > 0 ? 'text-red-700' : 'text-green-700'}`}>
                  {hasReliableData ? gap.toLocaleString() : 'Unknown'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </SectionCard>

      {/* Data limitations */}
      <SectionCard title="Data Limitations & Verification Warnings">
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-sm text-gray-700">
              <strong>Synthetic data:</strong> All current data is generated for demonstration. It does not
              represent real observations and must not be used for operational decisions.
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Database className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="text-sm text-gray-700">
              <strong>Missing data sources:</strong>{' '}
              {missingData.length > 0
                ? missingData.map((d) => d.label).join(', ')
                : 'All data sources are available (demo data).'}
              {missingData.length > 0 && ' — risk scores for zones with missing data should be treated as incomplete.'}
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="text-sm text-gray-700">
              <strong>ML model status:</strong> {mlModelTrained
                ? 'Random Forest model is trained on labelled data. Feature importance contributes to scores.'
                : 'No ML model trained. Rule-based scoring is used with transparent, configurable weights.'}
            </div>
          </div>
          <div className="flex items-start gap-3">
            <FileText className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="text-sm text-gray-700">
              <strong>Shelter verification:</strong>{' '}
              {shelters.filter((s) => s.verification === 'unverified').length} shelters are unverified and
              must be confirmed with local authorities before use.
            </div>
          </div>
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="text-sm text-gray-700">
              <strong>Route safety:</strong> All suggested routes are unverified. Road closures, flooding,
              and accessibility must be checked before any relocation.
            </div>
          </div>
        </div>
      </SectionCard>

      {/* Methodology */}
      <SectionCard title="Risk Scoring Methodology">
        <div className="prose prose-sm max-w-none text-gray-700 space-y-4">
          <div>
            <h4 className="font-semibold text-gray-900 mb-1">1. Data Collection</h4>
            <p className="text-sm">
              The system accepts rainfall, temperature, population, historical disaster events, elevation,
              road networks, river data, and candidate shelter information via CSV and GeoJSON uploads.
              All uploaded data is validated for file type, required columns, missing values, coordinate
              ranges, and duplicate IDs.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-1">2. Risk Scoring</h4>
            <p className="text-sm">
              {mlModelTrained
                ? 'A Random Forest classifier is trained on labelled historical data when sufficient reliable data is available. The model uses features like rainfall, elevation, slope, river distance, and historical events to classify risk.'
                : 'A transparent rule-based weighted scoring method is used. Each factor (rainfall, elevation, river distance, historical events, population, etc.) contributes proportionally to its configured weight. Weights are hazard-specific and user-adjustable. Scores range from 0 to 100.'}
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-1">3. Risk Classification</h4>
            <p className="text-sm">
              Scores are classified into three screening categories: Potential High Risk (≥65), Medium Risk
              (40–64), and Lower Relative Risk (&lt;40). These are <strong>screening categories, not official
              hazard classifications</strong>. Areas with insufficient data are labelled as such, not assumed safe.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-1">4. Shelter Ranking</h4>
            <p className="text-sm">
              Candidate shelters are ranked using a composite score considering hazard exposure, spare
              capacity, water/sanitation/healthcare access, road connectivity, and verification status.
              Higher scores indicate better candidates for relocation.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-1">5. Route Suggestions</h4>
            <p className="text-sm">
              Straight-line routes are drawn from high-risk zones to top-ranked shelters. All routes are
              marked as <strong>unverified</strong> until road conditions are confirmed. Actual road network
              routing requires verified road data.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-1">6. Limitations</h4>
            <ul className="text-sm list-disc pl-5 space-y-1">
              <li>Risk scores depend on data quality and completeness.</li>
              <li>No historical disaster record does not mean no risk.</li>
              <li>The system supports human decision-making and must not issue evacuation orders.</li>
              <li>Routes and sites are not guaranteed safe.</li>
              <li>ML model requires sufficient labelled data; otherwise rule-based scoring is used.</li>
              <li>Capacity calculations require reliable total capacity and occupancy data.</li>
            </ul>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
