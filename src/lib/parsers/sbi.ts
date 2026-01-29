import { Transaction, TransactionType, toPaise } from '@/types/schema';

// We omit 'id' and 'userId' because the parser doesn't know about them. 
// The caller (UI/Service) will inject them.
export type ParsedTransaction = Omit<Transaction, 'id' | 'userId'>;

export function parseSBIText(text: string): ParsedTransaction[] {
    const lines = text.split('\n');
    const transactions: ParsedTransaction[] = [];

    // Regex to capture Date (DD-MM-YY only, per requirements)
    const dateRegex = /(\d{2}-\d{2}-\d{2})/;

    // Regex to find all valid decimal money values (e.g. 1,000.00 or 50.50)
    // Matches 1.00, 1,000.00, 100.50
    const moneyRegex = /[\d,]+\.\d{2}/g;

    for (const line of lines) {
        // 1. Detect Date
        const dateMatch = line.match(dateRegex);
        if (!dateMatch) continue; // Skip lines without a date

        const dateStr = dateMatch[0];
        const date = parseDate(dateStr);
        if (!date) continue;

        // 2. Extract Numbers
        const numbersMatch = line.match(moneyRegex);
        if (numbersMatch && numbersMatch.length >= 2) {
            // Strategy:
            // Last number = Balance
            // Second to last number = Amount
            const balanceStr = numbersMatch[numbersMatch.length - 1].replace(/,/g, '');
            const amountStr = numbersMatch[numbersMatch.length - 2].replace(/,/g, '');

            const amount = parseFloat(amountStr);
            const balance = parseFloat(balanceStr);

            // 3. Extract Description
            // It's everything between the Date and the Amount
            // "16-12-25 UPI/DR/.../Payme - - 630.00 337.75"
            // We want "UPI/DR/.../Payme - -"
            const dateIndex = line.indexOf(dateStr);
            const amountIndex = line.lastIndexOf(amountStr); // Use raw string match to find position

            // Robust substring: from end of Date to start of Amount
            let description = line.substring(dateIndex + dateStr.length, amountIndex).trim();

            // Cleanup description (remove leading/trailing spaces, excessive dashes)
            description = description.replace(/^[\s-]+|[\s-]+$/g, '').trim();

            // 4. Determine Type
            let type: TransactionType = 'expense';
            const upperDesc = description.toUpperCase();

            // Check specific credit markers first
            if (upperDesc.includes('/CR/') || upperDesc.includes(' CREDIT ') || upperDesc.includes('INTEREST CREDIT')) {
                type = 'income';
            } else if (upperDesc.includes('/DR/') || upperDesc.includes(' DEBIT ') || upperDesc.includes('ATM CASH')) {
                // If explicit debit, or just assume expense?
                // Usually safer to assume expense if not credit
                type = 'expense';
            }

            // Create Transaction
            const transaction: ParsedTransaction = {
                amount: toPaise(amount), // Convert float 79.08 -> 7908 paise
                date: date,
                description: description,
                category: 'Uncategorized',
                type: type,
                source: 'sbi-bank',
                status: 'pending',
            };
            transactions.push(transaction);
        }
    }

    return transactions;
}

export interface RegexParsedTransaction {
    date: string;
    description: string;
    amount: number; // Rupees (float)
    type: 'income' | 'expense';
    category: string;
    source: string;
}

/**
 * Fast Regex Parser
 * Returns raw schema compatible with AI parser for interchangeability.
 * Amount is in Rupees (Float).
 */
export function parseWithRegex(text: string): RegexParsedTransaction[] {
    const lines = text.split('\n');
    const transactions: RegexParsedTransaction[] = [];

    // More flexible Date Regex as requested: 1 or 2 digit day/month, 2 or 4 digit year, - or / separator
    const dateRegex = /(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})/;

    // Same money regex strategy
    const moneyRegex = /[\d,]+\.\d{2}/g;

    for (const line of lines) {
        // 1. Detect Date
        const dateMatch = line.match(dateRegex);
        if (!dateMatch) continue;

        const dateStr = dateMatch[0];
        const dateObj = parseDate(dateStr);
        if (!dateObj) continue;

        // 2. Extract Numbers
        const numbersMatch = line.match(moneyRegex);
        if (numbersMatch && numbersMatch.length >= 2) {
            // Strategy: Last = Balance, 2nd Last = Amount
            const amountStr = numbersMatch[numbersMatch.length - 2].replace(/,/g, '');
            const amount = parseFloat(amountStr); // RUPEES (Float)

            // 3. Extract Description
            const dateIndex = line.indexOf(dateStr);
            // Ideally we find the position of the amountStr in the line to substring properly
            // But verify if amountStr is unique enough? 
            // It's safer to slice from end of date to start of matches?
            // Let's use the same logic as parseSBIText for description
            const amountIndex = line.lastIndexOf(numbersMatch[numbersMatch.length - 2]);

            let description = line.substring(dateIndex + dateStr.length, amountIndex).trim();
            description = description.replace(/^[\s-]+|[\s-]+$/g, '').trim();

            // 4. Determine Type
            let type: 'income' | 'expense' = 'expense';
            const upperDesc = description.toUpperCase();
            if (upperDesc.includes('/CR/') || upperDesc.includes(' CREDIT ') || upperDesc.includes('INTEREST CREDIT')) {
                type = 'income';
            }

            transactions.push({
                date: dateObj.toISOString().split('T')[0], // Return YYYY-MM-DD string
                description: description,
                amount: amount, // Keeping as Rupees Float
                type: type,
                category: 'Uncategorized',
                source: 'sbi-bank'
            });
        }
    }

    return transactions;
}

function parseDate(dateStr: string): Date | null {
    // Normalize separator
    const normalized = dateStr.replace(/\//g, '-');
    const parts = normalized.split('-');

    if (parts.length === 3) {
        let [day, month, year] = parts;

        // Handle 2-digit year (assume 20xx)
        if (year.length === 2) {
            year = '20' + year;
        }

        const date = new Date(`${year}-${month}-${day}`);
        return isNaN(date.getTime()) ? null : date;
    }
    return null;
}
