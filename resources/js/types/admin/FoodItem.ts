import { FoodCategory } from "./FoodCategory";

export type FoodItem={
    food_category_id:number;
    FoodCategory:FoodCategory[];
    id:number;
    title:string;
    description:string;
    price:number;
    images:string[];
    status:boolean;
    popularity_score:number;
    tags:string[];
}