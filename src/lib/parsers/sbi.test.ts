import { describe, it } from 'node:test';
import assert from 'node:assert';
import { parseSBIText, parseWithRegex } from './sbi.ts';

describe('SBI Parser', () => {
    describe('parseSBIText', () => {
        it('should parse standard expense transaction correctly', () => {
            const input = "16-12-25 UPI/DR/12345/Payme - - 630.00 337.75";
            const result = parseSBIText(input);
            assert.strictEqual(result.length, 1);
            const txn = result[0];
            assert.strictEqual(txn.amount, 63000); // 630.00 -> 63000 paise
            assert.strictEqual(txn.description, "UPI/DR/12345/Payme");
            assert.strictEqual(txn.type, 'expense');
            assert.strictEqual(txn.source, 'sbi-bank');
            // Date check
            assert.strictEqual(txn.date.getFullYear(), 2025);
            assert.strictEqual(txn.date.getMonth(), 11); // December is 11
            assert.strictEqual(txn.date.getDate(), 16);
        });

        it('should parse income transaction correctly', () => {
            const input = "16-12-25 INTEREST CREDIT - - 100.00 437.75";
            const result = parseSBIText(input);
            assert.strictEqual(result.length, 1);
            const txn = result[0];
            assert.strictEqual(txn.amount, 10000); // 100.00 -> 10000 paise
            assert.strictEqual(txn.description, "INTEREST CREDIT");
            assert.strictEqual(txn.type, 'income');
        });

        it('should ignore lines without date', () => {
            const input = "This is a random line without date";
            const result = parseSBIText(input);
            assert.strictEqual(result.length, 0);
        });
    });

    describe('parseWithRegex', () => {
        it('should parse standard expense transaction correctly', () => {
            const input = "16-12-25 UPI/DR/12345/Payme - - 630.00 337.75";
            const result = parseWithRegex(input);
            assert.strictEqual(result.length, 1);
            const txn = result[0];
            assert.strictEqual(txn.amount, 630.00); // Rupees float
            assert.strictEqual(txn.description, "UPI/DR/12345/Payme");
            assert.strictEqual(txn.type, 'expense');
            assert.strictEqual(txn.source, 'sbi-bank');
            assert.strictEqual(txn.date, '2025-12-16');
        });

        it('should handle different date formats (DD/MM/YYYY)', () => {
            const input = "16/12/2025 UPI/DR/Payme 630.00 1000.00";
            const result = parseWithRegex(input);
            assert.strictEqual(result.length, 1);
            const txn = result[0];
            assert.strictEqual(txn.amount, 630.00);
            assert.strictEqual(txn.date, '2025-12-16');
        });

        it('should handle different date formats (DD-MM-YYYY)', () => {
            const input = "16-12-2025 UPI/DR/Payme 630.00 1000.00";
            const result = parseWithRegex(input);
            assert.strictEqual(result.length, 1);
            const txn = result[0];
            assert.strictEqual(txn.amount, 630.00);
            assert.strictEqual(txn.date, '2025-12-16');
        });
    });
});
