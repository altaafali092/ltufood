type QuantityControlsProps = {
    qty: number;
    onAdd: () => void;
    onRemove: () => void;
    size?: 'sm' | 'md';
};

export function QuantityControls({
    qty,
    onAdd,
    onRemove,
    size = 'md',
}: QuantityControlsProps) {
    const buttonSize = size === 'sm' ? 'w-[30px] h-[30px]' : 'w-7 h-7';

    return (
        <div className="flex items-center gap-1.5">
            <button
                type="button"
                onClick={onRemove}
                className={`${buttonSize} rounded-full bg-black/[0.06] dark:bg-white/[0.08] text-slate-900 dark:text-white border-none cursor-pointer text-[15px] font-bold flex items-center justify-center hover:bg-black/15 dark:hover:bg-white/20 transition-colors`}
            >
                −
            </button>
            <span className="text-[13px] font-bold text-slate-900 dark:text-white w-[18px] text-center">
                {qty}
            </span>
            <button
                type="button"
                onClick={onAdd}
                className={`${buttonSize} rounded-full bg-gradient-to-br from-[#6bffb8] to-[#00d4aa] text-[#0d1117] border-none cursor-pointer text-[15px] font-bold flex items-center justify-center hover:opacity-90 transition-opacity`}
            >
                +
            </button>
        </div>
    );
}
