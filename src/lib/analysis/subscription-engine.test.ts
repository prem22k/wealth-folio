
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
): Transaction => ({
  id,
  userId: 'test-user',
  description: desc,
  amount, // in paise
  date: new Date(dateStr),
  category: 'General',
  type: 'expense',
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
});
