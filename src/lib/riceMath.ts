import type { ReachBreakdown, ImpactDrivers, ConfidenceDrivers, EffortBreakdown } from './models';

export const reachScore = (r: ReachBreakdown): number =>
    Math.round((r.eligibleToday + r.monthlyGrowth * 12) * (r.adoptionRatePercentage / 100));

export const impactScore = (d: ImpactDrivers): number => {
    const weighted = d.userValue * 0.4 + d.businessValue * 0.4 + d.strategicFit * 0.2;
    return (weighted / 5) * 3; // map 1‑5 ⇒ 0.6‑3
};

export const confidenceScore = (c: ConfidenceDrivers): number =>
    (c.dataQuality + c.precedentSimilarity + c.deliveryConfidence) / 3;

export const effortHours = (e: EffortBreakdown): number =>
    e.frontend + e.backend + e.design + e.pm;

export const riceScore = (reach: number, impact: number, confidence: number, effortHrs: number): number =>
    (reach * impact * (confidence / 100)) / (effortHrs / 40); // denom in person‑weeks 