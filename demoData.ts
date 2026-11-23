import type {
  RiskZone,
  Shelter,
  RoadSegment,
  RiverSegment,
  StudyArea,
  Alert,
  HazardType,
  RiskWeights,
} from '@/types';

// Demo study area: Brahmaputra Valley region (synthetic)
export const DEMO_STUDY_AREA: StudyArea = {
  id: 'demo-brahmaputra',
  name: 'Brahmaputra Valley (Demo Region)',
  center: [26.575, 92.9],
  zoom: 10,
  boundary: [
    [26.75, 92.65],
    [26.75, 93.15],
    [26.4, 93.15],
    [26.4, 92.65],
  ],
};

export const DEMO_RISK_ZONES: RiskZone[] = [
  {
    id: 'rz-001',
    name: 'North Riverside Sector A',
    lat: 26.68, lng: 92.78,
    hazard: 'flood',
    riskLevel: 'high',
    riskScore: 82,
    population: 12500,
    area_km2: 4.2,
    factors: [
      { name: 'Annual Rainfall', value: '2400 mm', weight: 0.2, contribution: 19 },
      { name: 'Distance to River', value: '0.3 km', weight: 0.2, contribution: 18 },
      { name: 'Elevation', value: '52 m', weight: 0.15, contribution: 15 },
      { name: 'Historical Floods', value: '5 events/10yr', weight: 0.25, contribution: 20 },
      { name: 'Population Density', value: '2976/km²', weight: 0.1, contribution: 8 },
      { name: 'Built-up Area', value: '62%', weight: 0.1, contribution: 2 },
    ],
  },
  {
    id: 'rz-002',
    name: 'Floodplain Sector B',
    lat: 26.65, lng: 92.85,
    hazard: 'flood',
    riskLevel: 'high',
    riskScore: 76,
    population: 8700,
    area_km2: 3.5,
    factors: [
      { name: 'Annual Rainfall', value: '2300 mm', weight: 0.2, contribution: 18 },
      { name: 'Distance to River', value: '0.8 km', weight: 0.2, contribution: 14 },
      { name: 'Elevation', value: '58 m', weight: 0.15, contribution: 13 },
      { name: 'Historical Floods', value: '4 events/10yr', weight: 0.25, contribution: 19 },
      { name: 'Population Density', value: '2486/km²', weight: 0.1, contribution: 7 },
      { name: 'Built-up Area', value: '48%', weight: 0.1, contribution: 5 },
    ],
  },
  {
    id: 'rz-003',
    name: 'Central Valley Sector C',
    lat: 26.58, lng: 92.92,
    hazard: 'flood',
    riskLevel: 'medium',
    riskScore: 54,
    population: 15300,
    area_km2: 5.8,
    factors: [
      { name: 'Annual Rainfall', value: '1900 mm', weight: 0.2, contribution: 14 },
      { name: 'Distance to River', value: '2.1 km', weight: 0.2, contribution: 8 },
      { name: 'Elevation', value: '75 m', weight: 0.15, contribution: 10 },
      { name: 'Historical Floods', value: '2 events/10yr', weight: 0.25, contribution: 12 },
      { name: 'Population Density', value: '2638/km²', weight: 0.1, contribution: 8 },
      { name: 'Built-up Area', value: '55%', weight: 0.1, contribution: 2 },
    ],
  },
  {
    id: 'rz-004',
    name: 'East Plateau Sector D',
    lat: 26.55, lng: 93.05,
    hazard: 'flood',
    riskLevel: 'low',
    riskScore: 28,
    population: 4200,
    area_km2: 3.1,
    factors: [
      { name: 'Annual Rainfall', value: '1600 mm', weight: 0.2, contribution: 10 },
      { name: 'Distance to River', value: '5.2 km', weight: 0.2, contribution: 3 },
      { name: 'Elevation', value: '115 m', weight: 0.15, contribution: 5 },
      { name: 'Historical Floods', value: '0 events/10yr', weight: 0.25, contribution: 0 },
      { name: 'Population Density', value: '1355/km²', weight: 0.1, contribution: 4 },
      { name: 'Built-up Area', value: '22%', weight: 0.1, contribution: 6 },
    ],
  },
  {
    id: 'rz-005',
    name: 'South Lowlands Sector E',
    lat: 26.48, lng: 92.82,
    hazard: 'flood',
    riskLevel: 'medium',
    riskScore: 61,
    population: 9800,
    area_km2: 4.5,
    factors: [
      { name: 'Annual Rainfall', value: '2100 mm', weight: 0.2, contribution: 16 },
      { name: 'Distance to River', value: '1.5 km', weight: 0.2, contribution: 12 },
      { name: 'Elevation', value: '65 m', weight: 0.15, contribution: 12 },
      { name: 'Historical Floods', value: '3 events/10yr', weight: 0.25, contribution: 16 },
      { name: 'Population Density', value: '2178/km²', weight: 0.1, contribution: 5 },
      { name: 'Built-up Area', value: '40%', weight: 0.1, contribution: 0 },
    ],
  },
  {
    id: 'rz-006',
    name: 'West Uplands Sector F',
    lat: 26.62, lng: 92.7,
    hazard: 'flood',
    riskLevel: 'low',
    riskScore: 22,
    population: 3100,
    area_km2: 2.8,
    factors: [
      { name: 'Annual Rainfall', value: '1500 mm', weight: 0.2, contribution: 8 },
      { name: 'Distance to River', value: '6.0 km', weight: 0.2, contribution: 2 },
      { name: 'Elevation', value: '130 m', weight: 0.15, contribution: 4 },
      { name: 'Historical Floods', value: '0 events/10yr', weight: 0.25, contribution: 0 },
      { name: 'Population Density', value: '1107/km²', weight: 0.1, contribution: 3 },
      { name: 'Built-up Area', value: '18%', weight: 0.1, contribution: 5 },
    ],
  },
  // Heat hazard zones
  {
    id: 'rz-007',
    name: 'Central Urban Heat Island',
    lat: 26.57, lng: 92.9,
    hazard: 'heat',
    riskLevel: 'high',
    riskScore: 78,
    population: 18700,
    area_km2: 3.2,
    factors: [
      { name: 'Max Temperature', value: '42.3°C', weight: 0.3, contribution: 28 },
      { name: 'Heat Wave Days', value: '18 days/yr', weight: 0.25, contribution: 22 },
      { name: 'Built-up Area', value: '78%', weight: 0.2, contribution: 16 },
      { name: 'Green Cover', value: '8%', weight: 0.15, contribution: 8 },
      { name: 'Population Density', value: '5844/km²', weight: 0.1, contribution: 4 },
    ],
  },
  {
    id: 'rz-008',
    name: 'East Residential Sector',
    lat: 26.56, lng: 93.0,
    hazard: 'heat',
    riskLevel: 'medium',
    riskScore: 52,
    population: 11200,
    area_km2: 4.0,
    factors: [
      { name: 'Max Temperature', value: '39.1°C', weight: 0.3, contribution: 18 },
      { name: 'Heat Wave Days', value: '10 days/yr', weight: 0.25, contribution: 15 },
      { name: 'Built-up Area', value: '55%', weight: 0.2, contribution: 10 },
      { name: 'Green Cover', value: '22%', weight: 0.15, contribution: 5 },
      { name: 'Population Density', value: '2800/km²', weight: 0.1, contribution: 4 },
    ],
  },
  // Landslide zones
  {
    id: 'rz-009',
    name: 'Hill Slope Sector G',
    lat: 26.72, lng: 92.95,
    hazard: 'landslide',
    riskLevel: 'high',
    riskScore: 74,
    population: 3400,
    area_km2: 2.5,
    factors: [
      { name: 'Slope Angle', value: '35°', weight: 0.3, contribution: 26 },
      { name: 'Elevation', value: '280 m', weight: 0.15, contribution: 10 },
      { name: 'Rainfall Intensity', value: '180 mm/24h', weight: 0.25, contribution: 22 },
      { name: 'Soil Type', value: 'Unstable', weight: 0.15, contribution: 10 },
      { name: 'Historical Landslides', value: '3 events/10yr', weight: 0.15, contribution: 6 },
    ],
  },
  {
    id: 'rz-010',
    name: 'Ridge Sector H',
    lat: 26.7, lng: 93.08,
    hazard: 'landslide',
    riskLevel: 'medium',
    riskScore: 45,
    population: 2100,
    area_km2: 2.0,
    factors: [
      { name: 'Slope Angle', value: '22°', weight: 0.3, contribution: 14 },
      { name: 'Elevation', value: '195 m', weight: 0.15, contribution: 8 },
      { name: 'Rainfall Intensity', value: '120 mm/24h', weight: 0.25, contribution: 14 },
      { name: 'Soil Type', value: 'Moderate', weight: 0.15, contribution: 5 },
      { name: 'Historical Landslides', value: '1 event/10yr', weight: 0.15, contribution: 4 },
    ],
  },
];

