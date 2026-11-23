export type HazardType = 'flood' | 'heat' | 'landslide' | 'other';

export type RiskLevel = 'high' | 'medium' | 'low' | 'insufficient';

export type VerificationStatus = 'verified' | 'estimated' | 'unverified';

export interface RiskZone {
  id: string;
  name: string;
  lat: number;
  lng: number;
  hazard: HazardType;
  riskLevel: RiskLevel;
  riskScore: number;
  population: number;
  factors: RiskFactor[];
  area_km2: number;
}

export interface RiskFactor {
  name: string;
  value: string;
  weight: number;
  contribution: number;
}

export interface Shelter {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: 'school' | 'hospital' | 'community_center' | 'stadium' | 'other';
  totalCapacity: number | null;
  currentOccupancy: number | null;
  spareCapacity: number | null;
  water: 'yes' | 'no' | 'unknown';
  sanitation: 'yes' | 'no' | 'unknown';
  healthcare: 'yes' | 'no' | 'unknown';
  roadAccessible: 'yes' | 'no' | 'unknown';
  hazardExposure: RiskLevel;
  verification: VerificationStatus;
  rank?: number;
  rankScore?: number;
}

export interface RoadSegment {
  id: string;
  name: string;
  coords: [number, number][];
  type: 'highway' | 'main' | 'secondary';
  verified: boolean;
}

export interface RiverSegment {
  id: string;
  name: string;
  coords: [number, number][];
}

export interface StudyArea {
  id: string;
  name: string;
  center: [number, number];
  zoom: number;
  boundary: [number, number][];
}

export interface Alert {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  category: string;
  message: string;
  timestamp: string;
}

export interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  status: 'valid' | 'warning' | 'error';
  message: string;
  rowCount?: number;
  data?: any[];
}

export interface RiskWeights {
  rainfall: number;
  temperature: number;
  elevation: number;
  slope: number;
  riverDistance: number;
  historical: number;
  population: number;
  builtUp: number;
}

export interface DataQuality {
  rainfall: boolean;
  temperature: boolean;
  elevation: boolean;
  population: boolean;
  historical: boolean;
  shelters: boolean;
  roads: boolean;
  rivers: boolean;
}

export type PageId =
  | 'overview'
  | 'risk-map'
  | 'data-upload'
  | 'hazard-assessment'
  | 'shelter-capacity'
  | 'safe-location'
  | 'reports';
