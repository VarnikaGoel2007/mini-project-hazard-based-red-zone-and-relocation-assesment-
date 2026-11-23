import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { SectionCard, PageHeader, DismissableNote } from '@/components/shared';
import { validateCSV, downloadFile, downloadJSON, SAMPLE_CSV_TEMPLATES, SAMPLE_GEOJSON_TEMPLATES } from '@/utils/dataUtils';
import { ingestUploadedData } from '@/utils/ingestion';
import { REGION_DATASETS } from '@/data/regionDatasets';
import type { UploadedFile } from '@/types';
import { Upload, FileCheck, FileWarning, FileX, Download, Trash2, FileText, FileJson, MapPin, RotateCcw, CheckCircle2, Database } from 'lucide-react';

interface FileCategory {
  label: string;
  accept: string;
  requiredColumns: string[];
  numericColumns: string[];
  ingestKey: string;
}

const FILE_CATEGORIES: Record<string, FileCategory> = {
  rainfall: {
    label: 'Rainfall / Temperature CSV',
    accept: '.csv',
    requiredColumns: ['station_id', 'latitude', 'longitude', 'annual_rainfall_mm'],
    numericColumns: ['latitude', 'longitude', 'annual_rainfall_mm', 'monsoon_rainfall_mm'],
    ingestKey: 'rainfall',
  },
  population: {
    label: 'Population CSV',
    accept: '.csv',
    requiredColumns: ['zone_id', 'zone_name', 'latitude', 'longitude', 'population'],
    numericColumns: ['latitude', 'longitude', 'population', 'area_km2'],
    ingestKey: 'population',
  },
  historical: {
    label: 'Historical Disaster Events CSV',
    accept: '.csv',
    requiredColumns: ['event_id', 'event_type', 'latitude', 'longitude', 'date'],
    numericColumns: ['latitude', 'longitude', 'affected_population'],
    ingestKey: 'historical',
  },
  shelters: {
    label: 'Candidate Shelters CSV',
    accept: '.csv',
    requiredColumns: ['shelter_id', 'name', 'latitude', 'longitude', 'type'],
    numericColumns: ['latitude', 'longitude', 'total_capacity', 'current_occupancy'],
    ingestKey: 'shelters',
  },
  infrastructure: {
    label: 'Infrastructure Facilities CSV',
    accept: '.csv',
    requiredColumns: ['facility_id', 'name', 'latitude', 'longitude', 'facility_type'],
    numericColumns: ['latitude', 'longitude'],
    ingestKey: 'infrastructure',
  },
  geojson_roads: {
    label: 'GeoJSON — Roads',
    accept: '.geojson,.json',
    requiredColumns: [],
    numericColumns: [],
    ingestKey: 'roads_geojson',
  },
  geojson_rivers: {
    label: 'GeoJSON — Rivers',
    accept: '.geojson,.json',
    requiredColumns: [],
    numericColumns: [],
    ingestKey: 'rivers_geojson',
  },
  geojson_study_area: {
    label: 'GeoJSON — Study Area Boundary',
    accept: '.geojson,.json',
    requiredColumns: [],
    numericColumns: [],
    ingestKey: 'study_area_geojson',
  },
};

