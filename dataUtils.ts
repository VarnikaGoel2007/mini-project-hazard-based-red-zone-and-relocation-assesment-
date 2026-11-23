import Papa from 'papaparse';

export const SAMPLE_CSV_TEMPLATES: Record<string, string> = {
  rainfall: `station_id,latitude,longitude,annual_rainfall_mm,monsoon_rainfall_mm,date_recorded
ST001,26.68,92.78,2400,1800,2024-08-15
ST002,26.65,92.85,2300,1750,2024-08-15
ST003,26.58,92.92,1900,1400,2024-08-15
ST004,26.55,93.05,1600,1100,2024-08-15
ST005,26.48,92.82,2100,1550,2024-08-15
ST006,26.62,92.70,1500,1050,2024-08-15`,

  population: `zone_id,zone_name,latitude,longitude,population,area_km2,density_per_km2,vulnerability_index
RZ001,North Riverside,26.68,92.78,12500,4.2,2976,0.72
RZ002,Floodplain Central,26.65,92.85,8700,3.5,2486,0.68
RZ003,Central Valley,26.58,92.92,15300,5.8,2638,0.55
RZ004,East Plateau,26.55,93.05,4200,3.1,1355,0.32
RZ005,South Lowlands,26.48,92.82,9800,4.5,2178,0.60
RZ006,West Uplands,26.62,92.70,3100,2.8,1107,0.28`,

  historical: `event_id,event_type,latitude,longitude,date,severity,affected_population,damage_description
EV001,Flood,26.68,92.78,2020-07-15,severe,8000,Major flooding riverside
EV002,Flood,26.65,92.85,2021-08-20,moderate,5000,Overflow into residential
EV003,Flood,26.58,92.92,2019-09-03,moderate,3000,Localized flooding
EV004,Landslide,26.72,92.95,2022-07-10,severe,500,Slope collapse on hillside
EV005,Heat,26.57,92.90,2023-06-18,moderate,15000,Heat wave urban center`,

  shelters: `shelter_id,name,latitude,longitude,type,total_capacity,current_occupancy,water,sanitation,healthcare,road_accessible,verification
SH001,Central Public School,26.55,92.96,school,800,120,yes,yes,no,yes,verified
SH002,District Community Hall,26.53,92.88,community_center,500,50,yes,yes,yes,yes,verified
SH003,Eastside High School,26.54,93.02,school,600,,yes,no,no,yes,estimated
SH004,Riverside Primary School,26.67,92.82,school,300,40,no,no,no,no,estimated
SH005,Regional Sports Stadium,26.52,92.95,stadium,2000,100,yes,yes,yes,yes,verified
SH006,Hilltop Community Center,26.69,93.00,community_center,400,,,,,unknown,unverified
SH007,South Municipal Building,26.49,92.85,other,350,60,yes,yes,no,yes,estimated`,

  infrastructure: `facility_id,name,latitude,longitude,facility_type,road_accessible,water,sanitation
INF001,City Hospital,26.56,92.91,hospital,yes,yes,yes
INF002,North Clinic,26.68,92.80,clinic,no,yes,no
INF003,South Health Center,26.50,92.84,clinic,yes,yes,yes
INF004,Fire Station,26.57,92.89,fire_station,yes,yes,yes
INF005,Police Station East,26.56,93.00,police,yes,yes,no`,
};

