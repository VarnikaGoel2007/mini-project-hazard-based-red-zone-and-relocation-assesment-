import type { Shelter, HazardType, RiskWeights } from '@/types';

export function rankShelters(
  shelters: Shelter[],
  hazard: HazardType,
  displacedPopulation: number,
): Shelter[] {
  return shelters
    .map((s) => {
      let score = 100;

      // Hazard exposure penalty
      if (s.hazardExposure === 'high') score -= 40;
      else if (s.hazardExposure === 'medium') score -= 20;
      else if (s.hazardExposure === 'low') score -= 0;
      else score -= 25; // insufficient data

      // Capacity score
      if (s.spareCapacity !== null && s.spareCapacity > 0) {
        score += Math.min(20, (s.spareCapacity / Math.max(1, displacedPopulation)) * 20);
      } else if (s.spareCapacity === null) {
        score -= 10;
      } else {
        score -= 30;
      }

      // Amenities
      if (s.water === 'yes') score += 5;
      else if (s.water === 'no') score -= 5;
      if (s.sanitation === 'yes') score += 5;
      else if (s.sanitation === 'no') score -= 5;
      if (s.healthcare === 'yes') score += 8;
      else if (s.healthcare === 'no') score -= 2;

      // Road accessibility
      if (s.roadAccessible === 'yes') score += 10;
      else if (s.roadAccessible === 'no') score -= 15;
      else score -= 8;

      // Verification
      if (s.verification === 'verified') score += 8;
      else if (s.verification === 'estimated') score += 0;
      else score -= 10;

      score = Math.max(0, Math.min(100, score));

      return { ...s, rankScore: Math.round(score) };
    })
    .sort((a, b) => (b.rankScore ?? 0) - (a.rankScore ?? 0))
    .map((s, i) => ({ ...s, rank: i + 1 }));
}

export function calculateCapacityGap(
  shelters: Shelter[],
  displacedPopulation: number,
): { totalSpare: number; gap: number; hasReliableData: boolean } {
  const reliableShelters = shelters.filter(
    (s) => s.spareCapacity !== null,
  );
  const totalSpare = reliableShelters.reduce(
    (sum, s) => sum + (s.spareCapacity ?? 0),
    0,
  );
  const hasReliableData = reliableShelters.length > 0;
  return {
    totalSpare,
    gap: Math.max(0, displacedPopulation - totalSpare),
    hasReliableData,
  };
}

export function getDefaultWeightsForHazard(hazard: HazardType): RiskWeights {
  switch (hazard) {
    case 'flood':
      return {
        rainfall: 0.25,
        temperature: 0.05,
        elevation: 0.15,
        slope: 0.05,
        riverDistance: 0.25,
        historical: 0.2,
        population: 0.05,
        builtUp: 0.0,
      };
    case 'heat':
      return {
        rainfall: 0.05,
        temperature: 0.3,
        elevation: 0.05,
        slope: 0.0,
        riverDistance: 0.0,
        historical: 0.2,
        population: 0.15,
        builtUp: 0.25,
      };
    case 'landslide':
      return {
        rainfall: 0.2,
        temperature: 0.0,
        elevation: 0.15,
        slope: 0.3,
        riverDistance: 0.0,
        historical: 0.2,
        population: 0.05,
        builtUp: 0.1,
      };
    default:
      return {
        rainfall: 0.15,
        temperature: 0.1,
        elevation: 0.15,
        slope: 0.1,
        riverDistance: 0.15,
        historical: 0.2,
        population: 0.1,
        builtUp: 0.05,
      };
  }
}

export function classifyRisk(score: number): 'high' | 'medium' | 'low' {
  if (score >= 65) return 'high';
  if (score >= 40) return 'medium';
  return 'low';
}
