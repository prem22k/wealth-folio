'use server';

import { z } from 'zod';
import Groq from 'groq-sdk';
import { Transaction } from '@/types/schema';
import { isAfter, isBefore, parseISO } from 'date-fns';

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

// --- 1. Zod Schemas ---

const AmountFilterSchema = z.object({
    operator: z.enum(['gt', 'lt', 'eq', 'gte', 'lte']),
    value: z.number().describe("Amount in RUPEES")
});

const DateFilterSchema = z.object({
    startDate: z.string().optional().describe("ISO Date YYYY-MM-DD"),
    endDate: z.string().optional().describe("ISO Date YYYY-MM-DD")
});

export const FilterSchema = z.object({
    category: z.string().optional(),
    amount: AmountFilterSchema.optional(),
    date: DateFilterSchema.optional(),
    searchQuery: z.string().optional().describe("Text to match in description")
});

export type SmartFilter = z.infer<typeof FilterSchema>;

// --- 2. Server Action: Generate Filter ---

export async function generateTransactionFilter(userQuery: string): Promise<SmartFilter | null> {
    if (!process.env.GROQ_API_KEY) {
        console.error("Missing GROQ_API_KEY");
        return null;
    }

    const systemPrompt = `
    You are a query understander for a financial dashboard.
    Convert the user's natural language query into a structured JSON filter object.
    
    Current Date: ${new Date().toISOString().split('T')[0]} (Use this for relative dates like "last month")
    
    Output JSON strictly adhering to this schema:
    {
      "category": string (optional, Title Case),
      "amount": { "operator": "gt"|"lt"|"eq"|"gte"|"lte", "value": number (in Rupees) } (optional),
      "date": { "startDate": "YYYY-MM-DD", "endDate": "YYYY-MM-DD" } (optional),
      "searchQuery": string (optional, keywords to search in description)
    }
    
    Examples:
    - "Food orders above 500" -> { "category": "Food", "amount": { "operator": "gt", "value": 500 } }
    - "Uber rides" -> { "searchQuery": "Uber" } (Use searchQuery for vendors if generic category doesn't fit)
    - "Expenses last week" -> { "date": { "startDate": "...", "endDate": "..." } }
    
    Return ONLY JSON.
    `;

    try {
        const completion = await groq.chat.completions.create({
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userQuery }
            ],
            model: 'llama-3.3-70b-versatile',
            response_format: { type: 'json_object' },
            temperature: 0.1,
        });

        const content = completion.choices[0]?.message?.content;
        if (!content) return null;

        const parsed = JSON.parse(content);

        // Validate with Zod
        const result = FilterSchema.safeParse(parsed);

        if (result.success) {
            return result.data;
        } else {
            console.error("Filter Validation Failed:", result.error);
            return null;
        }

    } catch (error) {
        console.error("Smart Filter Error:", error);
        return null;
    }
}

// --- 3. Helper: Apply Filter ---

export function applyTransactionFilter(transactions: Transaction[], filter: SmartFilter): Transaction[] {
    return transactions.filter(tx => {
        // 1. Category Match
        if (filter.category && tx.category.toLowerCase() !== filter.category.toLowerCase()) {
            return false;
        }

        // 2. Search Query (Description Match)
        if (filter.searchQuery) {
            const query = filter.searchQuery.toLowerCase();
            if (!tx.description.toLowerCase().includes(query)) {
                return false;
            }
        }

        // 3. Amount Match (Note: tx.amount is in PAISE, filter.amount.value is in RUPEES)
        if (filter.amount) {
            const txAmountRupees = tx.amount / 100;
            const target = filter.amount.value;

            switch (filter.amount.operator) {
                case 'gt': if (!(txAmountRupees > target)) return false; break;
                case 'gte': if (!(txAmountRupees >= target)) return false; break;
                case 'lt': if (!(txAmountRupees < target)) return false; break;
                case 'lte': if (!(txAmountRupees <= target)) return false; break;
                case 'eq': if (Math.abs(txAmountRupees - target) > 0.1) return false; break; // Float tolerance
            }
        }

        // 4. Date Match
        if (filter.date) {
            const txDate = new Date(tx.date);

            if (filter.date.startDate) {
                const start = parseISO(filter.date.startDate);
                // Reset time to start of day for accurate comparison if needed, 
                // but usually just comparison is fine.
                // Ensuring strict day comparison might be needed.
                if (isBefore(txDate, start)) return false;
            }

            if (filter.date.endDate) {
                const end = parseISO(filter.date.endDate);
                // Set end date to end of day? 
                // Usually "until 2024-01-31" means inclusive of that day.
                // Let's assume the filter generator creates inclusive ranges.
                // We'll treat the boundary strictly.
                // If generated date is T00:00:00, and tx is T12:00:00 on same day,
                // isAfter(txDate, end) would be true (12:00 > 00:00).
                // So strictly, we should probably add 1 day to end date or compare YYYY-MM-DD strings.
                // For simplicity/robustness: compare date strings or normalized timestamps.

                // Better approach:
                const txDateStr = txDate.toISOString().split('T')[0];
                if (txDateStr > filter.date.endDate) return false;
            }
        }

        return true;
    });
}
