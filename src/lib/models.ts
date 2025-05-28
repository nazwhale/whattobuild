export type EffortBreakdown = {
    frontend: number;
    backend: number;
    design: number;
    pm: number;
    context?: string;
};

export type ReachBreakdown = {
    eligibleToday: number;      // current audience
    monthlyGrowth: number;      // new users per month
    adoptionRatePercentage: number;   // 0‑100
    context?: string;
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