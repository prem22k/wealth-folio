import { db } from './config';
import { Transaction } from '@/types/schema';
import { writeBatch, doc, collection, deleteDoc, query, where, getDocs, getDoc, limit } from 'firebase/firestore';

export async function saveBulkTransactions(userId: string, transactions: Partial<Transaction>[]): Promise<number> {
    let validCount = 0;
    const processedIds = new Set<string>();

    console.log(`Starting bulk save for ${transactions.length} transactions...`);

    const BATCH_LIMIT = 500;
    let batch = writeBatch(db);
    let batchOpCount = 0;

    for (const txn of transactions) {
        // 1. Sanitization & Validation
        let amount = Number(txn.amount);
        if (isNaN(amount)) {
            amount = 0;
            console.warn('Found NaN amount, defaulting to 0 for txn:', txn);
        }

        let date: Date;
        if (txn.date instanceof Date) {
            date = txn.date;
        } else if (txn.date && typeof (txn.date as any).toDate === 'function') {
            date = (txn.date as any).toDate();
        } else if (txn.date && typeof (txn.date as any).seconds === 'number') {
            date = new Date((txn.date as any).seconds * 1000);
        } else {
            date = new Date(txn.date || Date.now());
        }

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
            continue;
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
        batchOpCount++;

        if (batchOpCount >= BATCH_LIMIT) {
            await batch.commit();
            batch = writeBatch(db);
            batchOpCount = 0;
        }
    }

    console.log(`Validation Complete: ${validCount} valid.`);

    if (batchOpCount > 0) {
        await batch.commit();
    }

    return validCount;
}

export async function deleteTransaction(userId: string, transactionId: string): Promise<void> {
    const ref = doc(db, 'transactions', transactionId);
    const snapshot = await getDoc(ref);

    if (!snapshot.exists()) return;

    const data = snapshot.data();
    if (data.userId !== userId) {
        throw new Error("Unauthorized: Cannot delete transaction belonging to another user");
    }

    await deleteDoc(ref);
}

export async function clearHistory(userId: string): Promise<number> {
    let deletedCount = 0;
    const BATCH_SIZE = 500;

    while (true) {
        const q = query(
            collection(db, 'transactions'),
            where('userId', '==', userId),
            limit(BATCH_SIZE)
        );

        const snapshot = await getDocs(q);
        const size = snapshot.size;

        if (size === 0) {
            break;
        }

        const batch = writeBatch(db);
        snapshot.docs.forEach((doc) => {
            batch.delete(doc.ref);
        });

        await batch.commit();
        deletedCount += size;

        if (size < BATCH_SIZE) {
            break;
        }
    }

    return deletedCount;
}