export const DEMO_SHELTERS: Shelter[] = [
  {
    id: 'sh-001',
    name: 'Central Public School',
    lat: 26.55, lng: 92.96,
    type: 'school',
    totalCapacity: 800,
    currentOccupancy: 120,
    spareCapacity: 680,
    water: 'yes', sanitation: 'yes', healthcare: 'no',
    roadAccessible: 'yes',
    hazardExposure: 'low',
    verification: 'verified',
  },
  {
    id: 'sh-002',
    name: 'District Community Hall',
    lat: 26.53, lng: 92.88,
    type: 'community_center',
    totalCapacity: 500,
    currentOccupancy: 50,
    spareCapacity: 450,
    water: 'yes', sanitation: 'yes', healthcare: 'yes',
    roadAccessible: 'yes',
    hazardExposure: 'low',
    verification: 'verified',
  },
  {
    id: 'sh-003',
    name: 'Eastside High School',
    lat: 26.54, lng: 93.02,
    type: 'school',
    totalCapacity: 600,
    currentOccupancy: null,
    spareCapacity: null,
    water: 'yes', sanitation: 'no', healthcare: 'no',
    roadAccessible: 'yes',
    hazardExposure: 'low',
    verification: 'estimated',
  },
  {
    id: 'sh-004',
    name: 'Riverside Primary School',
    lat: 26.67, lng: 92.82,
    type: 'school',
    totalCapacity: 300,
    currentOccupancy: 40,
    spareCapacity: 260,
    water: 'no', sanitation: 'no', healthcare: 'no',
    roadAccessible: 'no',
    hazardExposure: 'high',
    verification: 'estimated',
  },
  {
    id: 'sh-005',
    name: 'Regional Sports Stadium',
    lat: 26.52, lng: 92.95,
    type: 'stadium',
    totalCapacity: 2000,
    currentOccupancy: 100,
    spareCapacity: 1900,
    water: 'yes', sanitation: 'yes', healthcare: 'yes',
    roadAccessible: 'yes',
    hazardExposure: 'low',
    verification: 'verified',
  },
  {
    id: 'sh-006',
    name: 'Hilltop Community Center',
    lat: 26.69, lng: 93.0,
    type: 'community_center',
    totalCapacity: 400,
    currentOccupancy: null,
    spareCapacity: null,
    water: 'unknown', sanitation: 'unknown', healthcare: 'no',
    roadAccessible: 'unknown',
    hazardExposure: 'medium',
    verification: 'unverified',
  },
  {
    id: 'sh-007',
    name: 'South Municipal Building',
    lat: 26.49, lng: 92.85,
    type: 'other',
    totalCapacity: 350,
    currentOccupancy: 60,
    spareCapacity: 290,
    water: 'yes', sanitation: 'yes', healthcare: 'no',
    roadAccessible: 'yes',
    hazardExposure: 'medium',
    verification: 'estimated',
  },
];

