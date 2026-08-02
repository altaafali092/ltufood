import { Auth } from './auth';

export type * from './auth';
export type * from './navigation';
export type * from './ui';

export type CartItem={
    id:number,
    food_item_id:number,
    quantity:number,
    price:number,
    slug:string,
    image:string,

}
export type SharedData = {
    name: string;
    auth: Auth;
    sidebarOpen: boolean;
    [key: string]: unknown;
    totalQuantity:number;
    totalPrice:number;
    cartItems:CartItem[];
};

export interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

export interface PaginatedData<T> {
    data: T[];
    current_page: number;
    last_page: number;
    total: number;
    from: number | null;
    to: number | null;
    links: PaginationLink[];
}