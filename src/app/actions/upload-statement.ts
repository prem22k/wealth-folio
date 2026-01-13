'use server';



const pdfParse = require('@/lib/pdf-parse-custom.js');
import { parseSBIText } from "@/lib/parsers/sbi";

export async function processStatement(formData: FormData) {
    try {
        const file = formData.get("file") as File;
        const password = (formData.get("password") as string) || "";

        if (!file) {
            return { success: false, error: "No file uploaded" };
        }

        // 1. Convert File to Buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // 2. Prepare Options (Password)
        const options = {
            password: password,
            // Helper to fix some PDF reading edge cases
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            pagerender: function (pageData: any) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                return pageData.getTextContent().then(function (textContent: any) {
                    let lastY, text = '';
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    for (const item of textContent.items) {
                        // Check if items are heavily aligned (within 10 units Y-axis difference)
                        // If they are on the same "line" visual, we append with space/tab
                        // Otherwise newline
                        if (!lastY || Math.abs(item.transform[5] - lastY) < 10) {
                            text += item.str + ' '; // Add space separator
                        } else {
                            text += '\n' + item.str + ' ';
                        }
                        lastY = item.transform[5];
                    }
                    return text;
                });
            }
        };

        // 3. Parse (The line that was failing)
        // We add a safety check just in case the import is still acting weird
        let data;
        try {
            data = await pdfParse(buffer, options);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (parseError: any) {
            // Handle Password Error specifically
            if (parseError.name === 'PasswordException' || parseError.message?.includes('Password')) {
                return { success: false, error: "INCORRECT PASSWORD: check your email (Last 5 digits mobile + DDMMYY)" };
            }
            throw parseError; // Re-throw other errors
        }

        console.log("PDF Parsed successfully. Text length:", data.text.length);
        console.log("Extracted Text Preview (First 20000 chars):\n", data.text.substring(0, 20000));

        // 4. Extract Transactions
        const transactions = parseSBIText(data.text);

        return { success: true, count: transactions.length, data: transactions };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        console.error("Statement Processing Error:", error);
        return { success: false, error: error.message || "Failed to process statement" };
    }
}
