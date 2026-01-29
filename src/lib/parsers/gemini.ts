import { GoogleGenerativeAI } from '@google/generative-ai';
import { redactPII } from '@/lib/security/redactor';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export async function parseWithAI(text: string): Promise<any[]> {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error("Missing GEMINI_API_KEY");
    }

    const redactedText = redactPII(text);

    const prompt = `
    You are a precise data extractor.
    Extract all financial transactions from the following bank statement text.
    
    Return ONLY a valid JSON array of objects. Do not wrap in markdown or code blocks.
    
    Schema for each transaction:
    - date: ISO string (YYYY-MM-DD). Assume year is 2025 based on the text.
    - description: Cleaned string (e.g., "Uber" instead of "UPI/DR/UBER..."). Title case.
    - amount: Number (Positive float in RUPEES. e.g., 73.00).
    - type: "income" or "expense".
    - category: Predict one of [Food, Travel, Bills, Shopping, Transfer, Uncategorized].
    
    Text to parse:
    ${redactedText}
  `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        let jsonString = response.text();

        // Cleanup: remove markdown code blocks if present
        jsonString = jsonString.replace(/```json/g, '').replace(/```/g, '').trim();

        // Parse JSON
        const transactions = JSON.parse(jsonString);

        if (!Array.isArray(transactions)) {
            throw new Error("AI response is not an array");
        }

        return transactions;
    } catch (error) {
        console.error("Gemini Parsing Error:", error);
        return [];
    }
}
