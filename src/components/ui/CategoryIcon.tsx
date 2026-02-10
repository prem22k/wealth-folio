import { getCategoryStyle } from "./category-styles";

export function CategoryIcon({ category }: { category: string }) {
    const style = getCategoryStyle(category);
    const Icon = style.icon;

    return (
        <div className={`p-3 rounded-full ${style.bg} ${style.color}`}>
            <Icon size={20} />
        </div>
    );
}
