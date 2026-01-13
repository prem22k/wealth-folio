// src/types/schema.ts

export type TransactionType = 'income' | 'expense' | 'transfer';
export type TransactionSource = 'sbi-bank' | 'hdfc-bank' | 'cash' | 'credit-card' | 'upi';
export type TransactionStatus = 'pending' | 'verified';

export interface Transaction {
  id?: string;             // Optional because new transactions won't have an ID yet
  userId: string;
  amount: number;          // STORE IN PAISE (e.g., 10000 = ₹100.00)
  date: Date;              // Firestore Timestamp converted to JS Date
  description: string;     // Raw text from bank (e.g., "UPI/1234/RAMESH")
  category: string;        // "Food", "Travel", "Uncategorized"
  type: TransactionType;
  source: TransactionSource;
  status: TransactionStatus;
  
  // The "Split Bill" Fix
  relatedTransactionId?: string; // If this is a refund/split, link it to the original
}

export interface TaggingRule {
  id?: string;
  userId: string;
  keyword: string;         // e.g., "SWIGGY"
  targetCategory: string;  // e.g., "Food & Dining"
  matchType: 'contains' | 'exact';
}

// Helper to prevent math errors
export const toPaise = (rupees: number) => Math.round(rupees * 100);
export const toRupees = (paise: number) => paise / 100;
