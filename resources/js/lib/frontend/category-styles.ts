const CATEGORY_STYLES: Record<string, { pill: string; dot: string }> = {
    Nepali: { pill: 'bg-orange-400/10 text-orange-400', dot: 'bg-orange-400' },
    Chinese: { pill: 'bg-red-400/10 text-red-400', dot: 'bg-red-400' },
    Italian: { pill: 'bg-green-400/10 text-green-400', dot: 'bg-green-400' },
    'Fast Food': { pill: 'bg-yellow-400/10 text-yellow-400', dot: 'bg-yellow-400' },
    Drinks: { pill: 'bg-blue-400/10 text-blue-400', dot: 'bg-blue-400' },
    Desserts: { pill: 'bg-fuchsia-400/10 text-fuchsia-400', dot: 'bg-fuchsia-400' },
};

const DEFAULT_STYLES = {
    pill: 'bg-slate-400/10 text-slate-400',
    dot: 'bg-slate-400',
};

export function getCategoryStyles(category?: string): { pill: string; dot: string } {
    return CATEGORY_STYLES[category ?? ''] ?? DEFAULT_STYLES;
}
