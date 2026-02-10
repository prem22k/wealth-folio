
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { runAnomalyDetection, detectDuplicates, detectDeviations } from './anomaly-engine';
import type { Anomaly } from './anomaly-engine';
import type { Transaction } from '@/types/schema';

// Helper to create mock transactions
const createTx = (
  id: string,
  desc: string,
  amount: number,
  dateStr: string,
  category: string = 'General'
): Transaction => ({
  id,
  userId: 'test-user',
  description: desc,
  amount, // in paise
  date: new Date(dateStr),
  category,
  type: 'expense',
  source: 'hdfc-bank',
  status: 'verified',
});

describe('Anomaly Engine', () => {
  describe('detectDuplicates', () => {
    it('should return empty array if no duplicates', () => {
      const txs = [
        createTx('1', 'Uber', 50000, '2024-01-01T10:00:00Z'),
        createTx('2', 'Zomato', 30000, '2024-01-01T12:00:00Z'),
      ];
      const duplicates = detectDuplicates(txs);
      assert.equal(duplicates.length, 0);
    });

    it('should detect exact duplicate within 24 hours', () => {
      const txs = [
        createTx('1', 'Uber', 50000, '2024-01-01T10:00:00Z'),
        createTx('2', 'Uber', 50000, '2024-01-01T20:00:00Z'), // 10 hours later
      ];
      const duplicates = detectDuplicates(txs);
      assert.equal(duplicates.length, 1);
      assert.equal(duplicates[0].type, 'duplicate');
      assert.match(duplicates[0].id, /dup-1-2/);
    });

    it('should NOT detect duplicate if outside 24 hours', () => {
      const txs = [
        createTx('1', 'Uber', 50000, '2024-01-01T10:00:00Z'),
        createTx('2', 'Uber', 50000, '2024-01-03T10:00:00Z'), // 48 hours later
      ];
      const duplicates = detectDuplicates(txs);
      assert.equal(duplicates.length, 0);
    });

    it('should NOT detect duplicate if amount is different', () => {
      const txs = [
        createTx('1', 'Uber', 50000, '2024-01-01T10:00:00Z'),
        createTx('2', 'Uber', 55000, '2024-01-01T10:05:00Z'),
      ];
      const duplicates = detectDuplicates(txs);
      assert.equal(duplicates.length, 0);
    });

    it('should NOT detect duplicate if description is different', () => {
      const txs = [
        createTx('1', 'Uber', 50000, '2024-01-01T10:00:00Z'),
        createTx('2', 'Ola', 50000, '2024-01-01T10:05:00Z'),
      ];
      const duplicates = detectDuplicates(txs);
      assert.equal(duplicates.length, 0);
    });

    it('should handle multiple duplicate pairs', () => {
      const txs = [
        createTx('1', 'Uber', 50000, '2024-01-01T10:00:00Z'),
        createTx('2', 'Uber', 50000, '2024-01-01T12:00:00Z'),
        createTx('3', 'Zomato', 30000, '2024-01-02T10:00:00Z'),
        createTx('4', 'Zomato', 30000, '2024-01-02T11:00:00Z'),
      ];
      const duplicates = detectDuplicates(txs);
      assert.equal(duplicates.length, 2);
    });

    it('should not flag triplet as two pairs (should skip second in pair)', () => {
      const txs = [
        createTx('1', 'Uber', 50000, '2024-01-01T10:00:00Z'),
        createTx('2', 'Uber', 50000, '2024-01-01T10:01:00Z'),
        createTx('3', 'Uber', 50000, '2024-01-01T10:02:00Z'),
      ];

      const duplicates = detectDuplicates(txs);
      assert.equal(duplicates.length, 1);
      assert.equal(duplicates[0].metadata?.duplicateId, '2');
    });
  });

  describe('detectDeviations', () => {
    it('should return empty array if insufficient data (< 3 transactions)', () => {
      const txs = [
        createTx('1', 'Zomato', 50000, '2024-01-01T10:00:00Z'),
        createTx('2', 'Zomato', 50000, '2024-01-02T10:00:00Z'),
      ];
      const deviations = detectDeviations(txs);
      assert.equal(deviations.length, 0);
    });

    it('should return empty array if no significant deviation', () => {
      const txs = [
        createTx('1', 'Zomato', 50000, '2024-01-01T10:00:00Z'),
        createTx('2', 'Zomato', 55000, '2024-01-02T10:00:00Z'),
        createTx('3', 'Zomato', 45000, '2024-01-03T10:00:00Z'),
        createTx('4', 'Zomato', 52000, '2024-01-04T10:00:00Z'),
      ];
      const deviations = detectDeviations(txs);
      assert.equal(deviations.length, 0);
    });

    it('should detect deviation when amount > mean + 2*stdDev AND amount > 1.5*mean', () => {
      const baseline = Array(10).fill(0).map((_, i) => createTx(`${i}`, 'Zomato', 10000, `2024-01-0${i+1}T10:00:00Z`));
      const outlier = createTx('99', 'Zomato', 50000, '2024-01-20T10:00:00Z');

      const txs = [...baseline, outlier];

      const deviations = detectDeviations(txs);
      assert.equal(deviations.length, 1);
      assert.equal(deviations[0].id, 'dev-99');
    });
  });

  describe('runAnomalyDetection', () => {
    it('should return combined anomalies sorted by date (descending)', () => {
      // 1. Duplicate (Date: Jan 2)
      const dup1 = createTx('1', 'Uber', 50000, '2024-01-02T10:00:00Z');
      const dup2 = createTx('2', 'Uber', 50000, '2024-01-02T12:00:00Z'); // Detected as duplicate on this date

      // 2. Deviation (Date: Mar 20)
      const baseline = Array(10).fill(0).map((_, i) => createTx(`1${i}`, 'Zomato', 10000, `2024-03-0${i+1}T10:00:00Z`));
      const outlier = createTx('99', 'Zomato', 50000, '2024-03-20T10:00:00Z');

      const txs = [dup1, dup2, ...baseline, outlier];
      const anomalies = runAnomalyDetection(txs);

      assert.equal(anomalies.length, 2);

      // Sorting: Outlier (Mar 20) > Duplicate (Jan 2)
      assert.equal(anomalies[0].type, 'deviation');
      assert.equal(anomalies[1].type, 'duplicate');
    });
  });
});
