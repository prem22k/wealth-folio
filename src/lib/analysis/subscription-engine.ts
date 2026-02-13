import { differenceInDays, addDays } from 'date-fns';
import { Transaction } from '@/types/schema';

export interface Subscription {
    vendorName: string;
    averageAmount: number; // in paise
    frequency: 'monthly';
    nextExpectedDate: string; // ISO Date string
    confidence: number; // 0-1 score indicating how sure we are
    category: string;
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
            // Use the category of the most recent transaction
            const category = sortedTxs[sortedTxs.length - 1].category || 'Uncategorized';

            subscriptions.push({
                vendorName: vendor,
                averageAmount: pattern.averageAmount,
                frequency: 'monthly',
                nextExpectedDate: pattern.nextDate.toISOString(),
                confidence: pattern.confidence,
                category
            });
        }
    }

    return subscriptions;
}

// --- Helpers ---

export const STOP_WORDS = new Set([
    'com', 'co', 'in', 'us', 'uk', 'net', 'org', 'io', 'app',
    'pay', 'bill', 'invoice', 'tfr', 'neft', 'imps', 'upi', 'atm',
    'pos', 'db', 'cr', 'dr', 'int', 'txn', 'pvt', 'ltd', 'inc',
    'llc', 'corp', 'plc', 'sa', 'gmbh', 'nv', 'bv', 'kk', 'subscription',
    'payment', 'transfer', 'withdrawal', 'deposit', 'private', 'limited',
    'services', 'service', 'solutions', 'technologies', 'technology',
    'bank', 'finance', 'financial', 'insurance', 'consulting', 'global',
    'international', 'group', 'india', 'retail', 'outlet', 'store',
    'shop', 'mart', 'bazaar', 'online', 'digital', 'network', 'entertainment',
    'media', 'communications', 'telecom', 'mobile', 'broadband', 'cable',
    'dth', 'recharge', 'prepaid', 'postpaid', 'www'
]);

/**
 * Normalizes and groups transactions by vendor description.
 * "Netflix.com" and "NETFLIX subscription" -> "netflix"
 * Note: This is a simple normalization. For better results, regex or fuzzy matching could be used.
 */
export function groupTransactions(transactions: Transaction[]): Record<string, Transaction[]> {
    const groups: Record<string, Transaction[]> = {};

    for (const tx of transactions) {
        // 1. Normalize
        const lower = tx.description.toLowerCase();
        // Replace non-alphanumeric with space to preserve word boundaries
        const spaced = lower.replace(/[^a-z0-9]/g, ' ');
        // Split and filter stop words
        const tokens = spaced.split(/\s+/).filter(t => t.length > 0 && !STOP_WORDS.has(t));

        // If all tokens removed (e.g. "Payment"), fallback to original cleaned
        let key = tokens.join(' ');
        if (!key) {
             key = lower.replace(/[^a-z0-9]/g, '').trim();
        }

        // 2. Fuzzy Match against existing keys
        let bestMatchKey: string | null = null;

        // Check for exact match first
        if (groups[key]) {
            bestMatchKey = key;
        } else {
            // Check against existing keys
            const existingKeys = Object.keys(groups);
            for (const existingKey of existingKeys) {
                // Heuristics:

                // A. Starts With (if significant length)
                // "netflix" vs "netflix movies" -> "netflix" match
                // Length check > 3 to avoid short prefix matches
                if (key.length > 3 && existingKey.length > 3) {
                     if (key.startsWith(existingKey) || existingKey.startsWith(key)) {
                         bestMatchKey = existingKey;
                         break;
                     }
                }

                // B. Levenshtein Distance (Typos)
                // Distance <= 1 is safe for most short words.
                // Distance <= 2 might be okay for longer words (len > 6).
                const dist = levenshteinDistance(key, existingKey);
                const maxLen = Math.max(key.length, existingKey.length);

                if (dist <= 1 || (dist <= 2 && maxLen > 6)) {
                    bestMatchKey = existingKey;
                    break;
                }
            }
        }

        if (bestMatchKey) {
            groups[bestMatchKey].push(tx);
        } else {
            groups[key] = [tx];
        }
    }

    return groups;
}

export function levenshteinDistance(a: string, b: string): number {
    const matrix = [];

    for (let i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }

    for (let j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }

    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1, // substitution
                    Math.min(
                        matrix[i][j - 1] + 1, // insertion
                        matrix[i - 1][j] + 1 // deletion
                    )
                );
            }
        }
    }

    return matrix[b.length][a.length];
}

interface PatternResult {
    averageAmount: number;
    nextDate: Date;
    confidence: number;
}

function analyzePattern(transactions: Transaction[]): PatternResult | null {
    // 1. Amount Consistency Check
    // Requirement: "Flag items where the amount is identical or within a 1% margin of error"
    // Strategy: Calculate average, then check if all variance <= 1%

    // Optimization: Use native integer arithmetic instead of Dinero.js for performance
    const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);
    const averageAmount = Math.round(totalAmount / transactions.length);

    // Check variance for each
    // 1% tolerance
    const toleranceAmount = Math.round(averageAmount * 0.01);

    const isAmountConsistent = transactions.every(t => {
        const diff = Math.abs(t.amount - averageAmount);
        return diff <= toleranceAmount;
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
