import type {
  RiskZone,
  Shelter,
  RoadSegment,
  RiverSegment,
  StudyArea,
  HazardType,
  RiskLevel,
  RiskFactor,
  DataQuality,
} from '@/types';
import { classifyRisk, getDefaultWeightsForHazard } from '@/utils/riskUtils';

interface IngestedData {
  riskZones: RiskZone[];
  shelters: Shelter[];
  roads: RoadSegment[];
  rivers: RiverSegment[];
  studyArea: StudyArea | null;
  dataQuality: Partial<DataQuality>;
}

function num(val: any): number | null {
  if (val === null || val === undefined || val === '') return null;
  const n = Number(val);
  return isNaN(n) ? null : n;
}

function toYesNoUnknown(val: any): 'yes' | 'no' | 'unknown' {
  const s = String(val ?? '').toLowerCase().trim();
  if (s === 'yes' || s === 'true' || s === '1' || s === 'y') return 'yes';
  if (s === 'no' || s === 'false' || s === '0' || s === 'n') return 'no';
  return 'unknown';
}

function toVerification(val: any): 'verified' | 'estimated' | 'unverified' {
  const s = String(val ?? '').toLowerCase().trim();
  if (s === 'verified') return 'verified';
  if (s === 'estimated') return 'estimated';
  return 'unverified';
}

function toShelterType(val: any): Shelter['type'] {
  const s = String(val ?? '').toLowerCase().trim();
  if (s === 'school') return 'school';
  if (s === 'hospital') return 'hospital';
  if (s === 'community_center' || s === 'community center') return 'community_center';
  if (s === 'stadium') return 'stadium';
  return 'other';
}

function toHazardType(val: any): HazardType {
  const s = String(val ?? '').toLowerCase().trim();
  if (s === 'flood') return 'flood';
  if (s === 'heat' || s === 'extreme heat') return 'heat';
  if (s === 'landslide') return 'landslide';
  return 'other';
}

function toRoadType(val: any): RoadSegment['type'] {
  const s = String(val ?? '').toLowerCase().trim();
  if (s === 'highway') return 'highway';
  if (s === 'main') return 'main';
  return 'secondary';
}

// Compute risk score from rainfall, historical events, population, and proximity to rivers
function computeRiskScore(
  rainfall: number | null,
  historicalEvents: number,
  population: number | null,
  distanceToRiver: number | null,
  hazard: HazardType,
): { score: number; level: RiskLevel; factors: RiskFactor[] } {
  const weights = getDefaultWeightsForHazard(hazard);
  const factors: RiskFactor[] = [];
  let score = 0;
  let hasData = false;

  // Rainfall factor (normalized: 800mm = low, 2500mm = high)
  if (rainfall !== null) {
    hasData = true;
    const norm = Math.min(1, Math.max(0, (rainfall - 800) / 1700));
    const contribution = Math.round(norm * weights.rainfall * 100);
    factors.push({ name: 'Annual Rainfall', value: `${rainfall} mm`, weight: weights.rainfall, contribution });
    score += contribution;
  }

  // Historical events factor (normalized: 0 events = low, 5+ = high)
  if (historicalEvents >= 0) {
    hasData = true;
    const norm = Math.min(1, historicalEvents / 5);
    const contribution = Math.round(norm * weights.historical * 100);
    factors.push({ name: 'Historical Events', value: `${historicalEvents} events`, weight: weights.historical, contribution });
    score += contribution;
  }

  // Population density factor (normalized: 500/km² = low, 5000/km² = high)
  if (population !== null) {
    hasData = true;
    const norm = Math.min(1, Math.max(0, (population - 500) / 4500));
    const contribution = Math.round(norm * weights.population * 100);
    factors.push({ name: 'Population', value: population.toLocaleString(), weight: weights.population, contribution });
    score += contribution;
  }

  // River distance factor for floods (closer = higher risk)
  if (distanceToRiver !== null && hazard === 'flood') {
    hasData = true;
    const norm = Math.min(1, Math.max(0, 1 - distanceToRiver / 6));
    const contribution = Math.round(norm * weights.riverDistance * 100);
    factors.push({ name: 'Distance to River', value: `${distanceToRiver.toFixed(1)} km`, weight: weights.riverDistance, contribution });
    score += contribution;
  }

  if (!hasData) {
    return { score: 0, level: 'insufficient', factors: [] };
  }

  score = Math.min(100, Math.round(score));
  const level = classifyRisk(score) as RiskLevel;
  return { score, level, factors };
}

