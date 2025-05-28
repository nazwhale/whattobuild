import { describe, it, expect } from 'vitest';
import {
    reachScore,
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
    describe('reachScore', () => {
        it('calculates reach correctly with 12-month formula', () => {
            const reach: ReachBreakdown = {
                eligibleToday: 8000,
                monthlyGrowth: 500,
                adoptionRatePercentage: 25
            };

            // (8000 + 500 * 12) * 0.25 = (8000 + 6000) * 0.25 = 14000 * 0.25 = 3500
            expect(reachScore(reach)).toBe(3500);
        });

        it('handles zero adoption rate', () => {
            const reach: ReachBreakdown = {
                eligibleToday: 10000,
                monthlyGrowth: 500,
                adoptionRatePercentage: 0
            };

            expect(reachScore(reach)).toBe(0);
        });

        it('handles 100% adoption rate', () => {
            const reach: ReachBreakdown = {
                eligibleToday: 1000,
                monthlyGrowth: 200,
                adoptionRatePercentage: 100
            };

            // (1000 + 200 * 12) * 1.0 = (1000 + 2400) * 1.0 = 3400
            expect(reachScore(reach)).toBe(3400);
        });

        it('handles zero monthly growth', () => {
            const reach: ReachBreakdown = {
                eligibleToday: 1000,
                monthlyGrowth: 0,
                adoptionRatePercentage: 50
            };

            // (1000 + 0 * 12) * 0.5 = 1000 * 0.5 = 500
            expect(reachScore(reach)).toBe(500);
        });

        it('rounds decimal results to whole numbers', () => {
            const reach: ReachBreakdown = {
                eligibleToday: 1000,
                monthlyGrowth: 100,
                adoptionRatePercentage: 33.33
            };

            // (1000 + 100 * 12) * 0.3333 = (1000 + 1200) * 0.3333 = 2200 * 0.3333 = 732.926, should round to 733
            expect(reachScore(reach)).toBe(733);
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