import type { CartState, MenuItem } from '@/types/frontend/menu';
import { MenuItemCard } from './MenuItemCard';

type MenuGridProps = {
    items: MenuItem[];
    cart: CartState;
    onAdd: (item: MenuItem) => void;
    onRemove: (id: number) => void;
};

export function MenuGrid({ items, cart, onAdd, onRemove }: MenuGridProps) {
    return (
        <section className="animate-[fadeUp_.5s_.2s_ease_both]">
            {items.length === 0 ? (
                <div className="rounded-[22px] py-16 px-6 text-center bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.07]">
                    <p className="text-5xl mb-3">🍽️</p>
                    <p className="font-bold text-slate-900 dark:text-white text-base mb-1.5">
                        No dishes found
                    </p>
                    <p className="text-[13px] text-slate-400 dark:text-slate-600">
                        Try a different category or search term.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] max-md:grid-cols-1 gap-[18px] max-md:gap-3.5">
                    {items.map((item, index) => (
                        <MenuItemCard
                            key={item.id}
                            item={item}
                            qty={cart[item.id]?.qty}
                            onAdd={onAdd}
                            onRemove={onRemove}
                            animationDelay={index}
                        />
                    ))}
                </div>
            )}
        </section>
    );
}
