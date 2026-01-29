import Groq from 'groq-sdk';

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

export async function parseWithGroq(text: string): Promise<any[]> {
    if (!process.env.GROQ_API_KEY) {
        throw new Error("Missing GROQ_API_KEY");
    }

    const systemPrompt = `You are a precise data extraction engine. You output strict JSON only. 
    You are an expert at parsing messy bank statement text into structured data.`;

    const userPrompt = `
    Extract all financial transactions from the following bank statement text.
    
    Return ONLY a valid JSON array of objects.
    
    Schema for each transaction:
    - date: ISO string (YYYY-MM-DD). Assume year is 2025 based on the text.
    - description: Cleaned string (e.g., "Uber" instead of "UPI/DR/UBER..."). Title case.
    - amount: Number (Positive float in RUPEES. e.g., 73.00).
    - type: "income" or "expense".
    - category: Predict one of [Food, Travel, Bills, Shopping, Transfer, Uncategorized].
    
    Text to parse:
    ${text}
    `;

    try {
        const completion = await groq.chat.completions.create({
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ],
            model: 'llama-3.3-70b-versatile',
            response_format: { type: 'json_object' },
            temperature: 0.1, // Low temperature for consistency
        });

        const jsonString = completion.choices[0]?.message?.content;

        if (!jsonString) {
            throw new Error("No content received from Groq");
        }

        // Parse JSON
        // Groq with json_object mode might return { "transactions": [...] } or just [...]
        // But usually it returns exactly what is asked. 
        // Let's safe parse.
        const parsed = JSON.parse(jsonString);

        // Handle case where it wraps in a root key like { "result": [...] } or { "transactions": [...] }
        if (Array.isArray(parsed)) {
            return parsed;
        } else if (typeof parsed === 'object' && parsed !== null) {
            // Try to find the first array value
            const arrayValue = Object.values(parsed).find(val => Array.isArray(val));
            if (arrayValue) return arrayValue;
        }

        throw new Error("Groq response is not an array");

    } catch (error) {
        console.error("Groq Parsing Error:", error);
        throw error;
    }
}
