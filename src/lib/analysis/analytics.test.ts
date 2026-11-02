import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
    calculateCategorySpend,
    calculateCashFlowVelocity,
    formatRupeesCompact,
} from './analytics';
import type { Transaction } from '@/types/schema';

const createTx = (
    id: string,
    amount: number, // in paise
    dateStr: string,
    category: string,
    type: Transaction['type'] = 'expense'
): Transaction => ({
    id,
    userId: 'user-123',
    amount,
    date: new Date(dateStr),
    description: `Test ${category}`,
    category,
    type,
    source: 'upi',
    status: 'verified',
});

describe('Analytics Helpers', () => {
    describe('formatRupeesCompact', () => {
        it('should format values over 1k with k suffix', () => {
            assert.equal(formatRupeesCompact(12400), '₹12.4k');
            assert.equal(formatRupeesCompact(28000), '₹28k');
            assert.equal(formatRupeesCompact(1500), '₹1.5k');
        });

        it('should format values under 1k without suffix', () => {
            assert.equal(formatRupeesCompact(485), '₹485');
            assert.equal(formatRupeesCompact(99), '₹99');
            assert.equal(formatRupeesCompact(0), '₹0');
        });
    });

    describe('calculateCategorySpend', () => {
        const refDate = new Date('2026-10-22T12:00:00Z');

        it('should aggregate expenses within the days window and convert paise to rupees', () => {
            const txs: Transaction[] = [
                createTx('1', 50000, '2026-10-20T10:00:00Z', 'Food', 'expense'), // ₹500
                createTx('2', 25000, '2026-10-15T10:00:00Z', 'Food', 'expense'), // ₹250
                createTx('3', 100000, '2026-10-10T10:00:00Z', 'Travel', 'expense'), // ₹1,000
                createTx('4', 11500000, '2026-10-01T10:00:00Z', 'Salary', 'income'), // income ignored
                createTx('5', 50000, '2026-08-01T10:00:00Z', 'Food', 'expense'), // > 30 days old
            ];

            const result = calculateCategorySpend(txs, 30, refDate);
            assert.equal(result.length, 2);
            assert.deepEqual(result, [
                { name: 'Travel', value: 1000 },
                { name: 'Food', value: 750 },
            ]);
        });

        it('should limit to top 6 categories and aggregate remainder as Other', () => {
            const txs: Transaction[] = [
                createTx('1', 700000, '2026-10-20T10:00:00Z', 'Housing', 'expense'), // 7000
                createTx('2', 600000, '2026-10-20T10:00:00Z', 'Food', 'expense'), // 6000
                createTx('3', 500000, '2026-10-20T10:00:00Z', 'Travel', 'expense'), // 5000
                createTx('4', 400000, '2026-10-20T10:00:00Z', 'Bills', 'expense'), // 4000
                createTx('5', 300000, '2026-10-20T10:00:00Z', 'Shopping', 'expense'), // 3000
                createTx('6', 200000, '2026-10-20T10:00:00Z', 'Health', 'expense'), // 2000
                createTx('7', 100000, '2026-10-20T10:00:00Z', 'Entertainment', 'expense'), // 1000
                createTx('8', 50000, '2026-10-20T10:00:00Z', 'Services', 'expense'), // 500
            ];

            const result = calculateCategorySpend(txs, 30, refDate);
            assert.equal(result.length, 7); // top 6 + Other
            assert.equal(result[0].name, 'Housing');
            assert.equal(result[0].value, 7000);
            assert.equal(result[5].name, 'Health');
            assert.equal(result[5].value, 2000);
            assert.equal(result[6].name, 'Other');
            assert.equal(result[6].value, 1500); // 1000 + 500
        });
    });

    describe('calculateCashFlowVelocity', () => {
        const refDate = new Date('2026-10-15T12:00:00Z');

        it('should return exactly 6 calendar months with income and expense per month', () => {
            const txs: Transaction[] = [
                // Oct 2026
                createTx('1', 11500000, '2026-10-01T10:00:00Z', 'Salary', 'income'),
                createTx('2', 2800000, '2026-10-05T10:00:00Z', 'Housing', 'expense'),
                // Sep 2026
                createTx('3', 11500000, '2026-09-01T10:00:00Z', 'Salary', 'income'),
                createTx('4', 2500000, '2026-09-05T10:00:00Z', 'Housing', 'expense'),
            ];

            const result = calculateCashFlowVelocity(txs, refDate);
            assert.equal(result.length, 6);

            // Last month is Oct
            const oct = result[5];
            assert.equal(oct.name, 'Oct');
            assert.equal(oct.income, 115000);
            assert.equal(oct.expense, 28000);

            // Second to last is Sep
            const sep = result[4];
            assert.equal(sep.name, 'Sep');
            assert.equal(sep.income, 115000);
            assert.equal(sep.expense, 25000);

            // An earlier month with no activity
            const may = result[0];
            assert.equal(may.name, 'May');
            assert.equal(may.income, 0);
            assert.equal(may.expense, 0);
        });
    });
});
