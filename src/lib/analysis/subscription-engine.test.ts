
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { detectSubscriptions } from './subscription-engine';
import { Transaction } from '@/types/schema';

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
    category: 'Subscription',
    type: 'expense',
    source: 'bank',
    status: 'verified',
});

describe('Subscription Engine', () => {
    it('should detect a perfect subscription', () => {
        const txs = [
            createTx('1', 'Netflix', 19900, '2024-01-01T10:00:00Z'),
            createTx('2', 'Netflix', 19900, '2024-02-01T10:00:00Z'), // 31 days
            createTx('3', 'Netflix', 19900, '2024-03-02T10:00:00Z'), // 30 days (leap year 2024 has 29 days in Feb)
        ];

        const subs = detectSubscriptions(txs);
        assert.equal(subs.length, 1);
        assert.equal(subs[0].vendorName, 'netflix');
        assert.equal(subs[0].averageAmount, 19900);
        assert.equal(subs[0].frequency, 'monthly');
    });

    it('should detect a subscription with slight amount variance (within 1%)', () => {
        // 1% of 10000 is 100.
        const txs = [
            createTx('1', 'Spotify', 10000, '2024-01-01T10:00:00Z'),
            createTx('2', 'Spotify', 10090, '2024-02-01T10:00:00Z'), // +90 (0.9%)
            createTx('3', 'Spotify', 9910, '2024-03-02T10:00:00Z'),  // -90 (0.9%)
        ];

        const subs = detectSubscriptions(txs);
        assert.equal(subs.length, 1);
        assert.equal(subs[0].vendorName, 'spotify');
        // Average: (10000 + 10090 + 9910) / 3 = 30000 / 3 = 10000
        assert.equal(subs[0].averageAmount, 10000);
    });

    it('should NOT detect a subscription with amount variance > 1%', () => {
        // 1% of 10000 is 100.
        const txs = [
            createTx('1', 'Utility', 10000, '2024-01-01T10:00:00Z'),
            createTx('2', 'Utility', 10200, '2024-02-01T10:00:00Z'), // +200 (2%)
            createTx('3', 'Utility', 10000, '2024-03-02T10:00:00Z'),
        ];

        const subs = detectSubscriptions(txs);
        assert.equal(subs.length, 0);
    });

    it('should NOT detect a subscription with irregular intervals', () => {
        const txs = [
            createTx('1', 'Gym', 5000, '2024-01-01T10:00:00Z'),
            createTx('2', 'Gym', 5000, '2024-01-15T10:00:00Z'), // 14 days
            createTx('3', 'Gym', 5000, '2024-02-01T10:00:00Z'), // 17 days
        ];

        const subs = detectSubscriptions(txs);
        assert.equal(subs.length, 0);
    });

    it('should NOT detect a subscription with less than 2 transactions', () => {
        const txs = [
            createTx('1', 'OneTime', 5000, '2024-01-01T10:00:00Z'),
        ];

        const subs = detectSubscriptions(txs);
        assert.equal(subs.length, 0);
    });

    it('should handle multiple subscriptions correctly', () => {
        const txs = [
            createTx('1', 'Netflix', 19900, '2024-01-01T10:00:00Z'),
            createTx('2', 'Netflix', 19900, '2024-02-01T10:00:00Z'),
            createTx('3', 'Spotify', 11900, '2024-01-05T10:00:00Z'),
            createTx('4', 'Spotify', 11900, '2024-02-05T10:00:00Z'),
        ];

        const subs = detectSubscriptions(txs);
        assert.equal(subs.length, 2);

        const netflix = subs.find(s => s.vendorName === 'netflix');
        const spotify = subs.find(s => s.vendorName === 'spotify');

        assert.ok(netflix);
        assert.ok(spotify);
    });
});
