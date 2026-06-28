export type MenuCategory = {
    id: number;
    title: string;
};

export type MenuItem = {
    id: number;
    title: string;
    description: string;
    price: number;
    popularity_score: number;
    foodCategory?: MenuCategory;
    emoji: string;
};

export type CartItem = MenuItem & { qty: number };

export type CartState = Record<number, CartItem>;
