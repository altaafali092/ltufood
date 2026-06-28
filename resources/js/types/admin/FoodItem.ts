
import { SubCategory } from "./SubCategory";

export type FoodItem={
    sub_category_id:number;
    subCategory:SubCategory[];
    id:number;
    title:string;
    description:string;
    price:number;
    images:string[];
    formatted_images:string[];
    status:boolean;
    popularity_score:number;
    tags:string[];
}
