import { describe, it } from 'node:test';
import assert from 'node:assert';
import { redactPII } from './redactor.ts';

describe('PII Redactor', () => {
    describe('Email Redaction', () => {
        it('should redact standard email addresses', () => {
            const input = 'Contact us at support@example.com for help.';
            const expected = 'Contact us at [EMAIL] for help.';
            assert.strictEqual(redactPII(input), expected);
        });

        it('should redact multiple email addresses', () => {
            const input = 'Emails: a@b.com and x@y.org';
            const expected = 'Emails: [EMAIL] and [EMAIL]';
            assert.strictEqual(redactPII(input), expected);
        });

        it('should handle complex email formats', () => {
            const input = 'User: john.doe+tag@sub.domain.co.uk';
            const expected = 'User: [EMAIL]';
            assert.strictEqual(redactPII(input), expected);
        });
    });

    describe('IFSC Code Redaction', () => {
        it('should redact valid IFSC codes', () => {
            const input = 'Bank IFSC: SBIN0001234';
            const expected = 'Bank IFSC: [IFSC]';
            assert.strictEqual(redactPII(input), expected);
        });

        it('should redact multiple IFSC codes', () => {
            const input = 'HDFC0004321, ICIC0009876';
            const expected = '[IFSC], [IFSC]';
            assert.strictEqual(redactPII(input), expected);
        });

        it('should not redact invalid IFSC-like strings', () => {
            // Should verify boundary conditions or invalid formats if possible
            // The current regex is \b[A-Z]{4}0[A-Z0-9]{6}\b
            // So "ABCD012345" (missing 6th char after 0) should not match?
            // "ABCD0123456" is 4 + 1 + 6 = 11 chars.
            const input = 'CODE123456'; // Too short
            assert.strictEqual(redactPII(input), input);
        });
    });

    describe('Mobile Number Redaction', () => {
        it('should redact 10-digit mobile numbers starting with 6-9', () => {
            const input = 'Call me at 9876543210';
            const expected = 'Call me at [MOBILE]';
            assert.strictEqual(redactPII(input), expected);
        });

        it('should redact mobile numbers with +91 prefix', () => {
            const input = 'Mobile: +919876543210';
            const expected = 'Mobile: [MOBILE]';
            assert.strictEqual(redactPII(input), expected);
        });

        it('should redact mobile numbers with 0 prefix', () => {
            const input = 'Mobile: 09876543210';
            const expected = 'Mobile: [MOBILE]';
            assert.strictEqual(redactPII(input), expected);
        });

        it('should not redact 10-digit numbers not starting with 6-9 (unless caught by account regex)', () => {
            // 1234567890 starts with 1.
            // But wait, account regex matches 9-18 digits.
            // So 1234567890 will be redacted as [ACC_NO] eventually.
            // We need to check if it's redacted as MOBILE or ACC_NO.
            // If it starts with 1, it's not a mobile number in India context (usually).
            const input = 'ID: 1234567890';
            // It should NOT be [MOBILE].
            // But since account regex runs after, it will be [ACC_NO].
            // So this test case is tricky. We should check it doesn't become [MOBILE].
            const result = redactPII(input);
            assert.ok(!result.includes('[MOBILE]'));
            assert.strictEqual(result, 'ID: [ACC_NO]');
        });
    });

    describe('Account Number Redaction', () => {
        it('should redact 9-18 digit account numbers', () => {
            const input = 'Account: 123456789012';
            const expected = 'Account: [ACC_NO]';
            assert.strictEqual(redactPII(input), expected);
        });

        it('should redact 9 digit account numbers', () => {
            const input = 'Acc: 123456789';
            const expected = 'Acc: [ACC_NO]';
            assert.strictEqual(redactPII(input), expected);
        });

        it('should NOT redact currency amounts with decimal points', () => {
            // This is the bug. Current implementation redacts "123456789" part of "123456789.00"
            const input = 'Balance: 123456789.00';
            const expected = 'Balance: 123456789.00';
            assert.strictEqual(redactPII(input), expected);
        });

         it('should NOT redact currency amounts with decimal points (larger number)', () => {
            const input = 'Balance: 12345678901.50';
            const expected = 'Balance: 12345678901.50';
            assert.strictEqual(redactPII(input), expected);
        });
    });

    describe('Mixed Content', () => {
        it('should redact multiple types of PII in one string', () => {
            const input = 'Email: test@example.com, Mobile: 9876543210, Acc: 123456789012';
            const expected = 'Email: [EMAIL], Mobile: [MOBILE], Acc: [ACC_NO]';
            assert.strictEqual(redactPII(input), expected);
        });
    });
});
