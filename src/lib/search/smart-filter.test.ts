import { test, describe, it } from 'node:test';
import assert from 'node:assert';
import { applyTransactionFilter, SmartFilter } from './smart-filter';
import { Transaction } from '@/types/schema';

// Mock Transaction
function createMockTransaction(overrides: Partial<Transaction>): Transaction {
    return {
        id: '1',
        userId: 'user1',
        amount: 1000,
        date: new Date('2024-01-01'),
        description: 'Test Transaction',
        category: 'Test Category',
        type: 'expense',
        source: 'upi',
        status: 'verified',
        ...overrides,
    };
}

describe('applyTransactionFilter', () => {
    it('should filter by search query (case insensitive)', () => {
        const tx1 = createMockTransaction({ description: 'Uber Ride' });
        const tx2 = createMockTransaction({ description: 'Amazon Purchase' });
        const filter: SmartFilter = { searchQuery: 'uber' };

        const results = applyTransactionFilter([tx1, tx2], filter);
        assert.strictEqual(results.length, 1);
        assert.strictEqual(results[0].description, 'Uber Ride');
    });

    it('should filter by category (case insensitive)', () => {
        const tx1 = createMockTransaction({ category: 'Travel' });
        const tx2 = createMockTransaction({ category: 'Food' });
        const filter: SmartFilter = { category: 'travel' };

        const results = applyTransactionFilter([tx1, tx2], filter);
        assert.strictEqual(results.length, 1);
        assert.strictEqual(results[0].category, 'Travel');
    });

    it('should filter by both search query and category', () => {
        const tx1 = createMockTransaction({ description: 'Uber Ride', category: 'Travel' });
        const tx2 = createMockTransaction({ description: 'Uber Eats', category: 'Food' });
        const tx3 = createMockTransaction({ description: 'Flight Ticket', category: 'Travel' });
        const filter: SmartFilter = { searchQuery: 'uber', category: 'travel' };

        const results = applyTransactionFilter([tx1, tx2, tx3], filter);
        assert.strictEqual(results.length, 1);
        assert.strictEqual(results[0].description, 'Uber Ride');
    });

    it('should handle empty filter', () => {
        const tx1 = createMockTransaction({});
        const filter: SmartFilter = {};
        const results = applyTransactionFilter([tx1], filter);
        assert.strictEqual(results.length, 1);
    });

    it('should handle no matches', () => {
        const tx1 = createMockTransaction({ description: 'Uber Ride' });
        const filter: SmartFilter = { searchQuery: 'ola' };
        const results = applyTransactionFilter([tx1], filter);
        assert.strictEqual(results.length, 0);
    });

    it('should handle partial matches in search query', () => {
         const tx1 = createMockTransaction({ description: 'Supermarket' });
         const filter: SmartFilter = { searchQuery: 'market' };
         const results = applyTransactionFilter([tx1], filter);
         assert.strictEqual(results.length, 1);
    });
});
