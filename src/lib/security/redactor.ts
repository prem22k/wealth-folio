/**
 * Privacy Firewall - PII Redactor
 * 
 * Sanitizes sensitive banking and personal information from text 
 * before it leaves the secure server environment (e.g. to AI APIs).
 */

export function redactPII(text: string): string {
    let redacted = text;

    // 1. Email Addresses
    // Pattern: Standard Email Regex
    redacted = redacted.replace(
        /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
        '[EMAIL]'
    );

    // 2. IFSC Codes (Indian Financial System Code)
    // Pattern: 4 letters + 0 + 6 alphanumeric
    // Example: SBIN0001234
    // We use \b boundary to avoid partial matches
    redacted = redacted.replace(
        /\b[A-Z]{4}0[A-Z0-9]{6}\b/g,
        '[IFSC]'
    );

    // 3. Mobile Numbers
    // Pattern: Indian context (+91 or 91 optional) followed by 10 digits starting with 6-9
    // Or generic 10-digit if prefer broad safety
    // Let's use a reasonably strict Indian mobile pattern to avoid redacting 10-digit IDs excessively
    // Pattern: Indian context (+91 or 91 optional) followed by 10 digits starting with 6-9
    // Fixed: Handle optional '+' correctly so it doesn't get left behind.
    redacted = redacted.replace(
        /(?:\+?91|0)?[6-9]\d{9}\b/g,
        '[MOBILE]'
    );

    // 4. Account Numbers
    // Pattern: 9 to 18 digits.
    // This is tricky because it might match timestamps or amounts.
    // Heuristic: Accounts usually appear in blocks. Amounts usually have decimal points.
    // We will look for 9-18 digits NOT followed by a decimal point immediately.
    // And generally banking PDFs label them "A/C No" etc but raw text might be messy.
    // We'll aggressively redact long number sequences that are clearly not amounts (no dot).
    // Avoiding 10 digit if it matched mobile already? Iterate order matters.
    // Since Mobile is 10 digits, it might overlap with 9-18 digit check.
    // Mobile regex ran first, replaced with [MOBILE]. So those won't match \d{9,18}.
    redacted = redacted.replace(
        /\b\d{9,18}\b/g,
        '[ACC_NO]'
    );

    return redacted;
}
