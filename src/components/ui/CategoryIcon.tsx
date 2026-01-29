import { ShoppingBag, Coffee, Car, Zap, User, ArrowRightLeft, HelpCircle } from "lucide-react";

const CATEGORY_STYLES: Record<string, { icon: any, color: string, bg: string }> = {
    Food: { icon: Coffee, color: "text-orange-400", bg: "bg-orange-400/10" },
    Travel: { icon: Car, color: "text-blue-400", bg: "bg-blue-400/10" },
    Bills: { icon: Zap, color: "text-yellow-400", bg: "bg-yellow-400/10" },
    Shopping: { icon: ShoppingBag, color: "text-pink-400", bg: "bg-pink-400/10" },
    Transfer: { icon: ArrowRightLeft, color: "text-purple-400", bg: "bg-purple-400/10" },
    People: { icon: User, color: "text-emerald-400", bg: "bg-emerald-400/10" },
    Uncategorized: { icon: HelpCircle, color: "text-slate-400", bg: "bg-slate-400/10" },
};

export function CategoryIcon({ category }: { category: string }) {
    const style = CATEGORY_STYLES[category] || CATEGORY_STYLES["Uncategorized"];
    const Icon = style.icon;

    return (
        <div className={`p-3 rounded-full ${style.bg} ${style.color}`}>
            <Icon size={20} />
        </div>
    );
}
