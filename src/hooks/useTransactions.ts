'use client';

import { useState, useEffect, useMemo } from 'react';
import { db } from '@/lib/firebase/config';
import { collection, query, where, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';
import { Transaction, toRupees } from '@/types/schema';

interface TransactionState {
    transactions: Transaction[];
    loading: boolean;
    error: string | null;
}

export function useTransactions(userId: string | undefined, startDate?: Date, endDate?: Date) {
    const [state, setState] = useState<TransactionState>({
        transactions: [],
        loading: true,
        error: null,
    });

    useEffect(() => {
        if (!userId) {
            setState({
                transactions: [],
                loading: false,
                error: null,
            });
            return;
        }

        let q = query(
            collection(db, 'transactions'),
            where('userId', '==', userId),
            orderBy('date', 'desc')
        );

        if (startDate && endDate) {
            q = query(
                collection(db, 'transactions'),
                where('userId', '==', userId),
                where('date', '>=', startDate),
                where('date', '<=', endDate),
                orderBy('date', 'desc')
            );
        }

        const unsubscribe = onSnapshot(q,
            (snapshot) => {
                const transactions = snapshot.docs.map(doc => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        ...data,
                        // Handle Firestore Timestamp conversion
                        date: data.date instanceof Timestamp ? data.date.toDate() : new Date(data.date),
                    } as Transaction;
                });

                setState({
                    transactions,
                    loading: false,
                    error: null
                });
            },
            (error) => {
                console.error("Error fetching transactions:", error);

                // Friendly error for missing index
                if (error.message.includes('requires an index')) {
                    console.warn("Missing Index Link:", error.message);
                }

                setState(prev => ({
                    ...prev,
                    loading: false,
                    error: "Failed to load transactions"
                }));
            }
        );

        return () => unsubscribe();
    }, [userId, startDate, endDate]);

    const totals = useMemo(() => {
        const income = state.transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);

        const expense = state.transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);

        return {
            totalIncome: toRupees(income),
            totalExpense: toRupees(expense),
            netBalance: toRupees(income - expense)
        };
    }, [state.transactions]);

    return { ...state, ...totals };
}
