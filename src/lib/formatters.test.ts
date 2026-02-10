import { describe, it } from 'node:test';
import assert from 'node:assert';
import { formatCurrency } from './formatters.ts';

describe('Formatters', () => {
    describe('formatCurrency', () => {
        it('should format zero correctly', () => {
            assert.strictEqual(formatCurrency(0), '₹0.00');
        });

        it('should format positive integer paise correctly', () => {
            assert.strictEqual(formatCurrency(100), '₹1.00');
            assert.strictEqual(formatCurrency(12345), '₹123.45');
        });

        it('should format large numbers with Indian locale (Lakhs/Crores)', () => {
            // 1 Lakh = 1,00,000.00 (100,000 * 100 paise = 1,00,00,000 paise)
            // Wait, formatCurrency takes paise.
            // 1 Lakh Rupees = 1,00,000.00
            // Input needed: 1,00,000 * 100 = 1,00,00,000
            assert.strictEqual(formatCurrency(10000000), '₹1,00,000.00');

            // 1 Crore Rupees = 1,00,00,000.00
            // Input needed: 1,00,00,000 * 100 = 1,00,00,00,000
            assert.strictEqual(formatCurrency(1000000000), '₹1,00,00,000.00');
        });

        it('should format negative amounts correctly', () => {
            assert.strictEqual(formatCurrency(-500), '-₹5.00');
            assert.strictEqual(formatCurrency(-12345), '-₹123.45');
        });

        it('should handle fractional paise with rounding', () => {
            // 150.5 paise -> 1.505 rupees -> 1.51 (half-up usually)
            assert.strictEqual(formatCurrency(150.5), '₹1.51');
            // 150.4 paise -> 1.504 rupees -> 1.50
            assert.strictEqual(formatCurrency(150.4), '₹1.50');
        });
    });
});
