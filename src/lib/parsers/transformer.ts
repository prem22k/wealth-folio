import { Transaction, toPaise, TransactionType } from '@/types/schema';

/**
 * PDF Transformer Engine
 * 
 * Transforms raw text lines from PDF extraction into strictly typed Transaction objects.
 * 
 * Heuristics:
 * 1. Date Format: DD-MMM-YYYY or DD-MMM-YY (e.g., 25-Dec-2023)
 * 2. Amount: Decimal number with commas (e.g., 1,200.50)
 * 3. Type: 'CREDIT' or 'CR' implies Income, otherwise Expense.
 * 4. ID: Randomized UUID for temporary frontend keys.
 */
export function mapPdfToSchema(rawLines: string[], userId: string): Transaction[] {
    const transactions: Transaction[] = [];

    // Regex for Date: 25-Dec-2023 or 25-Dec-23 (case insensitive)
    // Matches start of line or bounded
    const dateRegex = /\b(\d{1,2})-(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)-(\d{2,4})\b/i;

    // Regex for Amount: Matches 1,234.56 or 123.45. Looks for dot and 2 decimals at end.
    // We search from the end of the line usually.
    const amountRegex = /[\d,]+\.\d{2}/g;

    for (const line of rawLines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        // 1. Detect Date
        const dateMatch = trimmed.match(dateRegex);
        if (!dateMatch) continue; // Not a transaction line

        // Parse Date
        const day = parseInt(dateMatch[1]);
        const monthStr = dateMatch[2];
        let year = parseInt(dateMatch[3]);

        // Handle 2 digit year
        if (year < 100) year += 2000;

        const monthIndex = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']
            .indexOf(monthStr.toLowerCase());

        // Use UTC to avoid timezone shifts (e.g. 00:00 IST -> Previous Day UTC)
        const date = new Date(Date.UTC(year, monthIndex, day));

        // 2. Extract Numbers (Amounts)
        const amounts = trimmed.match(amountRegex);
        if (!amounts || amounts.length === 0) continue;

        // Strategy: 
        // In bank statements, the Credit/Debit amount is usually distinct from Balance.
        // But columns vary.
        // If 2 numbers: [Amount, Balance] or [Debit, Credit].
        // Simple heuristic: If "CREDIT" or "CR" keyword exists, looking for specific column.
        // Assuming for this generic parser:
        // We take the LAST amount as Balance (often) or we rely on explicit user instruction?
        // The prompt says "Converts the decimal amount". 
        // Let's assume the transaction amount is the *second last* number if multiple, 
        // or the *only* number if one.
        // Wait, typical Statement: Date | Desc | Check | Debit | Credit | Balance
        // If Debit line: [DebitAmount, Balance] -> 2 matches.
        // If Credit line: [CreditAmount, Balance] -> 2 matches.
        // It's reasonably safe to pick the larger number? No.
        // It's reasonably safe to pick the number that is NOT the balance?
        // Without complex column analysis, let's take the first match as Amount if < 2 matches,
        // or 2nd last match if >= 2.
        // Actually, based on previous `sbi.ts`, it did `numbersMatch[numbersMatch.length - 2]`. 
        // Let's stick to that heuristic as "proven" for this user's SBI format.

        let amountStr = '';
        if (amounts.length >= 2) {
            amountStr = amounts[amounts.length - 2];
        } else {
            // Fallback: If only 1 number found, assume it is the amount (and balance parsing failed or absent)
            amountStr = amounts[0];
        }

        const amountFloat = parseFloat(amountStr.replace(/,/g, ''));
        const amountPaise = toPaise(amountFloat);

        // 3. Determine Type
        let type: TransactionType = 'expense';
        const upperLine = trimmed.toUpperCase();
        if (upperLine.includes(' CREDIT ') || upperLine.includes(' CR ') || upperLine.includes('INTEREST')) {
            type = 'income';
        }

        // 4. Extract Description
        // Remove Date
        let desc = trimmed.replace(dateMatch[0], '');
        // Remove Amount(s)
        desc = desc.replace(amountStr, ''); // Remove the used amount
        if (amounts.length >= 2) desc = desc.replace(amounts[amounts.length - 1], ''); // Remove balance

        // Clean up
        desc = desc.replace(/\s+/g, ' ').trim();
        // Remove trailing " CR " or " DR " markers implies by bank
        desc = desc.replace(/ (CR|DR)$/, '');

        // 5. Build Object
        const transaction: Transaction = {
            id: crypto.randomUUID(), // Temp ID
            userId: userId,
            date: date,
            amount: amountPaise,
            description: desc || "Unlabeled Transaction",
            category: 'Uncategorized', // Default
            type: type,
            source: 'sbi-bank', // Default per requirements
            status: 'verified' // Default per requirements
        };

        transactions.push(transaction);
    }

    return transactions;
}
