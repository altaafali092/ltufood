import { formatMoney } from '@/lib/frontend/format-money';
import type { MenuItem } from '@/types/frontend/menu';

type PopularPicksProps = {
    items: MenuItem[];
};

export function PopularPicks({ items }: PopularPicksProps) {
    return (
        <div className="rounded-[22px] max-md:rounded-[18px] p-5 max-md:p-[18px] bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.07] col-span-2 max-md:col-span-1">
            <p className="text-[11px] uppercase tracking-[0.12em] text-[#00a37a] dark:text-[#6bffb8] mb-4">
                🔥 Popular picks
            </p>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] max-md:grid-cols-1 gap-3.5 max-md:gap-3">
                {items.map((item, index) => (
                    <div key={item.id} className="flex items-center gap-2.5">
                        <span
                            className="text-xs font-bold text-[#6bffb8]/40 w-[22px]"
                            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                        >
                            0{index + 1}
                        </span>
                        <span className="text-[22px]">{item.emoji}</span>
                        <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-semibold text-slate-900 dark:text-white truncate">
                                {item.title}
                            </p>
                            <p className="text-[11px] text-slate-400 dark:text-slate-600 mt-0.5">
                                {formatMoney(item.price)}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
