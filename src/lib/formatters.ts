export function cleanDescription(text: string): string {
    if (!text) return '';

    let cleaned = text;

    // Handle UPI Transactions
    // Format: UPI/DR/RefNo/NAME/... or UPI/CR/RefNo/NAME/...
    if (text.startsWith('UPI/')) {
        const parts = text.split('/');
        // Usually index 3 is the name: ["UPI", "DR", "123456", "NAME", ...]
        if (parts.length >= 4 && (parts[1] === 'DR' || parts[1] === 'CR')) {
            cleaned = parts[3];
        } else if (parts.length >= 3) {
            // Fallback for simpler formats if any: UPI/123/NAME
            cleaned = parts[2];
        }
    }

    // Remove common business entity suffixes to keep it short
    cleaned = cleaned
        .replace(/PRIVATE LIMITED/gi, '')
        .replace(/\bP\.?L\.?T\.?D\.?\b/gi, '') // P.L.T.D
        .replace(/\bL\.?T\.?D\.?\b/gi, '')     // L.T.D or LTD or Ltd
        .replace(/\bPVT\b/gi, '')
        .replace(/\bLIMITED\b/gi, '')
        .trim();

    // Title Case
    return toTitleCase(cleaned);
}

export function formatCurrency(amountPaise: number): string {
    const rupees = amountPaise / 100;
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 2,
    }).format(rupees);
}

function toTitleCase(str: string): string {
    return str.replace(
        /\w\S*/g,
        (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
}
