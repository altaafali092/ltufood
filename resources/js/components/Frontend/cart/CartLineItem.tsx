import { formatMoney } from '@/lib/frontend/format-money';
import type { CartItem, MenuItem } from '@/types/frontend/menu';
import { QuantityControls } from '../QuantityControls';

type CartLineItemProps = {
    item: CartItem;
    onAdd: (item: MenuItem) => void;
    onRemove: (id: number) => void;
};

export function CartLineItem({ item, onAdd, onRemove }: CartLineItemProps) {
    return (
        <div className="flex items-center gap-3 px-3.5 py-3 rounded-[14px] bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.07]">
            <span className="text-[26px]">{item.emoji}</span>
            <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-slate-900 dark:text-white truncate">
                    {item.title}
                </p>
                <p className="text-[11px] text-slate-400 dark:text-slate-600 mt-0.5">
                    {formatMoney(item.price)} each
                </p>
            </div>
            <QuantityControls
                qty={item.qty}
                onAdd={() => onAdd(item)}
                onRemove={() => onRemove(item.id)}
            />
            <span className="text-[13px] font-bold text-[#00a37a] dark:text-[#6bffb8] w-[70px] text-right shrink-0">
                {formatMoney(item.price * item.qty)}
            </span>
        </div>
    );
}
