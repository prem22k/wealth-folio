import { Transaction } from '@/types/schema';
import { differenceInMilliseconds } from 'date-fns';

export interface AnomalyAlert {
    transactionId?: string;
    type: 'potential_duplicate' | 'statistical_outlier';
    severity: 'medium' | 'high';
    message: string;
    details?: any; // Flexible payload for UI rendering
}

/**
 * Anomaly Watchdog Engine
 * 
 * Heuristics:
 * 1. Duplicate Check: Identical amount + normalized desc within 24 hours.
 * 2. Statistical Outlier: > 2 Standard Deviations from category mean.
 */
export function detectAnomalies(transactions: Transaction[]): AnomalyAlert[] {
    const alerts: AnomalyAlert[] = [];

    // 1. Duplicate Detection
    const duplicateAlerts = detectDuplicates(transactions);
    alerts.push(...duplicateAlerts);

    // 2. Statistical Outlier Detection
    const outlierAlerts = detectOutliers(transactions);
    alerts.push(...outlierAlerts);

    return alerts;
}

// --- Logic Implementation ---

function detectDuplicates(transactions: Transaction[]): AnomalyAlert[] {
    const alerts: AnomalyAlert[] = [];
    // Sort by date ascending to use sliding window effectively
    const sorted = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Naive O(N^2) or Windowed O(N) Approach?
    // Since "within 24 hours" is the constraint, windowed is better, but simple loop with lookahead is fine for N < 10000.
    // We'll use a simple lookahead since user transaction lists are usually < 5000/year.

    for (let i = 0; i < sorted.length; i++) {
        const current = sorted[i];
        const currentDate = new Date(current.date);

        // Look ahead
        for (let j = i + 1; j < sorted.length; j++) {
            const next = sorted[j];
            const nextDate = new Date(next.date);

            // Check time difference
            const diffMs = differenceInMilliseconds(nextDate, currentDate);
            const hoursDiff = diffMs / (1000 * 60 * 60);

            if (hoursDiff > 24) {
                // Since sorted, no need to look further
                break;
            }

            // Check Duplication Criteria
            if (
                current.amount === next.amount &&
                normalize(current.description) === normalize(next.description) &&
                current.type === next.type // Ensure same direction (expense vs expense)
            ) {
                alerts.push({
                    transactionId: next.id, // Flag the LATER one
                    type: 'potential_duplicate',
                    severity: 'medium',
                    message: 'Potential duplicate transaction detected.',
                    details: {
                        originalDate: current.date,
                        duplicateDate: next.date,
                        amount: current.amount,
                        cleanDescription: normalize(current.description)
                    }
                });
            }
        }
    }

    return alerts;
}

function detectOutliers(transactions: Transaction[]): AnomalyAlert[] {
    const alerts: AnomalyAlert[] = [];

    // Group by Category
    const byCategory: Record<string, number[]> = {};

    // First pass: collect amounts
    transactions.forEach(t => {
        // Only check Expenses for now (Logic implies "Cost detector")
        if (t.type === 'expense') {
            if (!byCategory[t.category]) byCategory[t.category] = [];
            byCategory[t.category].push(t.amount);
        }
    });

    // Calculate Stats per Category
    const stats: Record<string, { mean: number; stdDev: number }> = {};

    Object.entries(byCategory).forEach(([cat, amounts]) => {
        if (amounts.length < 5) return; // Need minimum sample size

        const mean = amounts.reduce((a, b) => a + b, 0) / amounts.length;

        const variance = amounts.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / amounts.length;
        const stdDev = Math.sqrt(variance);

        stats[cat] = { mean, stdDev };
    });

    // Second Pass: Flag Outliers
    transactions.forEach(t => {
        if (t.type !== 'expense') return;

        // Skip uncategorized (?) - maybe keep them
        const stat = stats[t.category];
        if (!stat) return;

        // > 2 StdDev
        const limit = stat.mean + (2 * stat.stdDev);

        // We only care about unusually HIGH expenses
        // AND: Practical check - amount must be at least 20% higher than mean to avoid flagging 
        // small deviations in very stable categories (e.g. fixed 45000 vs 46000 is high Z-score but low impact)
        if (t.amount > limit && t.amount > stat.mean * 1.2) {
            // Check severity
            // > 3 StdDev = High
            const isHighSeverity = t.amount > (stat.mean + (3 * stat.stdDev));

            alerts.push({
                transactionId: t.id,
                type: 'statistical_outlier',
                severity: isHighSeverity ? 'high' : 'medium',
                message: `Unusually high ${t.category} expense detected.`,
                details: {
                    amount: t.amount,
                    categoryMean: stat.mean,
                    categoryStdDev: stat.stdDev,
                    zScore: (t.amount - stat.mean) / stat.stdDev
                }
            });
        }
    });

    return alerts;
}

// Helper
function normalize(str: string): string {
    return str.toLowerCase().replace(/[^a-z0-9]/g, '').trim();
}
