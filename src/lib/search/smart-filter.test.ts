
import { test, describe } from 'node:test';
import assert from 'node:assert';
import { applyTransactionFilter, SmartFilter } from './smart-filter';
import { Transaction } from '@/types/schema';

describe('applyTransactionFilter', () => {

    const createTx = (overrides: Partial<Transaction>): Transaction => ({
        id: 'tx-1',
        userId: 'user-1',
        amount: 10000,
        date: new Date('2024-01-01T10:00:00Z'),
        description: 'Test Tx',
        category: 'Food',
        type: 'expense',
        source: 'cash',
        status: 'verified',
        ...overrides
    });

    test('should filter by start date correctly', () => {
        // use UTC dates to align with toISOString behavior
        const tx1 = createTx({ id: 'tx1', date: new Date('2024-01-01T10:00:00Z') });
        const tx2 = createTx({ id: 'tx2', date: new Date('2024-01-02T10:00:00Z') });

        const filter: SmartFilter = {
            date: {
                startDate: '2024-01-02'
            }
        };

        const result = applyTransactionFilter([tx1, tx2], filter);
        assert.strictEqual(result.length, 1);
        assert.strictEqual(result[0].id, tx2.id);
    });

    test('should filter by end date correctly (inclusive)', () => {
        const tx1 = createTx({ id: 'tx1', date: new Date('2024-01-01T10:00:00Z') });
        const tx2 = createTx({ id: 'tx2', date: new Date('2024-01-02T10:00:00Z') });
        const tx3 = createTx({ id: 'tx3', date: new Date('2024-01-03T10:00:00Z') });

        const filter: SmartFilter = {
            date: {
                endDate: '2024-01-02'
            }
        };

        const result = applyTransactionFilter([tx1, tx2, tx3], filter);

        // tx1: 2024-01-01 <= 2024-01-02 -> Keep
        // tx2: 2024-01-02 <= 2024-01-02 -> Keep
        // tx3: 2024-01-03 > 2024-01-02 -> Filter out

        assert.strictEqual(result.length, 2);
        assert.ok(result.find(t => t.id === 'tx1'));
        assert.ok(result.find(t => t.id === 'tx2'));
    });

    test('should filter by date range correctly', () => {
        const tx1 = createTx({ id: 'tx1', date: new Date('2024-01-01T12:00:00Z') });
        const tx2 = createTx({ id: 'tx2', date: new Date('2024-01-02T12:00:00Z') });
        const tx3 = createTx({ id: 'tx3', date: new Date('2024-01-03T12:00:00Z') });
        const tx4 = createTx({ id: 'tx4', date: new Date('2024-01-04T12:00:00Z') });

        const filter: SmartFilter = {
            date: {
                startDate: '2024-01-02',
                endDate: '2024-01-03'
            }
        };

        const result = applyTransactionFilter([tx1, tx2, tx3, tx4], filter);

        assert.strictEqual(result.length, 2);
        assert.strictEqual(result[0].id, 'tx2');
        assert.strictEqual(result[1].id, 'tx3');
    });

    test('should handle exact boundary timestamps', () => {
        // Start date boundary
        const txStart = createTx({ id: 'txStart', date: new Date('2024-01-02T00:00:00Z') });
        const filterStart: SmartFilter = { date: { startDate: '2024-01-02' } };
        // isBefore(2024-01-02T00:00:00Z, 2024-01-02T00:00:00Z) is FALSE. So it returns false (does not filter). Correct.
        assert.strictEqual(applyTransactionFilter([txStart], filterStart).length, 1);

        // End date boundary
        const txEnd = createTx({ id: 'txEnd', date: new Date('2024-01-02T23:59:59.999Z') });
        const filterEnd: SmartFilter = { date: { endDate: '2024-01-02' } };
        // "2024-01-02" > "2024-01-02" is false. Returns true. Correct.
        assert.strictEqual(applyTransactionFilter([txEnd], filterEnd).length, 1);

        // Next day start
        const txNext = createTx({ id: 'txNext', date: new Date('2024-01-03T00:00:00Z') });
        // "2024-01-03" > "2024-01-02" is true. Returns false (filters out). Correct.
        assert.strictEqual(applyTransactionFilter([txNext], filterEnd).length, 0);
    });
});
