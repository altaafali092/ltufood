interface FilterBarProps {
    search: string;
    setSearch: (value: string) => void;
    category: string;
    setCategory: (value: string) => void;
    categories: string[];
}

export default function FilterBar({
    search,
    setSearch,
    category,
    setCategory,
    categories,
}: FilterBarProps) {
    return (
        <section className="rounded-[22px] p-5 bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.07] mb-7">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
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

                <div className="relative w-[min(280px,100%)]">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2">
                        🔍
                    </span>

                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search dishes..."
                        className="w-full pl-10 pr-3 py-2 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 outline-none"
                    />
                </div>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1">
                {categories.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setCategory(cat)}
                        className={`rounded-full px-4 py-2 text-sm font-medium transition
                        ${
                            category === cat
                                ? "bg-gradient-to-r from-[#6bffb8] to-[#00d4aa] text-black"
                                : "bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10"
                        }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>
        </section>
    );
}