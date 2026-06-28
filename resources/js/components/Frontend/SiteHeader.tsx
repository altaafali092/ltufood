import { ThemeToggleButton } from './ThemeToggleButton';

type SiteHeaderProps = {
    totalItems: number;
    onOpenCart: () => void;
};

export function SiteHeader({ totalItems, onOpenCart }: SiteHeaderProps) {
    return (
        <header className="sticky top-0 z-40 bg-[#f7f8f7]/95 dark:bg-[#080c10]/95 backdrop-blur-[18px] border-b border-black/[0.06] dark:border-white/[0.06]">
            <div className="max-w-[1200px] mx-auto px-6 py-3.5 flex items-center justify-between gap-4 max-md:flex-col max-md:items-stretch max-md:px-4 max-md:py-3">
                <div className="flex items-center gap-3">
                    <div className="w-[42px] h-[42px] rounded-[14px] bg-gradient-to-br from-[#6bffb8] to-[#00d4aa] flex items-center justify-center text-xl shrink-0">
                        🍽️
                    </div>
                    <div>
                        <p
                            className="text-xl font-bold text-slate-900 dark:text-white leading-none"
                            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                        >
                            LTU Food
                        </p>
                        <p className="text-[10px] uppercase tracking-[0.15em] text-[#00a37a] dark:text-[#6bffb8] mt-0.5">
                            Scan · Choose · Order
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2.5 max-md:grid max-md:grid-cols-4">
                    <ThemeToggleButton />

                    <button
                        type="button"
                        className="rounded-full bg-transparent text-slate-500 dark:text-slate-400 px-3.5 py-2 text-[13px] font-semibold cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors border-none max-md:justify-center max-md:flex max-md:items-center"
                    >
                        Log in
                    </button>
                    <button
                        type="button"
                        className="rounded-full bg-[#6bffb8]/10 text-[#00a37a] dark:text-[#6bffb8] border border-[#6bffb8]/22 px-4 py-2 text-[13px] font-semibold cursor-pointer hover:bg-[#6bffb8]/20 transition-colors max-md:justify-center max-md:flex max-md:items-center"
                    >
                        Register
                    </button>
                    <button
                        type="button"
                        onClick={onOpenCart}
                        className={`rounded-full px-4 py-2 text-[13px] font-semibold cursor-pointer flex items-center justify-center gap-1.5 transition-all
                ${
                    totalItems > 0
                        ? 'bg-gradient-to-r from-[#6bffb8] to-[#00d4aa] text-[#0d1117] border-none'
                        : 'bg-black/[0.05] dark:bg-white/[0.07] text-slate-500 dark:text-slate-400 border border-black/[0.08] dark:border-white/10'
                }`}
                    >
                        🛒{' '}
                        {totalItems > 0
                            ? `${totalItems} item${totalItems > 1 ? 's' : ''}`
                            : 'Cart'}
                    </button>
                </div>
            </div>
        </header>
    );
}