// Count historical events per zone by matching coordinates (within ~2km)
function countHistoricalEvents(
  lat: number,
  lng: number,
  historicalData: any[],
): number {
  return historicalData.filter((ev) => {
    const evLat = num(ev.latitude);
    const evLng = num(ev.longitude);
    if (evLat === null || evLng === null) return false;
    const dist = haversine(lat, lng, evLat, evLng);
    return dist < 2.0;
  }).length;
}

// Find nearest river distance for a point
function nearestRiverDistance(
  lat: number,
  lng: number,
  rivers: RiverSegment[],
): number | null {
  if (rivers.length === 0) return null;
  let minDist = Infinity;
  for (const river of rivers) {
    for (const [rLat, rLng] of river.coords) {
      const d = haversine(lat, lng, rLat, rLng);
      if (d < minDist) minDist = d;
    }
  }
  return minDist === Infinity ? null : minDist;
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

export function ingestUploadedData(
  category: string,
  rows: any[],
  current: {
    riskZones: RiskZone[];
    shelters: Shelter[];
    roads: RoadSegment[];
    rivers: RiverSegment[];
    studyArea: StudyArea;
    hazard: HazardType;
    // accumulated uploaded data from previous ingestions
    rainfallData?: any[];
    populationData?: any[];
    historicalData?: any[];
    shelterData?: any[];
    roadData?: any[];
    riverData?: any[];
    studyAreaData?: any;
  },
): IngestedData {
  const {
    riskZones: prevZones,
    shelters: prevShelters,
    roads: prevRoads,
    rivers: prevRivers,
    studyArea: prevStudyArea,
    hazard,
  } = current;

  const rainfallData = category === 'rainfall' ? rows : (current.rainfallData ?? []);
  const populationData = category === 'population' ? rows : (current.populationData ?? []);
  const historicalData = category === 'historical' ? rows : (current.historicalData ?? []);
  const shelterData = category === 'shelters' ? rows : (current.shelterData ?? []);
  const roadData = category === 'roads_geojson' ? rows : (current.roadData ?? []);
  const riverData = category === 'rivers_geojson' ? rows : (current.riverData ?? []);
  const studyAreaData = category === 'study_area_geojson' ? rows : (current.studyAreaData ?? null);

  // Build rivers from GeoJSON features
  const rivers: RiverSegment[] = [...prevRivers];
  if (riverData && riverData.length > 0) {
    const newRivers: RiverSegment[] = riverData.map((feat: any, i: number) => {
      const coords = extractLineCoords(feat);
      return {
        id: feat.properties?.id ?? `river-up-${i}`,
        name: feat.properties?.name ?? `Uploaded River ${i + 1}`,
        coords,
      };
    }).filter((r) => r.coords.length > 0);
    if (newRivers.length > 0) {
      rivers.splice(0, rivers.length, ...newRivers);
    }
  }

  // Build roads from GeoJSON features
  const roads: RoadSegment[] = [...prevRoads];
  if (roadData && roadData.length > 0) {
    const newRoads: RoadSegment[] = roadData.map((feat: any, i: number) => {
      const coords = extractLineCoords(feat);
      return {
        id: feat.properties?.id ?? `road-up-${i}`,
        name: feat.properties?.name ?? `Uploaded Road ${i + 1}`,
        type: toRoadType(feat.properties?.type),
        verified: feat.properties?.verified === true || feat.properties?.verified === 'true',
        coords,
      };
    }).filter((r) => r.coords.length > 0);
    if (newRoads.length > 0) {
      roads.splice(0, roads.length, ...newRoads);
    }
  }

  // Build study area from GeoJSON
  let studyArea: StudyArea = prevStudyArea;
  if (studyAreaData && studyAreaData.length > 0) {
    const feat = studyAreaData[0];
    const boundary = extractPolygonCoords(feat);
    if (boundary.length >= 3) {
      const lats = boundary.map(([lat]) => lat);
      const lngs = boundary.map(([, lng]) => lng);
      const center: [number, number] = [
        (Math.max(...lats) + Math.min(...lats)) / 2,
        (Math.max(...lngs) + Math.min(...lngs)) / 2,
      ];
      studyArea = {
        id: 'uploaded-study-area',
        name: feat.properties?.name ?? 'Uploaded Study Area',
        center,
        zoom: 10,
        boundary,
      };
    }
  }

  // Build shelters from CSV
  let shelters: Shelter[] = prevShelters;
  if (shelterData && shelterData.length > 0) {
    shelters = shelterData.map((row: any) => {
      const lat = num(row.latitude);
      const lng = num(row.longitude);
      const totalCap = num(row.total_capacity);
      const occupancy = num(row.current_occupancy);
      const spare = totalCap !== null && occupancy !== null ? totalCap - occupancy : totalCap !== null ? null : null;

      // Determine hazard exposure from nearest river or computed zone risk
      const riverDist = nearestRiverDistance(lat ?? 0, lng ?? 0, rivers);
      let hazardExposure: RiskLevel = 'low';
      if (hazard === 'flood' && riverDist !== null && riverDist < 1.0) {
        hazardExposure = 'high';
      } else if (hazard === 'flood' && riverDist !== null && riverDist < 2.5) {
        hazardExposure = 'medium';
      }

      return {
        id: String(row.shelter_id ?? `sh-up-${Math.random().toString(36).slice(2, 6)}`),
        name: String(row.name ?? 'Unnamed Shelter'),
        lat: lat ?? 0,
        lng: lng ?? 0,
        type: toShelterType(row.type),
        totalCapacity: totalCap,
        currentOccupancy: occupancy,
        spareCapacity: spare,
        water: toYesNoUnknown(row.water),
        sanitation: toYesNoUnknown(row.sanitation),
        healthcare: toYesNoUnknown(row.healthcare),
        roadAccessible: toYesNoUnknown(row.road_accessible),
        hazardExposure,
        verification: toVerification(row.verification),
      };
    });
  }

  // Build risk zones from population + rainfall + historical data
  let riskZones: RiskZone[] = prevZones;
  if (populationData && populationData.length > 0) {
    riskZones = populationData.map((row: any) => {
      const lat = num(row.latitude) ?? 0;
      const lng = num(row.longitude) ?? 0;
      const population = num(row.population) ?? 0;
      const area = num(row.area_km2) ?? 0;

      // Find nearest rainfall station
      let nearestRainfall: number | null = null;
      if (rainfallData.length > 0) {
        let minDist = Infinity;
        for (const st of rainfallData) {
          const stLat = num(st.latitude);
          const stLng = num(st.longitude);
          if (stLat === null || stLng === null) continue;
          const d = haversine(lat, lng, stLat, stLng);
          if (d < minDist) {
            minDist = d;
            nearestRainfall = num(st.annual_rainfall_mm);
          }
        }
      }

      const histCount = countHistoricalEvents(lat, lng, historicalData);
      const riverDist = nearestRiverDistance(lat, lng, rivers);

      const { score, level, factors } = computeRiskScore(
        nearestRainfall,
        histCount,
        area > 0 ? population / area : population,
        riverDist,
        hazard,
      );

      return {
        id: String(row.zone_id ?? `rz-up-${Math.random().toString(36).slice(2, 6)}`),
        name: String(row.zone_name ?? 'Uploaded Zone'),
        lat,
        lng,
        hazard,
        riskLevel: level,
        riskScore: score,
        population,
        area_km2: area,
        factors,
      };
    });
  }

  // Update data quality flags
  const dataQuality: Partial<DataQuality> = {
    rainfall: rainfallData.length > 0,
    population: populationData.length > 0,
    historical: historicalData.length > 0,
    shelters: shelters !== prevShelters,
    roads: roads !== prevRoads,
    rivers: rivers !== prevRivers,
  };

  return { riskZones, shelters, roads, rivers, studyArea, dataQuality };
}

function extractLineCoords(feat: any): [number, number][] {
  const geom = feat.geometry ?? feat;
  if (!geom) return [];
  if (geom.type === 'LineString' && Array.isArray(geom.coordinates)) {
    return geom.coordinates.map(([lng, lat]: [number, number]) => [lat, lng] as [number, number]);
  }
  if (geom.type === 'MultiLineString' && Array.isArray(geom.coordinates)) {
    return geom.coordinates.flat().map(([lng, lat]: [number, number]) => [lat, lng] as [number, number]);
  }
  return [];
}

function extractPolygonCoords(feat: any): [number, number][] {
  const geom = feat.geometry ?? feat;
  if (!geom) return [];
  if (geom.type === 'Polygon' && Array.isArray(geom.coordinates)) {
    const ring = geom.coordinates[0];
    if (ring) return ring.map(([lng, lat]: [number, number]) => [lat, lng] as [number, number]);
  }
  return [];
}
