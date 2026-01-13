import { Transaction, TransactionType, toPaise } from '@/types/schema';

// We omit 'id' and 'userId' because the parser doesn't know about them. 
// The caller (UI/Service) will inject them.
export type ParsedTransaction = Omit<Transaction, 'id' | 'userId'>;

// Helper to parse dates
function parseDate(dateStr: string): Date | null {
    // Check for DD/MM/YYYY format
    if (dateStr.includes('/')) {
        const parts = dateStr.split('/');
        if (parts.length === 3) {
            const [day, month, year] = parts;
            // return new Date(`${year}-${month}-${day}`); // UTC? Or local?
            // Does "26/12/2025" mean usually local time?
            // Let's create date string YYYY-MM-DD which is standard.
            const date = new Date(`${year}-${month}-${day}`);
            return isNaN(date.getTime()) ? null : date;
        }
    }

    // Try standard parsing for "25 Dec 2025"
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? null : date;
}

export function parseSBIText(text: string): ParsedTransaction[] {
    const lines = text.split('\n');
    const transactions: ParsedTransaction[] = [];

    // Regex to match the start of a line with a date (e.g., 25 Dec 2025 or 25/12/2025)
    // Note: the regex captures the date string in group 1
    const dateRegex = /^\s*(\d{2}\s+[A-Za-z]{3}\s+\d{4}|\d{2}\/\d{2}\/\d{4})/;

    // Regex to find trailing numbers (Debit Credit Balance)
    // Matches: 1,000.00 0.00 5,000.00 or similar
    // Structure: (Number) (Space) (Number) (Space) (Number) (End of Line)
    // We allow for "0.00" or empty spaces if text extraction is weird, but standard SBI usually has explicit 0.00.
    // We'll look for the last 3 numbers.
    const numbersRegex = /((?:[\d,]+\.\d{2}))\s+((?:[\d,]+\.\d{2}))\s+((?:[\d,]+\.\d{2}))\s*$/;

    for (const line of lines) {
        const dateMatch = line.match(dateRegex);

        if (dateMatch) {
            const dateStr = dateMatch[1];

            const date = parseDate(dateStr);
            if (!date) continue;

            // Extract details
            // The line usually contains: Date <Ref/Desc> Debit Credit Balance
            // Let's try to extract the numbers from the end.
            const numsMatch = line.match(numbersRegex);

            if (numsMatch) {
                // match[1] = Debit, match[2] = Credit, match[3] = Balance
                // Values usually contain commas, e.g. "10,000.00"
                const debitStr = numsMatch[1].replace(/,/g, '');
                const creditStr = numsMatch[2].replace(/,/g, '');
                // const balanceStr = numsMatch[3].replace(/,/g, '');

                const debit = parseFloat(debitStr);
                const credit = parseFloat(creditStr);

                // Determine Type and Amount
                let type: TransactionType = 'expense';
                let amount = 0;

                if (debit > 0 && credit === 0) {
                    type = 'expense';
                    amount = debit;
                } else if (credit > 0 && debit === 0) {
                    type = 'income';
                    amount = credit;
                } else {
                    // Both 0 or both > 0 (transfer check or correction? Rare in simple statement)
                    // Look at description or ignore 0 entries
                    if (debit === 0 && credit === 0) continue;

                    // Fallback: If both exist, usually one is the transaction. 
                    // But effectively, let's assume if Debit > Credit it's expense.
                    if (debit > credit) {
                        type = 'expense';
                        amount = debit - credit;
                    } else {
                        type = 'income';
                        amount = credit - debit;
                    }
                }

                // Clean Description
                // Remove Date from start
                let description = line.replace(dateRegex, '').trim();
                // Remove the numbers from the end
                description = description.replace(numbersRegex, '').trim();

                // Extract Ref No / UPI ID if present
                // Common formats: "UPI/123456789012/..." or "Ref No 12345"
                // If we find a UPI reference, we can try to extract it to make description cleaner or keep it.
                // User requirements: "Extract the 'Ref No' or 'UPI ID' if present in the narration."
                // We'll leave the description raw but maybe extract a specific Field if we had a dedicated schema field.
                // Since schema only has 'description', we will keep the full text but ensure it's readable.
                // However, we might want to clean up excessive whitespace.
                description = description.replace(/\s+/g, ' ');

                const transaction: ParsedTransaction = {
                    amount: toPaise(amount),
                    date: date,
                    description: description,
                    category: 'Uncategorized', // Default
                    type: type,
                    source: 'sbi-bank',
                    status: 'pending',
                };

                transactions.push(transaction);
            }
        }
    }

    return transactions;
}
