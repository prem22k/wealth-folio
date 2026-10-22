import { Transaction } from '@/types/schema';
import { subMonths } from 'date-fns';

// A type alias (not an interface) so it is assignable to recharts' Record<string, unknown> data prop.
export type CategorySpend = {
    name: string;
    value: number; // in Rupees
};

export interface MonthlyCashFlow {
    name: string;
    income: number; // in Rupees
    expense: number; // in Rupees
}

function ensureDate(val: any): Date {
    if (val instanceof Date) return val;
    if (val && typeof val.toDate === 'function') return val.toDate();
    if (val && typeof val.seconds === 'number') return new Date(val.seconds * 1000);
    return new Date(val);
}

/**
 * Format rupees with compact unit suffix (e.g., ₹12.4k, ₹28k, ₹450).
 */
export function formatRupeesCompact(amountInRupees: number): string {
    const abs = Math.abs(amountInRupees);
    let str = '';
    if (abs >= 10000000) {
        str = `${(abs / 10000000).toFixed(1).replace(/\.0$/, '')}Cr`;
    } else if (abs >= 1000) {
        str = `${(abs / 1000).toFixed(1).replace(/\.0$/, '')}k`;
    } else {
        str = `${Math.round(abs)}`;
    }
    return `${amountInRupees < 0 ? '-' : ''}₹${str}`;
}

/**
 * Calculates expense totals grouped by category for transactions in the past N days.
 * Returns the top 6 categories by spend (descending) + an "Other" category for any remainder.
 */
export function calculateCategorySpend(
    transactions: Transaction[],
    days: number,
    referenceDate: Date = new Date()
): CategorySpend[] {
    const refTime = referenceDate.getTime();
    const cutoffTime = refTime - days * 24 * 60 * 60 * 1000;
    const categoryTotals: Record<string, number> = {};

    for (const tx of transactions) {
        if (tx.type !== 'expense') continue;
        const txDate = ensureDate(tx.date);
        const txTime = txDate.getTime();
        if (isNaN(txTime)) continue;

        if (txTime >= cutoffTime && txTime <= refTime) {
            const cat = tx.category?.trim() || 'Uncategorized';
            categoryTotals[cat] = (categoryTotals[cat] || 0) + tx.amount;
        }
    }

    const sorted = Object.entries(categoryTotals)
        .map(([name, paise]) => ({
            name,
            value: Math.round(paise / 100), // convert to rupees
        }))
        .filter(item => item.value > 0)
        .sort((a, b) => b.value - a.value);

    if (sorted.length <= 6) {
        return sorted;
    }

    const top6 = sorted.slice(0, 6);
    const otherTotal = sorted.slice(6).reduce((acc, curr) => acc + curr.value, 0);

    if (otherTotal > 0) {
        top6.push({ name: 'Other', value: otherTotal });
    }

    return top6;
}

/**
 * Calculates monthly income vs. expense totals in rupees for the last 6 calendar months.
 * Returns an array ordered chronologically from 5 months ago to current month.
 */
export function calculateCashFlowVelocity(
    transactions: Transaction[],
    referenceDate: Date = new Date()
): MonthlyCashFlow[] {
    const months: { name: string; year: number; month: number }[] = [];
    for (let i = 5; i >= 0; i--) {
        const d = subMonths(referenceDate, i);
        months.push({
            name: d.toLocaleString('en-US', { month: 'short' }),
            year: d.getFullYear(),
            month: d.getMonth(),
        });
    }

    return months.map(m => {
        let incomePaise = 0;
        let expensePaise = 0;

        for (const tx of transactions) {
            const txDate = ensureDate(tx.date);
            if (isNaN(txDate.getTime())) continue;

            if (txDate.getFullYear() === m.year && txDate.getMonth() === m.month) {
                if (tx.type === 'income') {
                    incomePaise += tx.amount;
                } else if (tx.type === 'expense') {
                    expensePaise += tx.amount;
                }
            }
        }

        return {
            name: m.name,
            income: Math.round(incomePaise / 100),
            expense: Math.round(expensePaise / 100),
        };
    });
}
