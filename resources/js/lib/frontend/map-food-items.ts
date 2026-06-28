import type { FoodItem } from '@/types/admin/FoodItem';
import type { SubCategory } from '@/types/admin/SubCategory';
import type { MenuItem } from '@/types/frontend/menu';

const DEFAULT_EMOJI = '🍽️';

function resolveSubCategory(subCategory: FoodItem['subCategory']): SubCategory | null {
    if (!subCategory) {
        return null;
    }

    if (Array.isArray(subCategory)) {
        return subCategory[0] ?? null;
    }

    return subCategory;
}

export function mapFoodItemsToMenu(items: FoodItem[]): MenuItem[] {
    return items
        .filter((item) => item.status)
        .map((item) => {
            const subCategory = resolveSubCategory(item.subCategory);
            const foodCategory = subCategory?.foodCategory
                ? { id: subCategory.foodCategory.id, title: subCategory.foodCategory.title }
                : subCategory
                  ? { id: subCategory.id, title: subCategory.title }
                  : undefined;

            return {
                id: item.id,
                title: item.title,
                description: item.description ?? '',
                price: Number(item.price),
                popularity_score: item.popularity_score ?? 0,
                foodCategory,
                emoji: DEFAULT_EMOJI,
            };
        });
}
