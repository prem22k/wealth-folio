import { Transaction, TaggingRule } from '@/types/schema';

/**
 * Auto Tagger Engine
 * 
 * Automatically assigns categories to transactions based on user-defined rules.
 * Intended to be run during import / parsing or strictly on demand.
 */
export function applyAutoCategorization(transactions: Transaction[], rules: TaggingRule[]): Transaction[] {
    if (!rules || rules.length === 0) return transactions;

    // Optimization: Pre-process rules into a simpler structure if needed.
    // However, given typical rule sets (< 100), simple iteration is plenty fast (O(N*M)).
    // N (Tx) ~ 1000, M (Rules) ~ 50 -> 50,000 ops -> < 1ms on V8.

    // We clone transactions to avoid mutation side-effects if this is used in UI state directly.
    return transactions.map(tx => {
        // If already categorized manually, do we overwrite? 
        // Requirement implies "Classification logic", so likely meant for "Uncategorized" or initial tagging.
        // But usually, smart taggers overwrite based on stronger rules. 
        // Let's assume we overwrite IF a rule matches, OR we can preserve if not "Uncategorized".
        // For now, strict rule application: If rule matches, tag it.

        const matchingRule = rules.find(rule => {
            const desc = tx.description.toLowerCase();
            const keyword = rule.keyword.toLowerCase();

            if (rule.matchType === 'exact') {
                return desc === keyword;
            } else {
                // 'contains'
                return desc.includes(keyword);
            }
        });

        if (matchingRule) {
            return {
                ...tx,
                category: matchingRule.targetCategory
            };
        }

        return tx;
    });
}
