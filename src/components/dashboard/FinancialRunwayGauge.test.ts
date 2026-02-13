import { describe, it } from 'node:test';
import assert from 'node:assert';
import { calculateStrokeDashoffset } from './gauge-utils';

describe('FinancialRunwayGauge Logic', () => {
    it('should return 283 for 0 months (empty circle)', () => {
        const offset = calculateStrokeDashoffset(0);
        assert.strictEqual(offset, 283);
    });

    it('should return 0 for 12 months (full circle)', () => {
        const offset = calculateStrokeDashoffset(12);
        assert.strictEqual(offset, 0);
    });

    it('should return 0 for >12 months (capped at full circle)', () => {
        const offset = calculateStrokeDashoffset(15);
        assert.strictEqual(offset, 0);
    });

    it('should return approx 141.5 for 6 months (half circle)', () => {
        const offset = calculateStrokeDashoffset(6);
        assert.strictEqual(offset, 283 / 2);
    });

    it('should handle decimal months', () => {
        // 3 months = 25% filled -> 75% offset remaining
        // Logic: Offset = 283 - (283 * percentage)
        // 3 months = 3/12 = 0.25 filled.
        // Offset = 283 - (283 * 0.25) = 283 * 0.75
        const offset = calculateStrokeDashoffset(3);
        assert.strictEqual(offset, 283 * 0.75);
    });
});
