import { describe, it, expect } from 'vitest';
import { formatNumberForDisplay, parseDisplayNumber, isValidDisplayNumber } from './numberUtils';

describe('numberUtils', () => {
    describe('formatNumberForDisplay', () => {
        it('formats numbers >= 1000 with k suffix', () => {
            expect(formatNumberForDisplay(5100)).toBe('5.1k');
            expect(formatNumberForDisplay(1000)).toBe('1k');
            expect(formatNumberForDisplay(2500)).toBe('2.5k');
            expect(formatNumberForDisplay(10000)).toBe('10k');
            expect(formatNumberForDisplay(12345)).toBe('12.3k');
        });

        it('does not format numbers < 1000', () => {
            expect(formatNumberForDisplay(999)).toBe('999');
            expect(formatNumberForDisplay(500)).toBe('500');
            expect(formatNumberForDisplay(0)).toBe('0');
        });
    });

    describe('parseDisplayNumber', () => {
        it('parses k suffix numbers correctly', () => {
            expect(parseDisplayNumber('5.1k')).toBe(5100);
            expect(parseDisplayNumber('1k')).toBe(1000);
            expect(parseDisplayNumber('2.5k')).toBe(2500);
            expect(parseDisplayNumber('10k')).toBe(10000);
        });

        it('parses regular numbers correctly', () => {
            expect(parseDisplayNumber('999')).toBe(999);
            expect(parseDisplayNumber('500')).toBe(500);
            expect(parseDisplayNumber('0')).toBe(0);
        });

        it('handles empty and invalid inputs', () => {
            expect(parseDisplayNumber('')).toBe(0);
            expect(parseDisplayNumber('abc')).toBe(0);
            expect(parseDisplayNumber('5.1.2k')).toBe(0);
        });

        it('handles case insensitive input', () => {
            expect(parseDisplayNumber('5.1K')).toBe(5100);
            expect(parseDisplayNumber('2K')).toBe(2000);
        });
    });

    describe('isValidDisplayNumber', () => {
        it('validates correct k suffix numbers', () => {
            expect(isValidDisplayNumber('5.1k')).toBe(true);
            expect(isValidDisplayNumber('1k')).toBe(true);
            expect(isValidDisplayNumber('2.5k')).toBe(true);
            expect(isValidDisplayNumber('10k')).toBe(true);
        });

        it('validates regular numbers', () => {
            expect(isValidDisplayNumber('999')).toBe(true);
            expect(isValidDisplayNumber('500')).toBe(true);
            expect(isValidDisplayNumber('0')).toBe(true);
        });

        it('validates empty input as valid', () => {
            expect(isValidDisplayNumber('')).toBe(true);
        });

        it('rejects invalid inputs', () => {
            expect(isValidDisplayNumber('abc')).toBe(false);
            expect(isValidDisplayNumber('5.1.2k')).toBe(false);
            expect(isValidDisplayNumber('k')).toBe(false);
        });

        it('handles case insensitive input', () => {
            expect(isValidDisplayNumber('5.1K')).toBe(true);
            expect(isValidDisplayNumber('2K')).toBe(true);
        });
    });
}); 