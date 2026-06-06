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
    // Clamp to [0, maxMonths]: negative debt scenarios show empty gauge, infinity shows full
    const clamped = Math.max(0, Math.min(isNaN(months) ? maxMonths : months, maxMonths));
    const percentage = clamped / maxMonths;
    return circumference - (circumference * percentage);
}
