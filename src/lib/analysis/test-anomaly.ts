
import { detectAnomalies, AnomalyAlert } from './anomaly-engine';
import { Transaction } from '@/types/schema';

// Helper
const createTx = (id: string, desc: string, amount: number, dateStr: string, category: string): Transaction => ({
    id,
    userId: 'test',
    description: desc,
    amount: amount, // in paise
    date: new Date(dateStr),
    category: category,
    type: 'expense',
    source: 'hdfc-bank',
    status: 'verified'
});

const mockTransactions: Transaction[] = [
    // --- Duplicate Scenarios ---
    // 1. Exact Duplicate within 12 hours (Should Duplicate Alert)
    createTx('1', 'Uber Ride', 45000, '2024-01-01T10:00:00Z', 'Transport'),
    createTx('2', 'Uber Ride', 45000, '2024-01-01T20:00:00Z', 'Transport'),

    // 2. Exact Duplicate but 48 hours apart (Should NOT Alert)
    createTx('3', 'Uber Ride', 45000, '2024-01-05T10:00:00Z', 'Transport'),
    createTx('4', 'Uber Ride', 45000, '2024-01-07T10:00:00Z', 'Transport'),

    // 3. Different amounts (Should NOT Alert)
    createTx('5', 'Uber Ride', 45000, '2024-01-10T10:00:00Z', 'Transport'),
    createTx('6', 'Uber Ride', 46000, '2024-01-10T12:00:00Z', 'Transport'),

    // --- Outlier Scenarios (Category: Food) ---
    // Baseline Food transactions (Mean ~ 500, StdDev low)
    createTx('10', 'Zomato', 50000, '2024-01-01', 'Food'),
    createTx('11', 'Swiggy', 55000, '2024-01-02', 'Food'),
    createTx('12', 'KFC', 48000, '2024-01-03', 'Food'),
    createTx('13', 'Burger King', 52000, '2024-01-04', 'Food'),
    createTx('14', 'Pizza Hut', 50000, '2024-01-05', 'Food'),
    createTx('15', 'Dominos', 51000, '2024-01-06', 'Food'),

    // The Outlier: 2500 (5x Mean)
    createTx('99', 'Luxury Dinner', 250000, '2024-01-07', 'Food'),
];

console.log("Running Anomaly Watchdog...");
const alerts = detectAnomalies(mockTransactions);

console.log(`Found ${alerts.length} alerts.`);
alerts.forEach(a => {
    console.log(`[${a.type.toUpperCase()}] Severity: ${a.severity} | Msg: ${a.message}`);
    if (a.details) console.log(`   Details:`, JSON.stringify(a.details));
});

// Verification Asserts
const duplicate = alerts.find(a => a.type === 'potential_duplicate' && a.transactionId === '2');
const outlier = alerts.find(a => a.type === 'statistical_outlier' && a.transactionId === '99');

if (duplicate && outlier && alerts.length === 2) {
    console.log("\n✅ SUCCESS: Anomalies detected correctly.");
} else {
    console.log("\n❌ FAILED: Detection mismatch.");
    if (!duplicate) console.log("Missing Duplicate Alert (ID 2)");
    if (!outlier) console.log("Missing Outlier Alert (ID 99)");
    console.log(`Expected 2 alerts, got ${alerts.length}`);
}
