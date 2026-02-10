import { describe, it } from 'node:test';
import assert from 'node:assert';
import { parseSBIText, parseWithRegex } from './sbi.ts';
import { toPaise } from '../../types/schema.ts';

describe('SBI Parser', () => {
    describe('parseSBIText', () => {
        it('should parse a standard expense transaction', () => {
            const input = `16-12-25 UPI/DR/123456/Payme - - 630.00 337.75`;
            const transactions = parseSBIText(input);

            assert.strictEqual(transactions.length, 1);
            const tx = transactions[0];

            // Date: 16-12-25 -> 2025-12-16
            assert.strictEqual(tx.date.toISOString().split('T')[0], '2025-12-16');
            assert.strictEqual(tx.description, 'UPI/DR/123456/Payme');
            assert.strictEqual(tx.amount, toPaise(630.00));
            assert.strictEqual(tx.type, 'expense');
            assert.strictEqual(tx.source, 'sbi-bank');
            assert.strictEqual(tx.status, 'pending');
        });

        it('should parse a standard credit/income transaction', () => {
            const input = `16-12-25 NEFT/CR/123456/Salary - - 50000.00 50337.75`;
            const transactions = parseSBIText(input);

            assert.strictEqual(transactions.length, 1);
            const tx = transactions[0];

            assert.strictEqual(tx.date.toISOString().split('T')[0], '2025-12-16');
            assert.strictEqual(tx.description, 'NEFT/CR/123456/Salary');
            assert.strictEqual(tx.amount, toPaise(50000.00));
            assert.strictEqual(tx.type, 'income');
        });

        it('should parse multiple transactions', () => {
            const input = `
            16-12-25 UPI/DR/123456/Payme - - 630.00 337.75
            17-12-25 ATM CASH 2000.00 2337.75
            18-12-25 INTEREST CREDIT 100.00 2437.75
            `;
            const transactions = parseSBIText(input);

            assert.strictEqual(transactions.length, 3);
            assert.strictEqual(transactions[0].description, 'UPI/DR/123456/Payme');
            assert.strictEqual(transactions[1].description, 'ATM CASH');
            assert.strictEqual(transactions[1].type, 'expense');
            assert.strictEqual(transactions[2].description, 'INTEREST CREDIT');
            assert.strictEqual(transactions[2].type, 'income');
        });

        it('should handle amounts with commas', () => {
            const input = `16-12-25 TRANSFER - - 1,234.50 5,000.00`;
            const transactions = parseSBIText(input);

            assert.strictEqual(transactions.length, 1);
            assert.strictEqual(transactions[0].amount, toPaise(1234.50));
        });

        it('should clean up description', () => {
            const input = `16-12-25 - UPI/DR/Sample - - 100.00 200.00`;
            const transactions = parseSBIText(input);

            assert.strictEqual(transactions.length, 1);
            // It should remove leading dashes/spaces
            assert.strictEqual(transactions[0].description, 'UPI/DR/Sample');
        });

        it('should ignore invalid lines', () => {
            const input = `
            This is a header
            16-12-25 Valid Transaction 100.00 200.00
            Just some text
            Another invalid line with numbers 100.00
            `;
            const transactions = parseSBIText(input);

            assert.strictEqual(transactions.length, 1);
            assert.strictEqual(transactions[0].description, 'Valid Transaction');
        });

        it('should handle dates with varying separators if logic allows (logic assumes DD-MM-YY)', () => {
             // Code uses /(\d{2}-\d{2}-\d{2})/ so it strictly expects dashes.
             const input = `16-12-25 Correct 100.00 200.00\n16/12/25 Slash 100.00 200.00`;
             const transactions = parseSBIText(input);

             assert.strictEqual(transactions.length, 1);
             assert.strictEqual(transactions[0].description, 'Correct');
        });
    });

    describe('parseWithRegex', () => {
        it('should parse using the alternative regex parser', () => {
            const input = `16/12/2025 UPI/DR/Test 100.00 200.00`;
            const transactions = parseWithRegex(input);

            assert.strictEqual(transactions.length, 1);
            assert.strictEqual(transactions[0].description, 'UPI/DR/Test');
            assert.strictEqual(transactions[0].amount, 100.00); // Float
            assert.strictEqual(transactions[0].date, '2025-12-16');
        });
    });
});
