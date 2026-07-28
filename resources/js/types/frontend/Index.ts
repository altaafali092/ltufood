export type SubCategory = {
    id: number;
    title: string;
    description: string;
};

export interface FoodItem {
    id: number;
    title: string;
    slug: string;
    description: string | null;
    price: number;
    popularity_score: number;
    images: string[] | null;
    status: boolean;
    tags: string[] | null;
    sub_category?: SubCategory | null;
    subCategory?: SubCategory | null;
}

export type CartLine = {
    food_item_id: number;
    title: string;
    slug: string | null;
    price: number;
    quantity: number;
};

export type SharedCart = {
    items: Record<number, CartLine>;
    count: number;
    subtotal: number;
};
