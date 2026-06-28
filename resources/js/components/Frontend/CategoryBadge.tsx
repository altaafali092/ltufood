import { getCategoryStyles } from '@/lib/frontend/category-styles';

type CategoryBadgeProps = {
    category?: string;
};

export function CategoryBadge({ category }: CategoryBadgeProps) {
    if (!category) {
        return null;
    }

    const { pill, dot } = getCategoryStyles(category);

    return (
        <span
            className={`absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.1em] ${pill}`}
        >
            <span className={`w-1.5 h-1.5 rounded-full inline-block ${dot}`} />
            {category}
        </span>
    );
}
