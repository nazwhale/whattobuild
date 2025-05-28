// Utility functions for converting between display format (with 'k' suffix) and actual numbers

/**
 * Converts a number to display format with 'k' suffix for thousands
 * e.g., 5100 -> "5.1k", 1000 -> "1k", 500 -> "500"
 */
export const formatNumberForDisplay = (num: number): string => {
    if (num >= 1000) {
        const thousands = num / 1000;
        // Remove trailing zeros and decimal point if not needed
        const formatted = thousands % 1 === 0 ? thousands.toString() : thousands.toFixed(1);
        return `${formatted}k`;
    }
    return num.toString();
};

/**
 * Converts display format (with 'k' suffix) to actual number for storage
 * e.g., "5.1k" -> 5100, "1k" -> 1000, "500" -> 500
 */
export const parseDisplayNumber = (displayValue: string): number => {
    if (!displayValue) return 0;

    const trimmed = displayValue.trim().toLowerCase();

    if (trimmed.endsWith('k')) {
        const numPart = trimmed.slice(0, -1);
        // Validate the number part first before parsing
        if (numPart === '' || numPart === '.' || /\..*\./.test(numPart)) return 0;
        const numValue = parseFloat(numPart);
        return isNaN(numValue) ? 0 : numValue * 1000;
    }

    // For non-k numbers, validate first
    if (trimmed === '.' || /\..*\./.test(trimmed)) return 0;
    const numValue = parseFloat(trimmed);
    return isNaN(numValue) ? 0 : numValue;
};

/**
 * Validates if a display string is a valid number format
 * e.g., "5.1k", "1000", "2.5k" are valid, "abc", "5.1.2k" are not
 */
export const isValidDisplayNumber = (displayValue: string): boolean => {
    if (!displayValue) return true; // empty is valid (will be 0)

    const trimmed = displayValue.trim().toLowerCase();

    if (trimmed.endsWith('k')) {
        const numPart = trimmed.slice(0, -1);
        // Check if numPart is a valid number and doesn't have multiple decimal points
        if (numPart === '' || numPart === '.') return false;
        return !isNaN(parseFloat(numPart)) && isFinite(parseFloat(numPart)) && !/\..*\./.test(numPart);
    }

    // For non-k numbers, check for valid number format
    if (trimmed === '.' || trimmed === '') return trimmed === '';
    return !isNaN(parseFloat(trimmed)) && isFinite(parseFloat(trimmed)) && !/\..*\./.test(trimmed);
}; 