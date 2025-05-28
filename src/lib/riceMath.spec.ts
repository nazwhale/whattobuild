import { describe, it, expect } from 'vitest';
import {
    reachScore,
    calculateOptimiseReach,
    calculateAcquireReach,
    impactScore,
    confidenceScore,
    effortHours,
    riceScore
} from './riceMath';
import type {
    ReachBreakdown,
    ImpactDrivers,
    ConfidenceDrivers,
    EffortBreakdown
} from './models';

describe('riceMath', () => {
    describe('calculateOptimiseReach', () => {
        it('calculates optimise reach correctly with new formula including monthly growth', () => {
            const reach: ReachBreakdown = {
                mode: 'optimise',
                eligibleToday: 600,
                monthlyGrowth: 100,
                currentAdoptionPercentage: 17,
                adoptionRatePercentage: 43,
                context: ''
            };

            // (600 + 100×12) × (43% - 17%) / 100 = (600 + 1200) × 26% = 1800 × 0.26 = 468
            expect(calculateOptimiseReach(reach)).toBe(468);
        });

        it('calculates optimise reach correctly with uplift formula (legacy test with monthlyGrowth = 0)', () => {
            const reach: ReachBreakdown = {
                mode: 'optimise',
                eligibleToday: 10000,
                monthlyGrowth: 0,
                currentAdoptionPercentage: 15,
                adoptionRatePercentage: 40,
                context: ''
            };

            // (10000 + 0×12) × (40% - 15%) / 100 = 10000 × 25% = 2500
            expect(calculateOptimiseReach(reach)).toBe(2500);
        });

        it('handles zero uplift (target equals current)', () => {
            const reach: ReachBreakdown = {
                mode: 'optimise',
                eligibleToday: 5000,
                monthlyGrowth: 200,
                currentAdoptionPercentage: 30,
                adoptionRatePercentage: 30,
                context: ''
            };

            expect(calculateOptimiseReach(reach)).toBe(0);
        });

        it('handles negative uplift (target less than current)', () => {
            const reach: ReachBreakdown = {
                mode: 'optimise',
                eligibleToday: 5000,
                monthlyGrowth: 100,
                currentAdoptionPercentage: 50,
                adoptionRatePercentage: 30,
                context: ''
            };

            // (5000 + 100×12) × (30% - 50%) / 100 = (5000 + 1200) × -20% = 6200 × -0.20 = -1240
            expect(calculateOptimiseReach(reach)).toBe(-1240);
        });

        it('handles missing values with defaults', () => {
            const reach: ReachBreakdown = {
                mode: 'optimise',
                adoptionRatePercentage: 25,
                context: ''
            };

            // Uses default values: 0 eligible, 0 monthly growth, 0 current adoption
            expect(calculateOptimiseReach(reach)).toBe(0);
        });
    });

    describe('calculateAcquireReach', () => {
        it('calculates acquire reach correctly with 12-month formula', () => {
            const reach: ReachBreakdown = {
                mode: 'acquire',
                monthlyNewEligible: 500,
                adoptionRatePercentage: 30,
                context: ''
            };

            // (500 * 12) * 30% = 6000 * 0.30 = 1800
            expect(calculateAcquireReach(reach)).toBe(1800);
        });

        it('handles zero monthly new eligible', () => {
            const reach: ReachBreakdown = {
                mode: 'acquire',
                monthlyNewEligible: 0,
                adoptionRatePercentage: 50,
                context: ''
            };

            expect(calculateAcquireReach(reach)).toBe(0);
        });

        it('handles zero adoption rate', () => {
            const reach: ReachBreakdown = {
                mode: 'acquire',
                monthlyNewEligible: 1000,
                adoptionRatePercentage: 0,
                context: ''
            };

            expect(calculateAcquireReach(reach)).toBe(0);
        });

        it('handles missing values with defaults', () => {
            const reach: ReachBreakdown = {
                mode: 'acquire',
                adoptionRatePercentage: 25,
                context: ''
            };

            // Uses default values: 0 monthly new eligible
            expect(calculateAcquireReach(reach)).toBe(0);
        });

        it('rounds decimal results to whole numbers', () => {
            const reach: ReachBreakdown = {
                mode: 'acquire',
                monthlyNewEligible: 333,
                adoptionRatePercentage: 33.33,
                context: ''
            };

            // (333 * 12) * 0.3333 = 3996 * 0.3333 = 1331.8668, should round to 1332
            expect(calculateAcquireReach(reach)).toBe(1332);
        });
    });

    describe('reachScore', () => {
        it('routes to optimise calculation for optimise mode', () => {
            const reach: ReachBreakdown = {
                mode: 'optimise',
                eligibleToday: 8000,
                monthlyGrowth: 0,
                currentAdoptionPercentage: 20,
                adoptionRatePercentage: 45,
                context: ''
            };

            // Should use optimise formula: (8000 + 0×12) × (45% - 20%) = 8000 × 25% = 2000
            expect(reachScore(reach)).toBe(2000);
        });

        it('routes to acquire calculation for acquire mode', () => {
            const reach: ReachBreakdown = {
                mode: 'acquire',
                monthlyNewEligible: 400,
                adoptionRatePercentage: 25,
                context: ''
            };

            // Should use acquire formula: (400 * 12) * 25% = 4800 * 0.25 = 1200
            expect(reachScore(reach)).toBe(1200);
        });

        it('returns 0 for unrecognized mode', () => {
            const reach: ReachBreakdown = {
                mode: 'unknown' as any,
                adoptionRatePercentage: 25,
                context: ''
            };

            expect(reachScore(reach)).toBe(0);
        });

        it('handles complex optimise scenario', () => {
            const reach: ReachBreakdown = {
                mode: 'optimise',
                eligibleToday: 15000,
                monthlyGrowth: 0,
                currentAdoptionPercentage: 12,
                adoptionRatePercentage: 35,
                context: 'Improving onboarding flow'
            };

            // (15000 + 0×12) × (35% - 12%) = 15000 × 23% = 3450
            expect(reachScore(reach)).toBe(3450);
        });

        it('handles complex acquire scenario', () => {
            const reach: ReachBreakdown = {
                mode: 'acquire',
                monthlyNewEligible: 800,
                adoptionRatePercentage: 18,
                context: 'New marketing channel launch'
            };

            // (800 * 12) * 18% = 9600 * 0.18 = 1728
            expect(reachScore(reach)).toBe(1728);
        });

        it('handles optimise scenario with monthly growth', () => {
            const reach: ReachBreakdown = {
                mode: 'optimise',
                eligibleToday: 600,
                monthlyGrowth: 100,
                currentAdoptionPercentage: 17,
                adoptionRatePercentage: 43,
                context: 'Uplift across existing and new users'
            };

            // (600 + 100×12) × (43% - 17%) = (600 + 1200) × 26% = 1800 × 0.26 = 468
            expect(reachScore(reach)).toBe(468);
        });
    });

    describe('impactScore', () => {
        it('calculates weighted impact correctly', () => {
            const impact: ImpactDrivers = {
                userValue: 5,
                businessValue: 4,
                strategicFit: 3
            };

            // (5 * 0.4 + 4 * 0.4 + 3 * 0.2) / 5 * 3 = (2 + 1.6 + 0.6) / 5 * 3 = 4.2 / 5 * 3 = 2.52
            expect(impactScore(impact)).toBeCloseTo(2.52, 2);
        });

        it('handles minimum values', () => {
            const impact: ImpactDrivers = {
                userValue: 1,
                businessValue: 1,
                strategicFit: 1
            };

            // (1 * 0.4 + 1 * 0.4 + 1 * 0.2) / 5 * 3 = 1 / 5 * 3 = 0.6
            expect(impactScore(impact)).toBeCloseTo(0.6, 2);
        });

        it('handles maximum values', () => {
            const impact: ImpactDrivers = {
                userValue: 5,
                businessValue: 5,
                strategicFit: 5
            };

            // (5 * 0.4 + 5 * 0.4 + 5 * 0.2) / 5 * 3 = 5 / 5 * 3 = 3
            expect(impactScore(impact)).toBe(3);
        });
    });

    describe('confidenceScore', () => {
        it('calculates average confidence correctly', () => {
            const confidence: ConfidenceDrivers = {
                dataQuality: 80,
                precedentSimilarity: 70,
                deliveryConfidence: 60
            };

            expect(confidenceScore(confidence)).toBeCloseTo(70, 2);
        });

        it('handles zero confidence', () => {
            const confidence: ConfidenceDrivers = {
                dataQuality: 0,
                precedentSimilarity: 0,
                deliveryConfidence: 0
            };

            expect(confidenceScore(confidence)).toBe(0);
        });

        it('handles maximum confidence', () => {
            const confidence: ConfidenceDrivers = {
                dataQuality: 100,
                precedentSimilarity: 100,
                deliveryConfidence: 100
            };

            expect(confidenceScore(confidence)).toBe(100);
        });
    });

    describe('effortHours', () => {
        it('sums all effort components', () => {
            const effort: EffortBreakdown = {
                frontend: 40,
                backend: 80,
                design: 20,
                pm: 10
            };

            expect(effortHours(effort)).toBe(150);
        });

        it('handles zero effort', () => {
            const effort: EffortBreakdown = {
                frontend: 0,
                backend: 0,
                design: 0,
                pm: 0
            };

            expect(effortHours(effort)).toBe(0);
        });
    });

    describe('riceScore', () => {
        it('calculates RICE score correctly', () => {
            const reach = 2500;
            const impact = 2.5;
            const confidence = 75;
            const effortHrs = 160; // 4 person-weeks

            // (2500 * 2.5 * 0.75) / 4 = 4687.5 / 4 = 1171.875
            expect(riceScore(reach, impact, confidence, effortHrs)).toBeCloseTo(1171.875, 2);
        });

        it('handles zero effort gracefully', () => {
            const reach = 1000;
            const impact = 3;
            const confidence = 80;
            const effortHrs = 0;

            expect(riceScore(reach, impact, confidence, effortHrs)).toBe(Infinity);
        });

        it('handles zero reach', () => {
            const reach = 0;
            const impact = 3;
            const confidence = 80;
            const effortHrs = 40;

            expect(riceScore(reach, impact, confidence, effortHrs)).toBe(0);
        });

        it('converts effort hours to person-weeks correctly', () => {
            const reach = 1000;
            const impact = 2;
            const confidence = 50;
            const effortHrs = 80; // 2 person-weeks

            // (1000 * 2 * 0.5) / 2 = 1000 / 2 = 500
            expect(riceScore(reach, impact, confidence, effortHrs)).toBe(500);
        });
    });
}); 