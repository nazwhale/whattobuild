import type { RiceEntry } from './models';

export interface ExportData {
    entries: RiceEntry[];
    exportDate: string;
    version: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isValidEntry = (entry: any): entry is RiceEntry => {
    return entry &&
        typeof entry.id === 'string' &&
        typeof entry.title === 'string' &&
        entry.reach &&
        entry.impactDrivers &&
        entry.confidenceDrivers &&
        entry.effort;
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