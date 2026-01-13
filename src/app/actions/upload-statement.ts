'use server';

// @ts-expect-error
import pdf from 'pdf-parse/lib/pdf-parse.js';
import { parseSBIText, ParsedTransaction } from '@/lib/parsers/sbi';

interface ProcessResult {
    success: boolean;
    data?: ParsedTransaction[];
    error?: string;
}

export async function processStatement(formData: FormData): Promise<ProcessResult> {
    try {
        const file = formData.get('file') as File;

        if (!file) {
            return { success: false, error: 'No file provided' };
        }

        if (file.type !== 'application/pdf') {
            return { success: false, error: 'Invalid file type. Please upload a PDF.' };
        }

        // Convert to Buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Parse PDF Text
        const pdfData = await pdf(buffer);
        const text = pdfData.text;

        if (!text) {
            return { success: false, error: 'Could not extract text from PDF.' };
        }

        // Parse Text into Transactions
        const transactions = parseSBIText(text);

        return { success: true, data: transactions };

    } catch (error) {
        console.error('Error processing statement:', error);
        return { success: false, error: 'Failed to process statement.' };
    }
}
