export type RestaurantTable = {
    id: number;
    table_number: string;
    qr_uuid: string;
    qr_code_image: string | null;
    qr_url: string;
    qr_image_url: string | null;
    lat: string | null;
    lng: string | null;
    radius_meters: number;
    is_occupied: boolean;
    orders_count?: number;
    created_at: string;
    updated_at: string;
};
