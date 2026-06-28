import { useMemo, useState } from 'react';
import type { MenuItem } from '@/types/frontend/menu';

export function useMenuFilters(menuItems: MenuItem[]) {
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('All');

    const categories = useMemo(() => {
        const names = menuItems
            .map((item) => item.foodCategory?.title)
            .filter((title): title is string => Boolean(title));

        return ['All', ...Array.from(new Set(names))];
    }, [menuItems]);

    const filtered = useMemo(() => {
        const term = search.trim().toLowerCase();

        return menuItems.filter((item) => {
            const inCategory = category === 'All' || item.foodCategory?.title === category;
            const inSearch =
                !term ||
                item.title.toLowerCase().includes(term) ||
                item.description?.toLowerCase().includes(term);

            return inCategory && inSearch;
        });
    }, [menuItems, search, category]);

    const popular = useMemo(
        () =>
            [...menuItems]
                .sort((a, b) => (b.popularity_score ?? 0) - (a.popularity_score ?? 0))
                .slice(0, 4),
        [menuItems],
    );

    return {
        search,
        setSearch,
        category,
        setCategory,
        categories,
        filtered,
        popular,
    };
}
