import { formatMoney } from '@/lib/frontend/format-money';

type CartTotalsProps = {
    subtotal: number;
    service: number;
    total: number;
    onOrder: () => void;
};

export function CartTotals({ subtotal, service, total, onOrder }: CartTotalsProps) {
    const rows: [string, number][] = [
        ['Subtotal', subtotal],
        ['Service charge (10%)', service],
    ];

    return (
        <div className="px-6 pb-6 pt-4 border-t border-black/[0.08] dark:border-white/[0.08]">
            <div className="flex flex-col gap-2 mb-4">
                {rows.map(([label, value]) => (
                    <div key={label} className="flex justify-between text-[13px] text-slate-500">
                        <span>{label}</span>
                        <span>{formatMoney(value)}</span>
                    </div>
                ))}
                <div className="flex justify-between text-[15px] font-bold text-slate-900 dark:text-white pt-2.5 border-t border-black/[0.08] dark:border-white/[0.08]">
                    <span>Total</span>
                    <span className="text-[#00a37a] dark:text-[#6bffb8]">{formatMoney(total)}</span>
                </div>
            </div>
            <button
                type="button"
                onClick={onOrder}
                className="w-full py-3.5 rounded-[14px] bg-gradient-to-br from-[#6bffb8] to-[#00d4aa] text-[#0d1117] text-sm font-bold uppercase tracking-[0.1em] border-none cursor-pointer hover:opacity-90 transition-opacity"
            >
                Place Order
            </button>
        </div>
    );
}
