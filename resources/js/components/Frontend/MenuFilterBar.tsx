type MenuFilterBarProps = {
    search: string;
    onSearchChange: (value: string) => void;
    category: string;
    categories: string[];
    onCategoryChange: (category: string) => void;
};

export function MenuFilterBar({
    search,
    onSearchChange,
    category,
    categories,
    onCategoryChange,
}: MenuFilterBarProps) {
    return (
        <section className="rounded-[22px] max-md:rounded-[18px] p-5 max-md:p-[18px] bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.07] mb-7 max-md:mb-5 animate-[fadeUp_.5s_.1s_ease_both]">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4 max-md:flex-col max-md:items-stretch max-md:gap-3.5">
                <div>
                    <h2
                        className="text-[26px] font-bold text-slate-900 dark:text-white"
                        style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                    >
                        Full Menu
                    </h2>
                    <p className="text-xs text-slate-400 dark:text-slate-600 mt-1">
                        Filter by category · search what you crave
                    </p>
                </div>
                <div className="relative w-[min(280px,100%)] max-md:w-full">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-slate-400 dark:text-slate-600">
                        🔍
                    </span>
                    <input
                        value={search}
                        onChange={(event) => onSearchChange(event.target.value)}
                        placeholder="Search dishes…"
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-[12px] bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.08] dark:border-white/10 text-slate-900 dark:text-white text-[13px] outline-none placeholder:text-slate-400 dark:placeholder:text-slate-600"
                        style={{ fontFamily: "'DM Sans', sans-serif" }}
                    />
                </div>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
                {categories.map((cat) => (
                    <button
                        key={cat}
                        type="button"
                        onClick={() => onCategoryChange(cat)}
                        className={`rounded-full px-4 py-1.5 text-[13px] font-semibold whitespace-nowrap border-none cursor-pointer transition-all shrink-0
                  ${
                      category === cat
                          ? 'bg-gradient-to-r from-[#6bffb8] to-[#00d4aa] text-[#0d1117]'
                          : 'bg-black/[0.05] dark:bg-white/[0.05] text-slate-500 dark:text-slate-400 border border-black/[0.08] dark:border-white/[0.08] hover:text-slate-900 dark:hover:text-white hover:bg-black/10 dark:hover:bg-white/10'
                  }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>
        </section>
    );
}
