import { useMemo, useState } from 'react';
import type { CartState, MenuItem } from '@/types/frontend/menu';

export function useCart() {
    const [cart, setCart] = useState<CartState>({});
    const [cartOpen, setCartOpen] = useState(false);
    const [ordered, setOrdered] = useState(false);

    const addToCart = (item: MenuItem) => {
        setCart((previous) => ({
            ...previous,
            [item.id]: {
                ...item,
                qty: (previous[item.id]?.qty || 0) + 1,
            },
        }));
    };

    const removeFromCart = (id: number) => {
        setCart((previous) => {
            const updated = { ...previous };

            if (updated[id]?.qty > 1) {
                updated[id] = { ...updated[id], qty: updated[id].qty - 1 };
            } else {
                delete updated[id];
            }

            return updated;
        });
    };

    const placeOrder = () => {
        setOrdered(true);
        setTimeout(() => {
            setCart({});
            setOrdered(false);
            setCartOpen(false);
        }, 3200);
    };

    const totalItems = useMemo(
        () => Object.values(cart).reduce((sum, item) => sum + item.qty, 0),
        [cart],
    );

    const subtotal = useMemo(
        () => Object.values(cart).reduce((sum, item) => sum + item.price * item.qty, 0),
        [cart],
    );

    return {
        cart,
        cartOpen,
        setCartOpen,
        ordered,
        addToCart,
        removeFromCart,
        placeOrder,
        totalItems,
        subtotal,
    };
}
