import type { RiceEntry } from './models';

export interface ExportData {
    entries: RiceEntry[];
    exportDate: string;
    version: string;
}

// Helper function to convert old reach format to new format
const convertOldReachFormat = (oldReach: any): any => {
    // Check if this is the old format (has eligibleToday and monthlyGrowth but no mode)
    if (oldReach.eligibleToday !== undefined &&
        oldReach.monthlyGrowth !== undefined &&
        !oldReach.mode) {

        // Convert old format to new "acquire" mode format
        // Old formula: (eligibleToday + monthlyGrowth * 12) * adoptionRate
        // New acquire formula: (monthlyNewEligible * 12) * adoptionRate
        // We'll treat the old monthlyGrowth as monthlyNewEligible
        return {
            mode: 'acquire',
            monthlyNewEligible: oldReach.monthlyGrowth || 0,
            adoptionRatePercentage: oldReach.adoptionRatePercentage || 0,
            context: oldReach.context || 'Converted from legacy format'
        };
    }

    // If it already has the new format or is unrecognizable, return as-is
    return oldReach;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isValidEntry = (entry: any): entry is RiceEntry => {
    if (!entry ||
        typeof entry.id !== 'string' ||
        typeof entry.title !== 'string' ||
        !entry.reach ||
        !entry.impactDrivers ||
        !entry.confidenceDrivers ||
        !entry.effort) {
        return false;
    }

    // Convert old reach format if needed
    entry.reach = convertOldReachFormat(entry.reach);

    // Validate reach has required fields for new format
    if (!entry.reach.mode ||
        (entry.reach.mode !== 'optimise' && entry.reach.mode !== 'acquire')) {
        // If no valid mode, default to optimise
        entry.reach.mode = 'optimise';
    }

    // Ensure adoption rate is present
    if (typeof entry.reach.adoptionRatePercentage !== 'number') {
        entry.reach.adoptionRatePercentage = 0;
    }

    return true;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const validateImportData = (data: any): ExportData => {
    if (!data.entries || !Array.isArray(data.entries)) {
        throw new Error('Invalid data format: missing or invalid entries array');
    }

    const validEntries = data.entries.filter(isValidEntry);

    if (validEntries.length === 0) {
        throw new Error('No valid entries found in the imported file');
    }

    return {
        entries: validEntries,
        exportDate: data.exportDate || new Date().toISOString(),
        version: data.version || '1.0'
    };
}; 