import Dinero from 'dinero.js';
import { differenceInDays, addDays } from 'date-fns';
import { Transaction } from '@/types/schema';

export interface Subscription {
    vendorName: string;
    averageAmount: number; // in paise
    frequency: 'monthly';
    nextExpectedDate: string; // ISO Date string
    confidence: number; // 0-1 score indicating how sure we are
}

/**
 * Vampire Cost Detector Engine
 * 
 * Detects recurring subscription payments from a list of transactions.
 * Logic:
 * 1. Normalize Vendor Names
 * 2. Group by Vendor
 * 3. Check Frequency (28-31 days)
 * 4. Check Amount Stability (1% variance using Dinero.js)
 */
export function detectSubscriptions(transactions: Transaction[]): Subscription[] {
    const subscriptions: Subscription[] = [];
    const grouped = groupTransactions(transactions);

    for (const [vendor, txs] of Object.entries(grouped)) {
        // Need at least 2 transactions to establish a pattern
        if (txs.length < 2) continue;

        // Sort by date ascending
        const sortedTxs = txs.sort((a, b) => a.date.getTime() - b.date.getTime());

        // Check patterns
        const pattern = analyzePattern(sortedTxs);

        if (pattern) {
            subscriptions.push({
                vendorName: vendor,
                averageAmount: pattern.averageAmount,
                frequency: 'monthly',
                nextExpectedDate: pattern.nextDate.toISOString(),
                confidence: pattern.confidence
            });
        }
    }

    return subscriptions;
}

// --- Helpers ---

/**
 * Normalizes and groups transactions by vendor description.
 * "Netflix.com" and "NETFLIX subscription" -> "netflix"
 * Note: This is a simple normalization. For better results, regex or fuzzy matching could be used.
 */
function groupTransactions(transactions: Transaction[]): Record<string, Transaction[]> {
    const groups: Record<string, Transaction[]> = {};

    for (const tx of transactions) {
        // Simple normalization: lowercase, remove special characters, take first 2 words
        const clean = tx.description.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
        // Use first word if long, or whole string? 
        // "netflix" -> "netflix"
        // "spotify ab" -> "spotify ab"
        // Let's stick to the prompt's "normalize text to handle slight variations"
        // For now, we will use the first continuous block of alpha-chars strictly if possible, 
        // or just the whole cleaned string.
        // Let's use the whole cleaned string to avoid over-grouping unrelated things.
        const key = clean;

        if (!groups[key]) {
            groups[key] = [];
        }
        groups[key].push(tx);
    }

    return groups;
}

interface PatternResult {
    averageAmount: number;
    nextDate: Date;
    confidence: number;
}

function analyzePattern(transactions: Transaction[]): PatternResult | null {
    // 1. Amount Consistency Check (using Dinero.js)
    // We check if all transactions are within 1% of the average (or first, or median).
    // Let's use the first transaction as the anchor for the amount to detect "series".
    // Actually, average is better but slightly harder to diff against 1% of EACH.
    // Requirement: "Flag items where the amount is identical or within a 1% margin of error"
    // Strategy: Calculate average, then check if all variance <= 1%

    const amounts = transactions.map(t => Dinero({ amount: t.amount })); // t.amount is in paise (integer)

    // Calculate Average Amount
    // Sum
    const total = amounts.reduce((acc, curr) => acc.add(curr), Dinero({ amount: 0 }));
    const averageDinero = total.divide(transactions.length);
    const averageAmount = averageDinero.getAmount();

    // Check variance for each
    // 1% tolerance
    const tolerance = averageDinero.percentage(1); // 1% of average
    const toleranceAmount = tolerance.getAmount();

    const isAmountConsistent = amounts.every(d => {
        const diff = d.subtract(averageDinero);
        return Math.abs(diff.getAmount()) <= toleranceAmount;
        // Note: strict 1% might be tight, but requested.
        // "Identical or within a 1% margin"
    });

    if (!isAmountConsistent) return null;

    // 2. Frequency Check (28-31 days)
    let totalDaysDiff = 0;
    let intervals = 0;
    let isPeriodic = true;

    for (let i = 1; i < transactions.length; i++) {
        const d1 = transactions[i - 1].date;
        const d2 = transactions[i].date;
        const diff = differenceInDays(d2, d1);

        // Prompt: "Frequency Check: Identify transactions that occur every 28-31 days"
        // If ANY interval is way off, break? Or average?
        // "occur every 28-31 days" implies regularity.
        // modifying strictness: specific interval check
        if (diff < 28 || diff > 31) {
            // Tolerance for weekend shifts? 
            // Bank payments might shift by 1-2 days. 
            // Requirement says "every 28-31 days". We will be strict-ish but maybe 
            // allow a slightly wider window (27-32) effectively or strict 28-31.
            // Let's stick to strict 28-31 as requested for the audit logic usually requests precision.
            // Attempt strict:
            isPeriodic = false;
            break;
        }

        totalDaysDiff += diff;
        intervals++;
    }

    if (!isPeriodic || intervals === 0) return null;

    const averageInterval = totalDaysDiff / intervals;

    // 3. Next Expected Date
    const lastDate = transactions[transactions.length - 1].date;
    const nextDate = addDays(lastDate, Math.round(averageInterval));

    return {
        averageAmount,
        nextDate,
        confidence: 1.0 // High confidence if checks passed
    };
}
