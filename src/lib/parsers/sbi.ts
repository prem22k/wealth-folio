import { Transaction, TransactionType, toPaise } from '@/types/schema';

// We omit 'id' and 'userId' because the parser doesn't know about them. 
// The caller (UI/Service) will inject them.
export type ParsedTransaction = Omit<Transaction, 'id' | 'userId'>;

export function parseSBIText(text: string): ParsedTransaction[] {
    const lines = text.split('\n');
    const transactions: ParsedTransaction[] = [];

    let currentDate: Date | null = null;
    let pendingDescription = '';

    // Regex to capture Date (DD-MM-YY or DD/MM/YYYY)
    // Supports 30-12-25 or 30/12/2025
    const dateRegex = /(\d{2}[/-]\d{2}[/-]\d{2,4})/;

    // Regex to find all valid decimal money values (e.g. 1,234.56)
    const moneyRegex = /[\d,]+\.\d{2}/g;

    for (const line of lines) {
        // 1. Detect and Extract Date
        const dateMatch = line.match(dateRegex);
        if (dateMatch) {
            const date = parseDate(dateMatch[0]);
            if (date) {
                currentDate = date;
            }
        }

        // 2. Extract Numbers
        const numbersMatch = line.match(moneyRegex);

        // 3. Clean line to get potential text
        let cleanText = line
            .replace(dateRegex, '') // Remove Date
            .replace(moneyRegex, '') // Remove parsed numbers
            .replace(/[-]{2,}/g, '') // Remove phantom dashes like --
            .trim();

        // 4. Logic Flow
        if (numbersMatch && numbersMatch.length >= 2) {
            // We have a transaction! (Amount + Balance usually, sometimes Credit + Debit + Balance)

            // Assume the LAST number is the Balance.
            // The number BEFORE it is the Amount.
            // This holds for "Credit Balance" or "Debit Balance".

            const val1Str = numbersMatch[numbersMatch.length - 2].replace(/,/g, '');
            // const val2Str = numbersMatch[numbersMatch.length - 1].replace(/,/g, ''); // Balance

            const amount = parseFloat(val1Str);

            // Determine Description and Type
            let description = cleanText;

            // If current line text is essentially empty/noise, try pendingDescription
            if (description.length < 3 || description === 'nullnullnullnull') { // specific noise in user input
                if (pendingDescription) {
                    description = pendingDescription;
                    pendingDescription = ''; // Consumed
                } else {
                    description = 'Unspecified Transaction';
                }
            }

            // Determine Type
            let type: TransactionType = 'expense'; // Default

            // Robust Type Detection using Description keywords
            const upperDesc = description.toUpperCase();
            if (upperDesc.includes('/CR/') || upperDesc.includes(' CREDIT ') || upperDesc.includes('INTEREST CREDIT')) {
                type = 'income';
            } else if (upperDesc.includes('/DR/') || upperDesc.includes(' DEBIT ')) {
                type = 'expense';
            } else {
                // If keywords missing, we might use column logic if we knew which column was parsed.
                // But with mashed text, keywords are safer.
                // Fallback: mostly expenses in statements.
                type = 'expense';
            }

            if (currentDate) {
                const transaction: ParsedTransaction = {
                    amount: toPaise(amount),
                    date: currentDate,
                    description: description.replace(/\s+/g, ' ').trim(), // Clean spaces
                    category: 'Uncategorized',
                    type: type,
                    source: 'sbi-bank',
                    status: 'pending',
                };
                transactions.push(transaction);
            }

        } else {
            // No numbers found on this line.
            // If it has meaningful text, it might be a description for a subsequent line (e.g. Uber case)
            // But verify it's not just header noise
            const upperClean = cleanText.toUpperCase();
            const ignoreList = ['BALANCE', 'TRANSACTION', 'DESCRIPTION', 'AMOUNT', 'DETAILS', 'SUMMARY', 'VISIT', 'CUSTOMER', 'OPENING', 'YOURNULL', 'NULLNULLNULLNULL'];

            const isNoise = ignoreList.some(kw => upperClean.includes(kw)) || cleanText.length < 3;

            if (!isNoise) {
                // Append to pending. If we already have pending, maybe join them?
                pendingDescription = pendingDescription ? pendingDescription + ' ' + cleanText : cleanText;
            }
        }
    }

    return transactions;
}

// Updated Date Helper
function parseDate(dateStr: string): Date | null {
    // Normalize separator
    const normDate = dateStr.replace(/-/g, '/');
    const parts = normDate.split('/');
    if (parts.length === 3) {
        let [day, month, year] = parts;
        // Handle 2-digit year
        if (year.length === 2) {
            year = '20' + year;
        }
        const date = new Date(`${year}-${month}-${day}`);
        return isNaN(date.getTime()) ? null : date;
    }
    return null;
}
