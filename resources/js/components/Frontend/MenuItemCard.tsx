import { formatMoney } from '@/lib/frontend/format-money';
import type { MenuItem } from '@/types/frontend/menu';
import { CategoryBadge } from './CategoryBadge';
import { QuantityControls } from './QuantityControls';

type MenuItemCardProps = {
    item: MenuItem;
    qty?: number;
    onAdd: (item: MenuItem) => void;
    onRemove: (id: number) => void;
    animationDelay?: number;
};

export function MenuItemCard({
    item,
    qty,
    onAdd,
    onRemove,
    animationDelay = 0,
}: MenuItemCardProps) {
    return (
        <article
            className="bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.07] rounded-[20px] overflow-hidden hover:-translate-y-1.5 hover:shadow-[0_20px_56px_rgba(107,255,184,0.09)] transition-all duration-[220ms]"
            style={{ animationDelay: `${0.04 * animationDelay}s` }}
        >
            <div className="relative h-[160px] max-md:h-[132px] flex items-center justify-center bg-gradient-to-br from-black/[0.04] to-black/[0.01] dark:from-white/[0.04] dark:to-white/[0.01]">
                <span className="text-[72px] max-md:text-[56px] leading-none select-none">
                    {item.emoji}
                </span>

                <CategoryBadge category={item.foodCategory?.title} />

                {(item.popularity_score ?? 0) >= 85 && (
                    <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.1em] bg-[#6bffb8]/10 text-[#00a37a] dark:text-[#6bffb8] border border-[#6bffb8]/20">
                        🔥 Hot
                    </span>
                )}
            </div>

            <div className="p-4 flex flex-col gap-2.5">
                <div>
                    <h3
                        className="text-[17px] font-bold text-slate-900 dark:text-white leading-[1.3] truncate"
                        style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                    >
                        {item.title}
                    </h3>
                    <p
                        className="text-xs leading-[1.65] text-slate-400 dark:text-slate-600 mt-1.5 overflow-hidden"
                        style={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                        }}
                    >
                        {item.description ?? 'Freshly prepared for your table.'}
                    </p>
                </div>

                <div className="flex items-center justify-between gap-2 mt-1">
                    <span
                        className="text-[18px] font-bold text-[#00a37a] dark:text-[#6bffb8]"
                        style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                    >
                        {formatMoney(item.price)}
                    </span>

                    {qty ? (
                        <QuantityControls
                            qty={qty}
                            size="sm"
                            onAdd={() => onAdd(item)}
                            onRemove={() => onRemove(item.id)}
                        />
                    ) : (
                        <button
                            type="button"
                            onClick={() => onAdd(item)}
                            className="px-4 py-2 rounded-full text-xs font-semibold bg-[#6bffb8]/10 text-[#00a37a] dark:text-[#6bffb8] border border-[#6bffb8]/22 cursor-pointer hover:bg-[#6bffb8]/20 transition-colors"
                        >
                            + Add
                        </button>
                    )}
                </div>
            </div>
        </article>
    );
}
