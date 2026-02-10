export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ALLOWED_MIME_TYPES = ['application/pdf'];

/**
 * Validates PDF magic bytes signature ("%PDF-") at the start of the buffer.
 * This is authoritative server-side validation that cannot be spoofed.
 */
export function isPdfBuffer(buffer: Buffer): boolean {
    if (!buffer || buffer.length < 5) {
        return false;
    }
    // Check for PDF signature: %PDF- (bytes: 0x25 0x50 0x44 0x46 0x2D)
    return (
        buffer[0] === 0x25 && // %
        buffer[1] === 0x50 && // P
        buffer[2] === 0x44 && // D
        buffer[3] === 0x46 && // F
        buffer[4] === 0x2D    // -
    );
}

export function validateUpload(file: File | null): { success: boolean; error?: string } {
    if (!file) {
        return { success: false, error: "No file found" };
    }

    if (file.size > MAX_FILE_SIZE) {
        return { success: false, error: "File size exceeds 10MB limit." };
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        return { success: false, error: "Invalid file type. Only PDF files are allowed." };
    }

    return { success: true };
}

export function isPdfBuffer(buffer: Buffer): boolean {
    // Check if the buffer starts with %PDF- (magic bytes for PDF)
    if (!buffer || buffer.length < 5) return false;
    return buffer.subarray(0, 5).toString() === '%PDF-';
}