export const DEMO_ROADS: RoadSegment[] = [
  {
    id: 'rd-001', name: 'Main Highway N-S',
    type: 'highway', verified: true,
    coords: [[26.75, 92.9], [26.65, 92.9], [26.55, 92.9], [26.45, 92.9]],
  },
  {
    id: 'rd-002', name: 'East-West Road 1',
    type: 'main', verified: true,
    coords: [[26.6, 92.7], [26.6, 92.85], [26.6, 93.0], [26.6, 93.12]],
  },
  {
    id: 'rd-003', name: 'Riverside Road',
    type: 'secondary', verified: false,
    coords: [[26.68, 92.78], [26.65, 92.82], [26.62, 92.85]],
  },
  {
    id: 'rd-004', name: 'South Connector',
    type: 'main', verified: true,
    coords: [[26.5, 92.8], [26.53, 92.88], [26.55, 92.95]],
  },
  {
    id: 'rd-005', name: 'Hill Access Road',
    type: 'secondary', verified: false,
    coords: [[26.65, 92.95], [26.69, 92.98], [26.72, 93.0]],
  },
];

export const DEMO_RIVERS: RiverSegment[] = [
  {
    id: 'rv-001', name: 'Brahmaputra Main Channel',
    coords: [
      [26.75, 92.72], [26.7, 92.76], [26.65, 92.8],
      [26.6, 92.83], [26.55, 92.86], [26.48, 92.88],
    ],
  },
  {
    id: 'rv-002', name: 'Tributary A',
    coords: [[26.68, 92.95], [26.6, 92.88], [26.55, 92.85]],
  },
];

