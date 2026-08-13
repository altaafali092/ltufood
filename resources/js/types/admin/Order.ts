export interface User {
    id: number;
    name: string;
    email: string;
}

export interface Table {
    id: number;
    name: string; // or table_number
}

export interface FoodItem {
    id: number;
    title: string;
    image_url?: string;
}

export interface OrderItem {
    id: number;
    food_item_id: number;
    quantity: number;
    price_at_time: number;
    food_item?: FoodItem;
    total_price: number;
}

export interface OrderUser {
    id: number;
    order_number: string;
    order_type: 'dine_in' | 'takeaway' | 'delivery';
    status: 'pending' | 'processing' | 'completed' | 'cancelled';
    payment_method: 'esewa' | 'cash_at_reception' | 'card' | 'khalti' | null;
    payment_status: 'unpaid' | 'paid' | 'failed' | 'refunded'
    ;
    subtotal: number;
    discount_amount: number;
    tax_amount: number;
    total: number;
    mood?: string;
    notes?: string;
    created_at: string;
    customer?: User;
    table?: Table;
    items?: OrderItem[];
}
