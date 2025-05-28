import type { ReachBreakdown, ImpactDrivers, ConfidenceDrivers, EffortBreakdown } from './models';

/**
 * Calculate reach score for "optimise" mode (existing cohort uplift)
 * Formula: (eligibleToday + monthlyGrowth×12) × (adoptionTargetPct – adoptionNowPct) / 100
 * This shows "How many extra people will succeed because of the uplift across today's base and 12 months of new sign-ups?"
 */
export const calculateOptimiseReach = (r: ReachBreakdown): number => {
    const { eligibleToday = 0, monthlyGrowth = 0, adoptionRatePercentage = 0, currentAdoptionPercentage = 0 } = r;
    const totalEligible = eligibleToday + (monthlyGrowth * 12);
    const adoptionUplift = adoptionRatePercentage - currentAdoptionPercentage;
    return Math.round(totalEligible * (adoptionUplift / 100));
};

/**
 * Calculate reach score for "acquire" mode (new audience growth)
 * Formula: (Monthly new eligible × 12) × Adoption % of newcomers
 * This shows "How many of the fresh faces will we win next year?"
 * Monthly new eligible should reference the serviceable obtainable market (SOM), not TAM or SAM
 */
export const calculateAcquireReach = (r: ReachBreakdown): number => {
    const { monthlyNewEligible = 0, adoptionRatePercentage = 0 } = r;
    const annualNewEligible = monthlyNewEligible * 12;
    return Math.round(annualNewEligible * (adoptionRatePercentage / 100));
};

/**
 * Main reach calculation function that routes to the appropriate formula based on mode
 * This ensures every initiative reports net new humans helped, regardless of path
 */
export const reachScore = (r: ReachBreakdown): number => {
    if (r.mode === 'optimise') {
        return calculateOptimiseReach(r);
    } else if (r.mode === 'acquire') {
        return calculateAcquireReach(r);
    }

    // Fallback to 0 if mode is not recognized
    return 0;
};

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