export default function DataUploadPage() {
  const {
    uploadedFiles,
    addUploadedFiles,
    clearUploadedFiles,
    dataSource,
    applyIngestedData,
    resetToDemo,
    rawUploaded,
    setRawUploaded,
    riskZones,
    shelters,
    roads,
    rivers,
    studyArea,
    hazard,
  } = useApp();
  const [activeCategory, setActiveCategory] = useState<string>('population');
  const [uploading, setUploading] = useState(false);
  const [ingestMessage, setIngestMessage] = useState<string | null>(null);

  const runIngestion = (category: string, data: any[]) => {
    const cat = FILE_CATEGORIES[category];
    if (!cat) return;

    // Update raw uploaded accumulator
    if (cat.ingestKey === 'rainfall') setRawUploaded('rainfall', data);
    else if (cat.ingestKey === 'population') setRawUploaded('population', data);
    else if (cat.ingestKey === 'historical') setRawUploaded('historical', data);
    else if (cat.ingestKey === 'shelters') setRawUploaded('shelters', data);
    else if (cat.ingestKey === 'roads_geojson') setRawUploaded('roads', data);
    else if (cat.ingestKey === 'rivers_geojson') setRawUploaded('rivers', data);
    else if (cat.ingestKey === 'study_area_geojson') setRawUploaded('studyArea', data[0] ?? null);
    else return; // infrastructure doesn't directly feed into app state yet

    // Use updated raw data (merge the new data with existing)
    const updatedRaw = { ...rawUploaded };
    if (cat.ingestKey === 'rainfall') updatedRaw.rainfall = data;
    else if (cat.ingestKey === 'population') updatedRaw.population = data;
    else if (cat.ingestKey === 'historical') updatedRaw.historical = data;
    else if (cat.ingestKey === 'shelters') updatedRaw.shelters = data;
    else if (cat.ingestKey === 'roads_geojson') updatedRaw.roads = data;
    else if (cat.ingestKey === 'rivers_geojson') updatedRaw.rivers = data;
    else if (cat.ingestKey === 'study_area_geojson') updatedRaw.studyArea = data[0] ?? null;

    const ingested = ingestUploadedData(cat.ingestKey, data, {
      riskZones,
      shelters,
      roads,
      rivers,
      studyArea,
      hazard,
      rainfallData: updatedRaw.rainfall,
      populationData: updatedRaw.population,
      historicalData: updatedRaw.historical,
      shelterData: updatedRaw.shelters,
      roadData: updatedRaw.roads,
      riverData: updatedRaw.rivers,
      studyAreaData: updatedRaw.studyArea,
    });

    applyIngestedData(ingested);

    const parts: string[] = [];
    if (ingested.riskZones.length > 0) parts.push(`${ingested.riskZones.length} risk zones`);
    if (ingested.shelters.length > 0) parts.push(`${ingested.shelters.length} shelters`);
    if (ingested.roads.length > 0) parts.push(`${ingested.roads.length} road segments`);
    if (ingested.rivers.length > 0) parts.push(`${ingested.rivers.length} river segments`);
    if (ingested.studyArea) parts.push('study area boundary');
    setIngestMessage(`Data applied to the system: ${parts.join(', ')}. All dashboards and maps now reflect your uploaded data.`);
  };

  const handleFileUpload = async (files: FileList) => {
    setUploading(true);
    setIngestMessage(null);
    const results: UploadedFile[] = [];
    const cat = FILE_CATEGORIES[activeCategory];

    for (const file of Array.from(files)) {
      const fileId = `file-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

      // GeoJSON files
      if (cat.ingestKey.includes('geojson')) {
        const text = await file.text();
        try {
          const json = JSON.parse(text);
          const features = json.features ?? [];
          results.push({
            id: fileId,
            name: file.name,
            type: file.type || 'application/json',
            size: file.size,
            status: features.length > 0 ? 'valid' : 'warning',
            message: features.length > 0
              ? `Valid GeoJSON with ${features.length} features. Data applied to the system.`
              : 'Valid JSON but no features found.',
            rowCount: features.length,
            data: features,
          });
          if (features.length > 0) {
            runIngestion(activeCategory, features);
          }
        } catch {
          results.push({
            id: fileId,
            name: file.name,
            type: file.type || 'application/json',
            size: file.size,
            status: 'error',
            message: 'Invalid JSON file. Please check the format.',
          });
        }
        continue;
      }

      // CSV files
      const result = await validateCSV(file, cat.requiredColumns, cat.numericColumns);
      const status = result.valid ? (result.warnings.length > 0 ? 'warning' : 'valid') : 'error';
      results.push({
        id: fileId,
        name: file.name,
        type: file.type || 'text/csv',
        size: file.size,
        status,
        message: result.valid
          ? result.warnings.length > 0
            ? `Valid with ${result.warnings.length} warning(s). Data applied to the system.`
            : 'Valid. Data applied to the system.'
          : result.errors.join('; '),
        rowCount: result.rowCount,
        data: result.data,
      });

      if (result.valid && result.data.length > 0) {
        runIngestion(activeCategory, result.data);
      }
    }

    addUploadedFiles(results);
    setUploading(false);
  };

  const statusConfig = {
    valid: { icon: FileCheck, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
    warning: { icon: FileWarning, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
    error: { icon: FileX, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
  };

  const validCount = uploadedFiles.filter((f) => f.status === 'valid').length;
  const warningCount = uploadedFiles.filter((f) => f.status === 'warning').length;
  const errorCount = uploadedFiles.filter((f) => f.status === 'error').length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Data Upload & Validation"
        subtitle="Upload CSV and GeoJSON files — validated data is applied to all dashboards, maps, and reports"
      />

      {/* Data source banner */}
      <div className={`flex items-center justify-between p-4 rounded-xl border ${
        dataSource === 'demo'
          ? 'bg-amber-50 border-amber-200'
          : 'bg-green-50 border-green-200'
      }`}>
        <div className="flex items-center gap-3">
          <Database className={`w-5 h-5 ${dataSource === 'demo' ? 'text-amber-600' : 'text-green-600'}`} />
          <div>
            <div className="font-semibold text-sm text-gray-900">
              {dataSource === 'demo' ? 'Using Synthetic Demo Data' : 'Using Uploaded Data'}
            </div>
            <div className="text-xs text-gray-600">
              {dataSource === 'demo'
                ? 'All dashboards show the pre-loaded Brahmaputra Valley demo dataset.'
                : 'Your uploaded data is now driving all dashboards, maps, risk scores, and reports.'}
            </div>
          </div>
        </div>
        <button
          onClick={resetToDemo}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Reset to Demo Data
        </button>
      </div>

      {/* Ingestion success message */}
      {ingestMessage && (
        <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
          <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
          <div className="text-sm text-green-900">{ingestMessage}</div>
        </div>
      )}

      <DismissableNote>
        When you upload valid data, the system <strong>immediately updates all pages</strong> — the map, dashboard
        stats, risk scores, shelter rankings, alerts, and reports. All demo data is clearly labelled and not real
        observations. Replace with authentic datasets from official sources for operational use.
      </DismissableNote>

      {/* Upload area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SectionCard title="Upload Files" subtitle="Select a file type, then choose files to upload">
            <div className="space-y-4">
              {/* Category selector */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                {Object.entries(FILE_CATEGORIES).map(([key, cat]) => (
                  <button
                    key={key}
                    onClick={() => setActiveCategory(key)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all ${
                      activeCategory === key
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Drop zone */}
              <label className="flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-all">
                <Upload className={`w-10 h-10 ${uploading ? 'text-blue-400 animate-pulse' : 'text-gray-400'}`} />
                <div className="text-center">
                  <div className="text-sm font-medium text-gray-700">
                    {uploading ? 'Validating and applying data...' : 'Click to select files or drag and drop'}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Accepts: {FILE_CATEGORIES[activeCategory].accept}
                  </div>
                </div>
                <input
                  type="file"
                  multiple
                  accept={FILE_CATEGORIES[activeCategory].accept}
                  className="hidden"
                  onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                />
              </label>

              {/* Required columns info */}
              {FILE_CATEGORIES[activeCategory].requiredColumns.length > 0 && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Required Columns</div>
                  <div className="text-sm text-gray-700">
                    {FILE_CATEGORIES[activeCategory].requiredColumns.join(', ')}
                  </div>
                </div>
              )}

              {/* Suggested upload order */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="text-sm font-semibold text-blue-900 mb-2">Recommended Upload Order</div>
                <div className="text-xs text-blue-800 space-y-1">
                  <div>1. <strong>Study Area Boundary</strong> (GeoJSON) — sets the map area</div>
                  <div>2. <strong>Rivers</strong> (GeoJSON) — needed for flood risk scoring</div>
                  <div>3. <strong>Roads</strong> (GeoJSON) — for route suggestions</div>
                  <div>4. <strong>Population</strong> (CSV) — creates risk zones and scores them</div>
                  <div>5. <strong>Rainfall</strong> (CSV) — improves risk score accuracy</div>
                  <div>6. <strong>Historical Events</strong> (CSV) — adds historical event factor</div>
                  <div>7. <strong>Shelters</strong> (CSV) — populates shelter assessment and rankings</div>
                </div>
              </div>
            </div>
          </SectionCard>
        </div>

        {/* Upload summary */}
        <SectionCard title="Upload Summary" subtitle={`${uploadedFiles.length} files uploaded`}>
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="text-xl font-bold text-green-700">{validCount}</div>
                <div className="text-xs text-green-600">Valid</div>
              </div>
              <div className="p-3 bg-amber-50 rounded-lg">
                <div className="text-xl font-bold text-amber-700">{warningCount}</div>
                <div className="text-xs text-amber-600">Warnings</div>
              </div>
              <div className="p-3 bg-red-50 rounded-lg">
                <div className="text-xl font-bold text-red-700">{errorCount}</div>
                <div className="text-xs text-red-600">Errors</div>
              </div>
            </div>

            {uploadedFiles.length > 0 && (
              <button
                onClick={() => {
                  clearUploadedFiles();
                  setIngestMessage(null);
                }}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Clear File List
              </button>
            )}

            <div className="text-xs text-gray-500 pt-2 border-t border-gray-100">
              Validation checks: file type, required columns, missing values, coordinate ranges, duplicate IDs, numeric column types. Valid data is immediately applied to all pages.
            </div>
          </div>
        </SectionCard>
      </div>

      {/* Uploaded files list */}
      {uploadedFiles.length > 0 && (
        <SectionCard title="Uploaded Files">
          <div className="space-y-3">
            {uploadedFiles.map((file) => {
              const cfg = statusConfig[file.status];
              const Icon = cfg.icon;
              return (
                <div key={file.id} className={`flex items-start gap-3 p-4 rounded-lg border ${cfg.bg} ${cfg.border}`}>
                  <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${cfg.color}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900 text-sm">{file.name}</span>
                      <span className="text-xs text-gray-500">
                        {(file.size / 1024).toFixed(1)} KB
                        {file.rowCount !== undefined && ` • ${file.rowCount} rows`}
                      </span>
                    </div>
                    <div className={`text-sm mt-1 ${cfg.color}`}>{file.message}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </SectionCard>
      )}

      {/* Region Datasets */}
      <SectionCard
        title="Pre-Built Region Datasets"
        subtitle="Download complete synthetic datasets for different geographic areas, then upload them to test the system"
      >
        <div className="space-y-4">
          {REGION_DATASETS.map((region) => (
            <div key={region.id} className="border border-gray-200 rounded-xl overflow-hidden">
              <div className="flex items-start gap-3 p-4 bg-gray-50 border-b border-gray-200">
                <MapPin className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="font-semibold text-gray-900 text-sm">{region.name}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{region.description}</div>
                </div>
              </div>
              <div className="p-4">
                <div className="text-xs font-semibold text-gray-500 uppercase mb-2">CSV Files</div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 mb-4">
                  {Object.entries(region.files).map(([key, content]) => (
                    <button
                      key={key}
                      onClick={() => downloadFile(`${region.id}_${key}.csv`, content)}
                      className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50/30 transition-all text-left"
                    >
                      <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                      <span className="text-xs font-medium text-gray-700 capitalize">{key}</span>
                      <Download className="w-3 h-3 text-gray-400 ml-auto" />
                    </button>
                  ))}
                </div>
                <div className="text-xs font-semibold text-gray-500 uppercase mb-2">GeoJSON Files</div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {Object.entries(region.geojson).map(([key, content]) => (
                    <button
                      key={key}
                      onClick={() => downloadJSON(`${region.id}_${key}.geojson`, JSON.stringify(content, null, 2))}
                      className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50/30 transition-all text-left"
                    >
                      <FileJson className="w-4 h-4 text-blue-600 shrink-0" />
                      <span className="text-xs font-medium text-gray-700 capitalize">{key}</span>
                      <Download className="w-3 h-3 text-gray-400 ml-auto" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Basic Templates */}
      <SectionCard title="Basic Templates (Brahmaputra Demo Region)" subtitle="Download CSV and GeoJSON templates to see expected formats">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Object.entries(SAMPLE_CSV_TEMPLATES).map(([key, content]) => (
            <button
              key={key}
              onClick={() => downloadFile(`template_${key}.csv`, content)}
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50/30 transition-all text-left"
            >
              <FileText className="w-5 h-5 text-blue-600 shrink-0" />
              <div>
                <div className="text-sm font-medium text-gray-900 capitalize">{key} CSV Template</div>
                <div className="text-xs text-gray-500">Download sample</div>
              </div>
              <Download className="w-4 h-4 text-gray-400 ml-auto" />
            </button>
          ))}
          {Object.entries(JSON.parse(SAMPLE_GEOJSON_TEMPLATES)).map(([key, content]) => (
            <button
              key={key}
              onClick={() => downloadJSON(`template_${key}.geojson`, JSON.stringify(content, null, 2))}
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50/30 transition-all text-left"
            >
              <FileJson className="w-5 h-5 text-blue-600 shrink-0" />
              <div>
                <div className="text-sm font-medium text-gray-900 capitalize">{key} GeoJSON Template</div>
                <div className="text-xs text-gray-500">Download sample</div>
              </div>
              <Download className="w-4 h-4 text-gray-400 ml-auto" />
            </button>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
