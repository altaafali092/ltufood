export type SubCategory={
    id:number
    title:string
    description: string
}

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
    sub_category?:SubCategory[];
  }

