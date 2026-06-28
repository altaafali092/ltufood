import { formatMoney } from '@/lib/frontend/format-money';

type FloatingCartBarProps = {
    visible: boolean;
    totalItems: number;
    subtotal: number;
    onOpen: () => void;
};

export function FloatingCartBar({
    visible,
    totalItems,
    subtotal,
    onOpen,
}: FloatingCartBarProps) {
    if (!visible) {
        return null;
    }

    return (
        <div className="fixed bottom-6 max-md:bottom-3 left-0 right-0 flex justify-center px-4 max-md:px-3 z-40">
            <button
                type="button"
                onClick={onOpen}
                className="flex items-center gap-3.5 max-md:gap-3 px-6 py-3.5 max-md:px-4 max-md:py-3 rounded-[18px] max-md:rounded-[16px] border-none cursor-pointer bg-gradient-to-r from-[#6bffb8] to-[#00d4aa] text-[#0d1117] text-sm font-bold w-full max-w-[440px] max-md:max-w-none shadow-[0_16px_48px_rgba(107,255,184,0.32)] hover:opacity-95 transition-opacity"
            >
                <span className="w-7 h-7 rounded-full bg-black/20 flex items-center justify-center text-xs font-black shrink-0">
                    {totalItems}
                </span>
                <span className="flex-1 text-left">View your order</span>
                <span className="font-black">{formatMoney(subtotal)}</span>
            </button>
        </div>
    );
}