export const SAMPLE_GEOJSON_TEMPLATES: Record<string, string> = JSON.stringify(
  {
    study_area: {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: { name: 'Demo Study Area', type: 'boundary' },
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [92.65, 26.75],
                [93.15, 26.75],
                [93.15, 26.4],
                [92.65, 26.4],
                [92.65, 26.75],
              ],
            ],
          },
        },
      ],
    },
    roads: {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: { name: 'Main Highway', type: 'highway', verified: true },
          geometry: {
            type: 'LineString',
            coordinates: [
              [92.9, 26.75],
              [92.9, 26.65],
              [92.9, 26.55],
              [92.9, 26.45],
            ],
          },
        },
      ],
    },
    rivers: {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: { name: 'Main River' },
          geometry: {
            type: 'LineString',
            coordinates: [
              [92.72, 26.75],
              [92.76, 26.7],
              [92.8, 26.65],
              [92.83, 26.6],
            ],
          },
        },
      ],
    },
    shelters: {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: {
            name: 'Central Public School',
            type: 'school',
            total_capacity: 800,
            current_occupancy: 120,
            water: 'yes',
            sanitation: 'yes',
            verification: 'verified',
          },
          geometry: { type: 'Point', coordinates: [92.96, 26.55] },
        },
      ],
    },
  },
  null,
  2,
);

export interface ValidationResult {
  valid: boolean;
  warnings: string[];
  errors: string[];
  rowCount: number;
  data: any[];
}

export function validateCSV(
  file: File,
  requiredColumns: string[],
  numericColumns: string[] = [],
): Promise<ValidationResult> {
  return new Promise((resolve) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const errors: string[] = [];
        const warnings: string[] = [];

        if (results.errors.length > 0) {
          results.errors.forEach((err) =>
            errors.push(`Parse error on row ${err.row ?? '?'}: ${err.message}`),
          );
        }

        const columns = results.meta.fields ?? [];
        const missingCols = requiredColumns.filter((c) => !columns.includes(c));
        if (missingCols.length > 0) {
          errors.push(`Missing required columns: ${missingCols.join(', ')}`);
        }

        const rows = results.data as any[];
        if (rows.length === 0) {
          errors.push('File contains no data rows.');
        }

        // Check numeric columns
        numericColumns.forEach((col) => {
          if (!columns.includes(col)) return;
          rows.forEach((row, i) => {
            const val = row[col];
            if (val !== null && val !== '' && val !== undefined && isNaN(Number(val))) {
              warnings.push(`Row ${i + 2}: column "${col}" has non-numeric value "${val}"`);
            }
          });
        });

        // Check for duplicate IDs
        const idCol = requiredColumns.find((c) => c.includes('id'));
        if (idCol && columns.includes(idCol)) {
          const ids = rows.map((r) => r[idCol]);
          const duplicates = ids.filter((id, i) => ids.indexOf(id) !== i);
          if (duplicates.length > 0) {
            warnings.push(`Duplicate IDs found: ${[...new Set(duplicates)].join(', ')}`);
          }
        }

        // Check coordinate ranges
        ['latitude', 'longitude'].forEach((col) => {
          if (columns.includes(col)) {
            rows.forEach((row, i) => {
              const val = Number(row[col]);
              if (col === 'latitude' && (val < -90 || val > 90)) {
                warnings.push(`Row ${i + 2}: latitude out of range (-90 to 90)`);
              }
              if (col === 'longitude' && (val < -180 || val > 180)) {
                warnings.push(`Row ${i + 2}: longitude out of range (-180 to 180)`);
              }
            });
          }
        });

        // Check missing values in required columns
        rows.forEach((row, i) => {
          requiredColumns.forEach((col) => {
            if (columns.includes(col) && (row[col] === null || row[col] === '' || row[col] === undefined)) {
              warnings.push(`Row ${i + 2}: missing value in "${col}"`);
            }
          });
        });

        resolve({
          valid: errors.length === 0,
          warnings,
          errors,
          rowCount: rows.length,
          data: rows,
        });
      },
      error: (err) => {
        resolve({
          valid: false,
          warnings: [],
          errors: [`Failed to parse file: ${err.message}`],
          rowCount: 0,
          data: [],
        });
      },
    });
  });
}

export function downloadFile(filename: string, content: string, mimeType = 'text/csv') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function downloadJSON(filename: string, json: string) {
  downloadFile(filename, json, 'application/json');
}
