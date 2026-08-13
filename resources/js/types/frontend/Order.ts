import { FoodItem } from "./Index";

export type OrderItem = {

    id: number;
    food_item_id: number;
    quantity: number;
    price_at_time: number;
    total_price: number;
    food_item?: FoodItem[];

}
export type Table = {
    id: number;
    name: string;
    qr_uuid:string
}
export type Order = {
    id: number;
    order_number: string;
    status: 'Pending' | 'Preparing' | 'Ready' | 'Served' | 'Paid' | 'Cancelled';
    payment_status: 'paid' | 'unpaid';
    payment_method: string;
    order_type: string;
    subtotal: number;
    discount_amount: number;
    total: number;
    created_at: string;
    table?: Table;
    items: OrderItem[];
}
