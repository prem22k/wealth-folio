"use server";

import { verifyIdToken } from "@/lib/firebase/auth-verify";
const pdfParse = require('@/lib/pdf-parse-custom.js');
import { parseWithGroq } from "@/lib/parsers/groq";
import { parseWithRegex } from "@/lib/parsers/sbi";
import { Transaction } from "@/types/schema";
import { validateUpload } from "@/lib/validators/upload";

export async function processStatement(formData: FormData) {
    try {
        const idToken = formData.get("idToken") as string;
        if (!idToken) {
            console.error("Missing ID Token");
            return { success: false, error: "Authentication required" };
        }

        const userId = await verifyIdToken(idToken);
        if (!userId) {
            console.error("Invalid ID Token");
            return { success: false, error: "Invalid or expired session" };
        }

        const file = formData.get("file") as File;
        const password = (formData.get("password") as string) || "";
        const mode = (formData.get("mode") as string) || "smart"; // 'fast' | 'smart'

        const validation = validateUpload(file);
        if (!validation.success) {
            return { success: false, error: validation.error };
        }

        const buffer = Buffer.from(await file.arrayBuffer());

        // 1. Extract Text
        const data = await pdfParse(buffer, {
            password: password,
            pagerender: (pageData: any) => pageData.getTextContent().then((t: any) => t.items.map((i: any) => i.str).join(" "))
        });

        // 2. Parse (Fast vs Smart)
        let rawTransactions = [];

        if (mode === 'fast') {
            console.log("Parsing with FAST Mode (Regex)");
            rawTransactions = parseWithRegex(data.text);
        } else {
            console.log("Parsing with SMART Mode (Groq Llama-3)");
            // Basic cleaning to optimize token usage for Groq
            const cleanedText = data.text.replace(/ +/g, ' ').replace(/\n\s*\n/g, '\n').trim();
            rawTransactions = await parseWithGroq(cleanedText);
        }

        // 3. Convert to Database Schema
        const transactions = rawTransactions.map((item: any) => {
            const paise = Math.round(item.amount * 100);
            return {
                date: new Date(item.date),
                description: item.description,
                amount: paise, // <--- MULTIPLY RUPEES BY 100 TO GET PAISE
                type: item.type.toLowerCase() as 'income' | 'expense' | 'transfer',
                category: item.category || "Uncategorized",
                source: "sbi-bank" as const,
                status: "verified" as const,
            };
        });

        return { success: true, count: transactions.length, data: transactions };

    } catch (error: any) {
        console.error("Upload Error:", error);
        const msg = error.name === 'PasswordException' || error.message?.includes('Password') ? "Incorrect Password" : "Processing Failed";
        return { success: false, error: msg };
    }
}
