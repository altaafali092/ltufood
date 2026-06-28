import { FoodCategory } from "./FoodCategory";

export type SubCategory = {
    id: number;
    food_category_id: number;
    title: string;
    slug: string;
    image: string;
    description: string;
    status: boolean;
    foodCategory: FoodCategory | null;
};