export const DEFAULT_RISK_WEIGHTS: RiskWeights = {
  rainfall: 0.2,
  temperature: 0.15,
  elevation: 0.15,
  slope: 0.15,
  riverDistance: 0.2,
  historical: 0.25,
  population: 0.1,
  builtUp: 0.1,
};

export function generateAlerts(
  zones: RiskZone[],
  shelters: Shelter[],
  hazard: HazardType,
): Alert[] {
  const alerts: Alert[] = [];
  const now = new Date();
  const ts = now.toISOString();

  const highRiskZones = zones.filter(
    (z) => z.hazard === hazard && z.riskLevel === 'high',
  );
  highRiskZones.forEach((z) => {
    alerts.push({
      id: `alert-hr-${z.id}`,
      severity: 'critical',
      category: 'High-Risk Zone',
      message: `${z.name} — Potential high risk (${z.riskScore}/100). Population exposure: ${z.population.toLocaleString()}.`,
      timestamp: ts,
    });
  });

  const unverifiedShelters = shelters.filter((s) => s.verification === 'unverified');
  unverifiedShelters.forEach((s) => {
    alerts.push({
      id: `alert-uv-${s.id}`,
      severity: 'warning',
      category: 'Shelter Verification',
      message: `${s.name} is unverified. Capacity and accessibility data must be confirmed before use.`,
      timestamp: ts,
    });
  });

  const totalSpare = shelters.reduce((sum, s) => sum + (s.spareCapacity ?? 0), 0);
  const totalPop = highRiskZones.reduce((sum, z) => sum + z.population, 0);
  if (totalSpare < totalPop) {
    alerts.push({
      id: 'alert-capacity',
      severity: 'critical',
      category: 'Capacity Gap',
      message: `Estimated shelter capacity (${totalSpare.toLocaleString()}) is below high-risk population exposure (${totalPop.toLocaleString()}). Gap: ${(totalPop - totalSpare).toLocaleString()}.`,
      timestamp: ts,
    });
  }

  const highExposureShelters = shelters.filter((s) => s.hazardExposure === 'high');
  highExposureShelters.forEach((s) => {
    alerts.push({
      id: `alert-he-${s.id}`,
      severity: 'warning',
      category: 'Shelter Hazard Exposure',
      message: `${s.name} is in a potentially high-risk area. Consider deprioritizing for relocation.`,
      timestamp: ts,
    });
  });

  // This alert is only added by callers when in demo mode; skip here so uploaded
  // data doesn't show a "synthetic demo data" alert. Callers can add it separately.
  void ts;

  return alerts;
}

export const HAZARD_LABELS: Record<HazardType, string> = {
  flood: 'Flood',
  heat: 'Extreme Heat',
  landslide: 'Landslide',
  other: 'Other',
};

export const RISK_COLORS: Record<string, string> = {
  high: '#dc2626',
  medium: '#f59e0b',
  low: '#16a34a',
  insufficient: '#6b7280',
};

export const RISK_LABELS: Record<string, string> = {
  high: 'Potential High Risk',
  medium: 'Medium Risk',
  low: 'Lower Relative Risk',
  insufficient: 'Insufficient Data',
};
