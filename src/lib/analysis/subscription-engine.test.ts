
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { groupTransactions } from './subscription-engine';
import { Transaction } from '@/types/schema';

// Helper to create mock transactions
const createTx = (description: string): Transaction => ({
  id: Math.random().toString(36).substring(7),
  userId: 'test-user',
  description,
  amount: 1000,
  date: new Date(),
  category: 'General',
  type: 'expense',
  source: 'hdfc-bank',
  status: 'verified',
});

describe('Subscription Engine - Group Transactions', () => {
  it('should group exact matches (case insensitive)', () => {
    const txs = [
      createTx('Netflix'),
      createTx('netflix'),
      createTx('NETFLIX'),
    ];
    const grouped = groupTransactions(txs);
    const keys = Object.keys(grouped);

    // Expect 1 group
    assert.equal(keys.length, 1);
    assert.equal(grouped[keys[0]].length, 3);
  });

  it('should group variations with special characters', () => {
    const txs = [
      createTx('Netflix.com'),
      createTx('NETFLIX subscription'), // "subscription" should be stop word? Or at least "NETFLIX" core matches.
    ];
    const grouped = groupTransactions(txs);
    const keys = Object.keys(grouped);

    // Ideally 1 group: "netflix"
    assert.equal(keys.length, 1);
    assert.match(keys[0], /netflix/i);
    assert.equal(grouped[keys[0]].length, 2);
  });

  it('should group fuzzy matches (typos)', () => {
    const txs = [
      createTx('Spotify'),
      createTx('Spotfy'), // Typo
    ];
    const grouped = groupTransactions(txs);
    const keys = Object.keys(grouped);

    assert.equal(keys.length, 1);
    assert.match(keys[0], /spotify/i);
    assert.equal(grouped[keys[0]].length, 2);
  });

  it('should group by vendor prefix if logical', () => {
    const txs = [
      createTx('Google Storage'),
      createTx('Google Services'),
    ];
    // This is debatable. For "Subscription detection", maybe we want "Google" as the vendor?
    // If we group them, we see 2 transactions.
    const grouped = groupTransactions(txs);
    const keys = Object.keys(grouped);

    // Depending on implementation, might be 1 or 2 groups.
    // If strict fuzzy matching, "storage" and "services" are distinct.
    // But if we detect "Google" as the common vendor token...
    // Let's assume we want them grouped for now if the task is "group by vendor description".
    // If not, we can adjust the test.
    // "Google" is a strong brand.

    // Let's assert at least that they are processed sanely.
    // If they are grouped, length 1. If not, length 2.
    // Current "simple" logic would produce "googlestorage" and "googleservices" -> 2 groups.
    // Improved logic might produce "google" -> 1 group.
    // Let's aim for 1 group.
    assert.equal(keys.length, 1);
    assert.match(keys[0], /google/i);
  });

  it('should handle stop words correctly', () => {
    const txs = [
      createTx('Amazon Pay India Pvt Ltd'),
      createTx('Amazon Retail'),
    ];
    // "Pay", "India", "Pvt", "Ltd" -> stop words. Result "Amazon".
    // "Retail" -> maybe stop word? Or just "Amazon" matches "Amazon Retail"?
    const grouped = groupTransactions(txs);
    const keys = Object.keys(grouped);

    assert.equal(keys.length, 1);
    assert.match(keys[0], /amazon/i);
  });

  it('should NOT group clearly distinct vendors', () => {
    const txs = [
        createTx('Uber Trip'),
        createTx('Zomato Order'),
    ];
    const grouped = groupTransactions(txs);
    const keys = Object.keys(grouped);

    assert.equal(keys.length, 2);
  });
});
