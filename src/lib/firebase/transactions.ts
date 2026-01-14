import { db } from './config';
import { Transaction } from '@/types/schema';
import { writeBatch, doc, collection, deleteDoc, query, where, getDocs, getDoc } from 'firebase/firestore';

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
    const q = query(
        collection(db, 'transactions'),
        where('userId', '==', userId)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
        return 0;
    }

    // Firestore batch limit is 500
    const CHUNK_SIZE = 500;
    const totalDocs = snapshot.docs.length;
    let deletedCount = 0;

    for (let i = 0; i < totalDocs; i += CHUNK_SIZE) {
        const batch = writeBatch(db);
        const chunk = snapshot.docs.slice(i, i + CHUNK_SIZE);

        chunk.forEach(doc => {
            batch.delete(doc.ref);
        });

        await batch.commit();
        deletedCount += chunk.length;
    }

    return deletedCount;
}
