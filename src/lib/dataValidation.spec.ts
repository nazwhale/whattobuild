import { describe, it, expect } from 'vitest';
import { isValidEntry, validateImportData } from './dataValidation';
import type { RiceEntry } from './models';

describe('dataValidation', () => {
    describe('isValidEntry', () => {
        it('validates new format entries correctly', () => {
            const validEntry = {
                id: '123',
                title: 'Test Entry',
                reach: {
                    mode: 'optimise',
                    eligibleToday: 1000,
                    currentAdoptionPercentage: 10,
                    adoptionRatePercentage: 30,
                    context: 'Test context'
                },
                impactDrivers: { userValue: 3, businessValue: 3, strategicFit: 3 },
                confidenceDrivers: { dataQuality: 50, precedentSimilarity: 50, deliveryConfidence: 50 },
                effort: { frontend: 40, backend: 40, design: 20, pm: 10 }
            };

            expect(isValidEntry(validEntry)).toBe(true);
        });

        it('converts old format entries to new format', () => {
            const oldEntry: any = {
                id: '123',
                title: 'Old Format Entry',
                reach: {
                    eligibleToday: 5000,
                    monthlyGrowth: 500,
                    adoptionRatePercentage: 25,
                    context: 'Old format'
                },
                impactDrivers: { userValue: 3, businessValue: 3, strategicFit: 3 },
                confidenceDrivers: { dataQuality: 50, precedentSimilarity: 50, deliveryConfidence: 50 },
                effort: { frontend: 40, backend: 40, design: 20, pm: 10 }
            };

            expect(isValidEntry(oldEntry)).toBe(true);

            // Check that it was converted to acquire mode
            expect(oldEntry.reach.mode).toBe('acquire');
            expect(oldEntry.reach.monthlyNewEligible).toBe(500);
            expect(oldEntry.reach.adoptionRatePercentage).toBe(25);
        });

        it('handles missing mode by defaulting to optimise', () => {
            const entryWithoutMode: any = {
                id: '123',
                title: 'No Mode Entry',
                reach: {
                    adoptionRatePercentage: 25
                },
                impactDrivers: { userValue: 3, businessValue: 3, strategicFit: 3 },
                confidenceDrivers: { dataQuality: 50, precedentSimilarity: 50, deliveryConfidence: 50 },
                effort: { frontend: 40, backend: 40, design: 20, pm: 10 }
            };

            expect(isValidEntry(entryWithoutMode)).toBe(true);
            expect(entryWithoutMode.reach.mode).toBe('optimise');
        });

        it('rejects entries with missing required fields', () => {
            const invalidEntry = {
                id: '123',
                title: 'Invalid Entry'
                // Missing reach, impact, confidence, effort
            };

            expect(isValidEntry(invalidEntry)).toBe(false);
        });
    });

    describe('validateImportData', () => {
        it('validates and converts mixed old and new format entries', () => {
            const importData = {
                entries: [
                    {
                        id: '1',
                        title: 'New Format',
                        reach: { mode: 'optimise', eligibleToday: 1000, currentAdoptionPercentage: 10, adoptionRatePercentage: 30 },
                        impactDrivers: { userValue: 3, businessValue: 3, strategicFit: 3 },
                        confidenceDrivers: { dataQuality: 50, precedentSimilarity: 50, deliveryConfidence: 50 },
                        effort: { frontend: 40, backend: 40, design: 20, pm: 10 }
                    },
                    {
                        id: '2',
                        title: 'Old Format',
                        reach: { eligibleToday: 5000, monthlyGrowth: 500, adoptionRatePercentage: 25 },
                        impactDrivers: { userValue: 3, businessValue: 3, strategicFit: 3 },
                        confidenceDrivers: { dataQuality: 50, precedentSimilarity: 50, deliveryConfidence: 50 },
                        effort: { frontend: 40, backend: 40, design: 20, pm: 10 }
                    }
                ],
                exportDate: '2024-01-15T10:00:00.000Z',
                version: '1.0'
            };

            const result = validateImportData(importData);

            expect(result.entries).toHaveLength(2);
            expect(result.entries[0].reach.mode).toBe('optimise');
            expect(result.entries[1].reach.mode).toBe('acquire');
            expect((result.entries[1].reach as any).monthlyNewEligible).toBe(500);
        });

        it('throws error for invalid data format', () => {
            const invalidData = { notEntries: [] };

            expect(() => validateImportData(invalidData)).toThrow('Invalid data format');
        });

        it('throws error when no valid entries found', () => {
            const dataWithInvalidEntries = {
                entries: [
                    { invalid: 'entry' },
                    { also: 'invalid' }
                ]
            };

            expect(() => validateImportData(dataWithInvalidEntries)).toThrow('No valid entries found');
        });
    });
}); 