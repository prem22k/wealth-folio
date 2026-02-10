import { describe, it } from 'node:test';
import assert from 'node:assert';
import { validateUpload, MAX_FILE_SIZE, isPdfBuffer } from './upload.ts';

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
        // Create a large file using Blob/File constructor if possible, or mock the size property
        // Since constructing a 10MB file in memory is fine for a test
        const largeContent = new Uint8Array(MAX_FILE_SIZE + 1);
        const file = new File([largeContent], 'large.pdf', { type: 'application/pdf' });

        // Alternatively, we can mock the size property to avoid allocating memory
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
    it('should return true for valid PDF buffer', () => {
        const buffer = Buffer.from('%PDF-1.4');
        assert.strictEqual(isPdfBuffer(buffer), true);
    });

    it('should return false for invalid buffer', () => {
        const buffer = Buffer.from('NOT A PDF');
        assert.strictEqual(isPdfBuffer(buffer), false);
    });

    it('should return false for empty buffer', () => {
        const buffer = Buffer.from('');
        assert.strictEqual(isPdfBuffer(buffer), false);
    });

    it('should return false for buffer shorter than 5 bytes', () => {
        const buffer = Buffer.from('%PD');
        assert.strictEqual(isPdfBuffer(buffer), false);
    });
});
