import Dinero from 'dinero.js';
import { Transaction } from '@/types/schema';

/**
 * Financial Math Safety Module
 * 
 * Wrapper around Dinero.js to ensure all arithmetic operations on financial data
 * are performed with precision, avoiding floating point errors.
 * 
 * All inputs/outputs are in PAISE (Integers).
 */

// Ensure we are working with INR for consistency, though math is currency-agnostic usually
const DEFAULT_CURRENCY = 'INR';

export function safeAdd(a: number, b: number): number {
    const d1 = Dinero({ amount: Math.round(a), currency: DEFAULT_CURRENCY });
    const d2 = Dinero({ amount: Math.round(b), currency: DEFAULT_CURRENCY });
    return d1.add(d2).getAmount();
}

export function safeSubtract(a: number, b: number): number {
    const d1 = Dinero({ amount: Math.round(a), currency: DEFAULT_CURRENCY });
    const d2 = Dinero({ amount: Math.round(b), currency: DEFAULT_CURRENCY });
    return d1.subtract(d2).getAmount();
}

/**
 * Validates that a transaction object adheres to strict data integrity rules.
 * 
 * Rules:
 * 1. Amount must be a safe integer (no floats allowed).
 * 2. Amount must not be NaN.
 * 
 * Throws Error if invalid.
 */
export function validateTransactionIntegrity(tx: Transaction): void {
    if (typeof tx.amount !== 'number') {
        throw new Error(`Data Integrity Error: Transaction ${tx.id || 'unknown'} amount is not a number.`);
    }

    if (Number.isNaN(tx.amount)) {
        throw new Error(`Data Integrity Error: Transaction ${tx.id || 'unknown'} amount is NaN.`);
    }

    if (!Number.isInteger(tx.amount)) {
        // This is the critical check for "Paise" storage. 
        // 100.50 is INVALID. Should be 10050.
        throw new Error(`Data Integrity Error: Transaction ${tx.id || 'unknown'} has floating point amount (${tx.amount}). Must be integer (Paise).`);
    }

    // Optional: Check Safe Integer bounds
    if (!Number.isSafeInteger(tx.amount)) {
        throw new Error(`Data Integrity Error: Transaction ${tx.id || 'unknown'} amount exceeds safe integer limits.`);
    }
}
