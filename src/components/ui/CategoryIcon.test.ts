import { describe, it } from 'node:test';
import assert from 'node:assert';
import { getCategoryStyle, CATEGORY_STYLES } from './category-styles.ts';

describe('CategoryIcon Logic', () => {
    it('should return correct style for "Food"', () => {
        const style = getCategoryStyle('Food');
        assert.strictEqual(style.color, 'text-orange-400');
        assert.strictEqual(style.bg, 'bg-orange-400/10');
        assert.ok(style.icon);
    });

    it('should return correct style for "Travel"', () => {
        const style = getCategoryStyle('Travel');
        assert.strictEqual(style.color, 'text-blue-400');
        assert.strictEqual(style.bg, 'bg-blue-400/10');
    });

    it('should return correct style for "Bills"', () => {
        const style = getCategoryStyle('Bills');
        assert.strictEqual(style.color, 'text-yellow-400');
        assert.strictEqual(style.bg, 'bg-yellow-400/10');
    });

    it('should return Uncategorized style for unknown category', () => {
        const style = getCategoryStyle('UnknownCategory123');
        assert.strictEqual(style.color, 'text-slate-400');
        assert.strictEqual(style.bg, 'bg-slate-400/10');
        // Ensure it matches the Uncategorized object specifically
        assert.deepStrictEqual(style, CATEGORY_STYLES['Uncategorized']);
    });

    it('should be case-sensitive (current behavior)', () => {
        const style = getCategoryStyle('food'); // lowercase 'f'
        // Currently, it defaults to Uncategorized because keys are case-sensitive
        assert.strictEqual(style.color, 'text-slate-400');
        assert.strictEqual(style.bg, 'bg-slate-400/10');
    });

    it('should handle empty string', () => {
        const style = getCategoryStyle('');
        assert.strictEqual(style.color, 'text-slate-400');
    });
});
