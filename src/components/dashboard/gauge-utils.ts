/**
 * Calculates the strokeDashoffset for the gauge circle.
 *
 * Logic:
 * Circumference = 2 * pi * 45 ≈ 283
 * Offset = 283 - (283 * percentage)
 * Maps calculated months to max 12 months for circle.
 */
export function calculateStrokeDashoffset(months: number): number {
    const circumference = 283;
    const maxMonths = 12;
    // Cap at 12 months for 100% circle
    const percentage = Math.min(months, maxMonths) / maxMonths;
    return circumference - (circumference * percentage);
}
