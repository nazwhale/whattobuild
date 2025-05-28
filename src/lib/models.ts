export type EffortBreakdown = {
    frontend: number;
    backend: number;
    design: number;
    pm: number;
    context?: string;
};

// Type for reach calculation mode - determines which formula to use
export type ReachMode = 'optimise' | 'acquire';

export type ReachBreakdown = {
    // Mode selection - determines which calculation to use
    mode: ReachMode;

    // Common fields used in both modes
    adoptionRatePercentage: number;   // 0‑100 (Target Adoption % for optimise mode, Adoption % for acquire mode)
    context?: string;

    // Fields for "optimise" mode (existing cohort uplift)
    // Formula: (eligibleToday + monthlyGrowth×12) × (adoptionTargetPct – adoptionNowPct) / 100
    eligibleToday?: number;           // Current Eligible Users
    currentAdoptionPercentage?: number; // Current Adoption %
    monthlyGrowth?: number;           // Monthly New Eligible Users

    // Fields for "acquire" mode (new audience growth)  
    // Formula: (Monthly new eligible × 12) × Adoption % of newcomers
    monthlyNewEligible?: number;      // monthly new users in serviceable obtainable market (SOM)
};

export type ImpactDrivers = {
    userValue: number;         // 1‑5
    businessValue: number;     // 1‑5
    strategicFit: number;      // 1‑5
    context?: string;
};

export type ConfidenceDrivers = {
    dataQuality: number;       // 0‑100
    precedentSimilarity: number; // 0‑100
    deliveryConfidence: number;      // 0‑100
    context?: string;
};

export type RiceEntry = {
    id: string;                // uuid
    title: string;
    reach: ReachBreakdown;
    impactDrivers: ImpactDrivers;
    confidenceDrivers: ConfidenceDrivers;
    effort: EffortBreakdown;
    createdAt: string;
    updatedAt: string;
}; 