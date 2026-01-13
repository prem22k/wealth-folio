import { db } from './config';
import { Transaction } from '@/types/schema';
import { writeBatch, doc, collection } from 'firebase/firestore';

export async function saveBulkTransactions(userId: string, transactions: Partial<Transaction>[]): Promise<number> {
    const batch = writeBatch(db);

    transactions.forEach((txn) => {
        const ref = doc(collection(db, 'transactions'));
        const data = {
            ...txn,
            userId,
            createdAt: new Date(),
            status: 'verified' as const,
        };
        batch.set(ref, data);
    });

    await batch.commit();
    return transactions.length;
}
