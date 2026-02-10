
import { describe, it } from 'node:test';
import assert from 'node:assert';
import { parseWithRegex } from './sbi';

describe('parseWithRegex', () => {
    it('should parse valid SBI transaction lines correctly', () => {
        const input = `
16-12-25 UPI/DR/123456789012/Payme - - 630.00 337.75
17-12-25 UPI/CR/987654321098/Refund - - 100.00 437.75
`;
        const result = parseWithRegex(input);

        assert.strictEqual(result.length, 2);

        // First transaction (Debit)
        assert.strictEqual(result[0].date, '2025-12-16');
        assert.strictEqual(result[0].amount, 630.00);
        assert.strictEqual(result[0].type, 'expense');
        assert.strictEqual(result[0].description, 'UPI/DR/123456789012/Payme');

        // Second transaction (Credit)
        assert.strictEqual(result[1].date, '2025-12-17');
        assert.strictEqual(result[1].amount, 100.00);
        assert.strictEqual(result[1].type, 'income'); // Wait, parseWithRegex logic for credit is limited to specific keywords
        assert.strictEqual(result[1].description, 'UPI/CR/987654321098/Refund');
    });

    it('should handle different date formats', () => {
        const input = `
1-1-24 REF1 - - 50.00 100.00
02/02/2024 REF2 - - 60.00 160.00
`;
        const result = parseWithRegex(input);
        assert.strictEqual(result.length, 2);

        assert.strictEqual(result[0].date, '2024-01-01');
        assert.strictEqual(result[1].date, '2024-02-02');
    });

    it('should ignore invalid lines', () => {
        const input = `
This is a header
Page 1 of 5
12-12-24 No amount here
Just some text 500.00
`;
        const result = parseWithRegex(input);
        assert.strictEqual(result.length, 0);
    });

    it('should detect credit transactions', () => {
         const input = `
18-12-25 SOME CREDIT TRANSACTION - - 500.00 1000.00
19-12-25 INTEREST CREDIT - - 10.00 1010.00
20-12-25 NEFT/CR/123 - - 200.00 1210.00
`;
        const result = parseWithRegex(input);

        assert.strictEqual(result.length, 3);
        assert.strictEqual(result[0].type, 'income');
        assert.strictEqual(result[1].type, 'income');
        assert.strictEqual(result[2].type, 'income');
    });

    it('should handle large amounts with commas', () => {
        const input = `
20-12-25 TRANSFER - - 1,50,000.00 2,00,000.00
`;
        const result = parseWithRegex(input);

        assert.strictEqual(result.length, 1);
        assert.strictEqual(result[0].amount, 150000.00);
    });

    it('should extract description correctly', () => {
         const input = `
21-12-25 LONG DESC  WITH  SPACES - - 123.45 456.78
`;
        const result = parseWithRegex(input);

        assert.strictEqual(result[0].description, 'LONG DESC  WITH  SPACES');
    });
});
