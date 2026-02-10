export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ALLOWED_MIME_TYPES = ['application/pdf'];

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
