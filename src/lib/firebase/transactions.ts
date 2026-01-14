import { db } from './config';
import { Transaction } from '@/types/schema';
import { writeBatch, doc, collection } from 'firebase/firestore';

export async function saveBulkTransactions(userId: string, transactions: Partial<Transaction>[]): Promise<number> {
    const batch = writeBatch(db);
    let validCount = 0;
    let invalidCount = 0;
    const processedIds = new Set<string>();

    console.log(`Starting bulk save for ${transactions.length} transactions...`);

    transactions.forEach((txn) => {
        // 1. Sanitization & Validation
        let amount = Number(txn.amount);
        if (isNaN(amount)) {
            amount = 0;
            console.warn('Found NaN amount, defaulting to 0 for txn:', txn);
        }

        let date = txn.date instanceof Date ? txn.date : new Date(txn.date || Date.now());
        if (isNaN(date.getTime())) {
            date = new Date();
            console.warn('Found invalid date, defaulting to now for txn:', txn);
        }

        const description = txn.description || 'Unknown Transaction';
        const category = txn.category || 'Uncategorized';
        const type = txn.type === 'income' ? 'income' : 'expense';

        // 2. Deduplication Key
        // Create a unique key for this batch to avoid duplicates
        const uniqueKey = `${date.toISOString()}-${amount}-${description}`;

        if (processedIds.has(uniqueKey)) {
            console.log('Skipping duplicate in batch:', uniqueKey);
            return;
        }
        processedIds.add(uniqueKey);

        // 3. Add to Batch
        const ref = doc(collection(db, 'transactions'));
        const data = {
            amount,
            date,
            description,
            category,
            type,
            userId,
            createdAt: new Date(),
            status: 'verified' as const,
        };

        batch.set(ref, data);
        validCount++;
    });

    console.log(`Validation Complete: ${validCount} valid, ${invalidCount} invalid/duplicates.`);

    if (validCount > 0) {
        await batch.commit();
    }

    return validCount;
}
