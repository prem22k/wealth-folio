
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { detectSubscriptions } from './subscription-engine';
import type { Transaction } from '@/types/schema';

// Helper to create mock transactions
const createTx = (
  id: string,
  desc: string,
  amount: number,
  dateStr: string,
  category = 'General',
  type: Transaction['type'] = 'expense',
): Transaction => ({
  id,
  userId: 'test-user',
  description: desc,
  amount, // in paise
  date: new Date(dateStr),
  category,
  type,
  source: 'credit-card',
  status: 'verified',
});

describe('Subscription Engine', () => {
    it('should detect valid monthly subscription', () => {
        const txs = [
            createTx('1', 'Netflix', 19900, '2024-01-01T10:00:00Z'),
            createTx('2', 'Netflix', 19900, '2024-02-01T10:00:00Z'),
            createTx('3', 'Netflix', 19900, '2024-03-02T10:00:00Z'), // 30 days
        ];
        const subs = detectSubscriptions(txs);
        assert.equal(subs.length, 1);
        assert.equal(subs[0].vendorName, 'netflix');
        assert.equal(subs[0].averageAmount, 19900);
    });

    it('should ignore irregular dates', () => {
        const txs = [
            createTx('1', 'Netflix', 19900, '2024-01-01T10:00:00Z'),
            createTx('2', 'Netflix', 19900, '2024-01-05T10:00:00Z'), // 4 days
            createTx('3', 'Netflix', 19900, '2024-01-10T10:00:00Z'), // 5 days
        ];
        const subs = detectSubscriptions(txs);
        assert.equal(subs.length, 0);
    });

    it('should ignore variable amounts', () => {
        const txs = [
            createTx('1', 'Netflix', 19900, '2024-01-01T10:00:00Z'),
            createTx('2', 'Netflix', 25000, '2024-02-01T10:00:00Z'), // > 1% diff
            createTx('3', 'Netflix', 19900, '2024-03-01T10:00:00Z'),
        ];
        const subs = detectSubscriptions(txs);
        assert.equal(subs.length, 0);
    });

    it('should handle unsorted input', () => {
        const txs = [
            createTx('3', 'Netflix', 19900, '2024-03-01T10:00:00Z'),
            createTx('1', 'Netflix', 19900, '2024-01-01T10:00:00Z'),
            createTx('2', 'Netflix', 19900, '2024-02-01T10:00:00Z'),
        ];
        const subs = detectSubscriptions(txs);
        assert.equal(subs.length, 1);
        assert.equal(subs[0].vendorName, 'netflix');
    });

    it('should not detect monthly salary credit as a subscription', () => {
        const txs = [
            createTx('1', 'SALARY CREDIT/TECH CORP', 11500000, '2024-01-01T10:00:00Z', 'Salary', 'income'),
            createTx('2', 'SALARY CREDIT/TECH CORP', 11500000, '2024-02-01T10:00:00Z', 'Salary', 'income'),
            createTx('3', 'SALARY CREDIT/TECH CORP', 11500000, '2024-03-02T10:00:00Z', 'Salary', 'income'),
        ];
        const subs = detectSubscriptions(txs);
        assert.equal(subs.length, 0);
    });

    it('should not count monthly rent or housing as subscription bleed', () => {
        const txs = [
            createTx('1', 'Rent payment to landlord', 2800000, '2024-01-05T10:00:00Z', 'Housing', 'expense'),
            createTx('2', 'Rent payment to landlord', 2800000, '2024-02-05T10:00:00Z', 'Housing', 'expense'),
            createTx('3', 'Rent payment to landlord', 2800000, '2024-03-06T10:00:00Z', 'Housing', 'expense'),
        ];
        const subs = detectSubscriptions(txs);
        assert.equal(subs.length, 0);
    });

    it('should not count utility bills as subscription bleed', () => {
        const txs = [
            createTx('1', 'Electricity Bill BESCOM', 185000, '2024-01-10T10:00:00Z', 'Utilities', 'expense'),
            createTx('2', 'Electricity Bill BESCOM', 185000, '2024-02-09T10:00:00Z', 'Utilities', 'expense'),
            createTx('3', 'Electricity Bill BESCOM', 185000, '2024-03-10T10:00:00Z', 'Bills', 'expense'),
        ];
        const subs = detectSubscriptions(txs);
        assert.equal(subs.length, 0);
    });

    it('should detect Netflix, Spotify, and gym monthly debits', () => {
        const txs = [
            // Netflix (Entertainment)
            createTx('n1', 'Netflix.com subscription', 64900, '2024-01-10T10:00:00Z', 'Entertainment', 'expense'),
            createTx('n2', 'Netflix.com subscription', 64900, '2024-02-09T10:00:00Z', 'Entertainment', 'expense'),
            createTx('n3', 'Netflix.com subscription', 64900, '2024-03-10T10:00:00Z', 'Entertainment', 'expense'),
            // Spotify (Entertainment)
            createTx('s1', 'Spotify India Premium', 11900, '2024-01-15T10:00:00Z', 'Entertainment', 'expense'),
            createTx('s2', 'Spotify India Premium', 11900, '2024-02-14T10:00:00Z', 'Entertainment', 'expense'),
            createTx('s3', 'Spotify India Premium', 11900, '2024-03-15T10:00:00Z', 'Entertainment', 'expense'),
            // Cultfit Gym (Health)
            createTx('g1', 'Cultfit Gym Membership', 249900, '2024-01-20T10:00:00Z', 'Health', 'expense'),
            createTx('g2', 'Cultfit Gym Membership', 249900, '2024-02-19T10:00:00Z', 'Health', 'expense'),
            createTx('g3', 'Cultfit Gym Membership', 249900, '2024-03-20T10:00:00Z', 'Health', 'expense'),
        ];
        const subs = detectSubscriptions(txs);
        assert.equal(subs.length, 3);
        assert.ok(subs.some(s => s.vendorName.includes('netflix') && s.averageAmount === 64900));
        assert.ok(subs.some(s => s.vendorName.includes('spotify') && s.averageAmount === 11900));
        assert.ok(subs.some(s => (s.vendorName.includes('cultfit') || s.vendorName.includes('gym')) && s.averageAmount === 249900));
    });
});
