import { describe, it } from 'node:test';
import assert from 'node:assert';
import { validateUpload, MAX_FILE_SIZE, isPdfBuffer } from './upload';

describe('validateUpload', () => {
    it('should pass for valid PDF file', () => {
        const file = new File(['dummy content'], 'test.pdf', { type: 'application/pdf' });
        const result = validateUpload(file);
        assert.strictEqual(result.success, true);
        assert.strictEqual(result.error, undefined);
    });

    it('should fail if no file is provided', () => {
        const result = validateUpload(null);
        assert.strictEqual(result.success, false);
        assert.strictEqual(result.error, "No file found");
    });

    it('should fail if file size exceeds limit', () => {
        // Create a small file and mock the size property so it exceeds MAX_FILE_SIZE
        const file = new File(['dummy content'], 'large.pdf', { type: 'application/pdf' });
        Object.defineProperty(file, 'size', { value: MAX_FILE_SIZE + 1 });

        const result = validateUpload(file);
        assert.strictEqual(result.success, false);
        assert.strictEqual(result.error, "File size exceeds 10MB limit.");
    });

    it('should fail if file type is not PDF', () => {
        const file = new File(['dummy content'], 'test.txt', { type: 'text/plain' });
        const result = validateUpload(file);
        assert.strictEqual(result.success, false);
        assert.strictEqual(result.error, "Invalid file type. Only PDF files are allowed.");
    });
});

describe('isPdfBuffer', () => {
    it('should return true for valid PDF magic bytes', () => {
        // PDF signature: %PDF-
        const buffer = Buffer.from([0x25, 0x50, 0x44, 0x46, 0x2D, 0x31, 0x2E, 0x34]);
        assert.strictEqual(isPdfBuffer(buffer), true);
    });

    it('should return false for invalid magic bytes', () => {
        const buffer = Buffer.from([0x00, 0x01, 0x02, 0x03, 0x04]);
        assert.strictEqual(isPdfBuffer(buffer), false);
    });

    it('should return false for buffer shorter than 5 bytes', () => {
        const buffer = Buffer.from([0x25, 0x50]);
        assert.strictEqual(isPdfBuffer(buffer), false);
    });

    it('should return false for empty buffer', () => {
        const buffer = Buffer.from([]);
        assert.strictEqual(isPdfBuffer(buffer), false);
    });

    it('should return false for null buffer', () => {
        assert.strictEqual(isPdfBuffer(null as any), false);
    });

    it('should return true for real PDF content', () => {
        // Simulate a real PDF file start
        const pdfContent = '%PDF-1.4\n%âãÏÓ\n';
        const buffer = Buffer.from(pdfContent);
        assert.strictEqual(isPdfBuffer(buffer), true);
    });
});
