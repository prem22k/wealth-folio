import { Transaction } from '@/types/schema';
import { differenceInHours, parseISO } from 'date-fns';

export interface Anomaly {
    id: string; // Unique ID for the anomaly event
    type: 'duplicate' | 'deviation';
    severity: 'high' | 'medium' | 'low';
    title: string;
    description: string;
    date: Date;
    amount: number; // The amount involved
    metadata?: Record<string, any>; // Extra info like "2x duplicate" or "200% over average"
}

/**
 * Detects duplicate transactions.
 * Criteria: Same amount, same description (fuzzy match), within 24 hours.
 */
export function detectDuplicates(transactions: Transaction[]): Anomaly[] {
    const anomalies: Anomaly[] = [];
    const sorted = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    for (let i = 0; i < sorted.length - 1; i++) {
        const current = sorted[i];
        const next = sorted[i + 1];

        // Ensure valid dates
        if (!current.date || !next.date) continue;

        const timeDiff = Math.abs(differenceInHours(new Date(current.date), new Date(next.date)));

        // Check for duplicate:
        // 1. Same Amount
        // 2. Similar Description (exact for now)
        // 3. Within 24 hours (usually duplicates happen instantly, but double posting can happen same day)
        if (
            current.amount === next.amount &&
            current.description.trim().toLowerCase() === next.description.trim().toLowerCase() &&
            timeDiff < 24 &&
            current.type === 'expense' // Only care about expense duplicates mostly
        ) {
            anomalies.push({
                id: `dup-${current.id}-${next.id}`,
                type: 'duplicate',
                severity: 'high',
                title: 'Duplicate Charge',
                description: `Double processing detected on ${current.description}.`,
                date: new Date(next.date),
                amount: current.amount,
                metadata: {
                    multiplier: 2,
                    originalId: current.id,
                    duplicateId: next.id
                }
            });
            // Skip next one to avoid double counting the pair
            i++;
        }
    }
    return anomalies;
}

/**
 * Detects cost deviations.
 * Criteria: Transaction amount > 2 standard deviations above the mean for that vendor.
 */
export function detectDeviations(transactions: Transaction[]): Anomaly[] {
    const anomalies: Anomaly[] = [];

    // Group by vendor (normalized)
    const groups: Record<string, Transaction[]> = {};
    for (const tx of transactions) {
        if (tx.type !== 'expense') continue;
        const key = tx.description.trim().toLowerCase(); // Simple normalization
        if (!groups[key]) groups[key] = [];
        groups[key].push(tx);
    }

    for (const [vendor, txs] of Object.entries(groups)) {
        if (txs.length < 3) continue; // Need data to establish pattern

        // Calculate Mean
        const total = txs.reduce((sum, t) => sum + t.amount, 0);
        const mean = total / txs.length;

        // Calculate Standard Deviation
        const variance = txs.reduce((sum, t) => sum + Math.pow(t.amount - mean, 2), 0) / txs.length;
        const stdDev = Math.sqrt(variance);

        // Find outliers
        // Limit: Amount > Mean + 2 * StdDev
        // And ensure it's a significant amount (e.g. at least 100rs difference) to avoid noise on small items
        const threshold = mean + (2 * stdDev);

        txs.forEach(tx => {
            if (tx.amount > threshold && tx.amount > mean * 1.5) { // At least 50% higher
                const percentage = Math.round(((tx.amount - mean) / mean) * 100);
                anomalies.push({
                    id: `dev-${tx.id}`,
                    type: 'deviation',
                    severity: 'medium',
                    title: 'Cost Deviation',
                    description: `${vendor} spend ${percentage}% above average.`,
                    date: new Date(tx.date),
                    amount: tx.amount,
                    metadata: {
                        mean,
                        stdDev,
                        percentage
                    }
                });
            }
        });
    }

    return anomalies;
}

export function runAnomalyDetection(transactions: Transaction[]): Anomaly[] {
    const duplicates = detectDuplicates(transactions);
    const deviations = detectDeviations(transactions);
    return [...duplicates, ...deviations].sort((a, b) => b.date.getTime() - a.date.getTime());
}
