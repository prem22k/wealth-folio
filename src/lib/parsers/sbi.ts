import { type Transaction, toPaise } from '../../types/schema.ts';
import { parse } from 'date-fns';

// We omit 'id' and 'userId' because the parser doesn't know about them. 
// The caller (UI/Service) will inject them.
export type ParsedTransaction = Omit<Transaction, 'id' | 'userId'>;

export interface RegexParsedTransaction {
    date: string;
    description: string;
    amount: number; // Rupees (float)
    type: 'income' | 'expense';
    category: string;
    source: string;
}

interface ExtractedTransactionData {
    date: Date;
    amount: number; // Float (Rupees)
    description: string;
    type: 'income' | 'expense';
}

// More flexible Date Regex as requested: 1 or 2 digit day/month, 2 or 4 digit year, - or / separator
const DATE_REGEX = /(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})/;

// Regex to find all valid decimal money values (e.g. 1,000.00 or 50.50)
const MONEY_REGEX = /[\d,]+\.\d{2}/g;

/**
 * Common logic to extract transaction data from a single line of SBI text.
 */
function extractTransactionFromLine(line: string): ExtractedTransactionData | null {
    // 1. Detect Date
    const dateMatch = line.match(DATE_REGEX);
    if (!dateMatch) return null;

    const dateStr = dateMatch[0];
    const date = parseDate(dateStr);
    if (!date) return null;

    // 2. Extract Numbers
    const numbersMatch = line.match(MONEY_REGEX);
    if (numbersMatch && numbersMatch.length >= 2) {
        // Strategy:
        // Last number = Balance
        // Second to last number = Amount
        // const balanceStr = numbersMatch[numbersMatch.length - 1].replace(/,/g, '');
        const amountStr = numbersMatch[numbersMatch.length - 2].replace(/,/g, '');
        const amount = parseFloat(amountStr);

        // 3. Extract Description
        const dateIndex = line.indexOf(dateStr);
        // Use raw string match to find position of amount
        const amountIndex = line.lastIndexOf(numbersMatch[numbersMatch.length - 2]);

        // Robust substring: from end of Date to start of Amount
        let description = line.substring(dateIndex + dateStr.length, amountIndex).trim();

        // Cleanup description (remove leading/trailing spaces, excessive dashes)
        description = description.replace(/^[\s-]+|[\s-]+$/g, '').trim();

        // 4. Determine Type
        let type: 'income' | 'expense' = 'expense';
        const upperDesc = description.toUpperCase();

        // Check specific credit markers first
        if (upperDesc.includes('/CR/') || upperDesc.includes(' CREDIT ') || upperDesc.includes('INTEREST CREDIT')) {
            type = 'income';
        } else if (upperDesc.includes('/DR/') || upperDesc.includes(' DEBIT ') || upperDesc.includes('ATM CASH')) {
            // If explicit debit, or just assume expense?
            // Usually safer to assume expense if not credit
            type = 'expense';
        }

        return {
            date,
            amount,
            description,
            type
        };
    }

    return null;
}

export function parseSBIText(text: string): ParsedTransaction[] {
    const lines = text.split('\n');
    const transactions: ParsedTransaction[] = [];

    for (const line of lines) {
        const extracted = extractTransactionFromLine(line);
        if (extracted) {
            const transaction: ParsedTransaction = {
                amount: toPaise(extracted.amount), // Convert float 79.08 -> 7908 paise
                date: extracted.date,
                description: extracted.description,
                category: 'Uncategorized',
                type: extracted.type,
                source: 'sbi-bank',
                status: 'pending',
            };
            transactions.push(transaction);
        }
    }

    return transactions;
}

/**
 * Fast Regex Parser
 * Returns raw schema compatible with AI parser for interchangeability.
 * Amount is in Rupees (Float).
 */
export function parseWithRegex(text: string): RegexParsedTransaction[] {
    const lines = text.split('\n');
    const transactions: RegexParsedTransaction[] = [];

    for (const line of lines) {
        const extracted = extractTransactionFromLine(line);
        if (extracted) {
            transactions.push({
                date: extracted.date.toISOString().split('T')[0], // Return YYYY-MM-DD string
                description: extracted.description,
                amount: extracted.amount, // Keeping as Rupees Float
                type: extracted.type,
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
        const [day, month] = parts;
        let year = parts[2];

        // Handle 2-digit year
        if (year.length === 2) {
            const currentYear = new Date().getFullYear();
            const currentCentury = Math.floor(currentYear / 100) * 100;
            year = String(currentCentury + parseInt(year, 10));
        }

        const formatString = year.length === 4 ? 'dd-MM-yyyy' : 'dd-MM-yy';
        const date = parse(normalized, formatString, new Date());
        return isNaN(date.getTime()) ? null : date;
    }
    return null;
}
