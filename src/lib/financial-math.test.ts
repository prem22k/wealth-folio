import { describe, it } from 'node:test';
import assert from 'node:assert';
import { safeSubtract } from './financial-math.ts';

describe('safeSubtract', () => {
    it('should correctly subtract two positive integers', () => {
        const result = safeSubtract(100, 50);
        assert.strictEqual(result, 50);
    });

    it('should correctly subtract a larger number from a smaller one resulting in negative', () => {
        const result = safeSubtract(50, 100);
        assert.strictEqual(result, -50);
    });

    it('should return 0 when subtracting equal numbers', () => {
        const result = safeSubtract(100, 100);
        assert.strictEqual(result, 0);
    });

    it('should round floating point inputs before subtraction', () => {
        // 100.6 rounds to 101, 50.4 rounds to 50
        // 101 - 50 = 51
        const result = safeSubtract(100.6, 50.4);
        assert.strictEqual(result, 51);
    });

    it('should handle large numbers correctly', () => {
        const largeA = 1000000000;
        const largeB = 500000000;
        const result = safeSubtract(largeA, largeB);
        assert.strictEqual(result, 500000000);
    });

    it('should handle zero as input', () => {
        const result = safeSubtract(100, 0);
        assert.strictEqual(result, 100);
    });

    it('should handle negative inputs', () => {
        const result = safeSubtract(-50, -25);
        // -50 - (-25) = -25
        assert.strictEqual(result, -25);
    });
});
