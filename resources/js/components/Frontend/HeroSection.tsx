import { formatMoney } from '@/lib/frontend/format-money';
import type { MenuItem } from '@/types/frontend/menu';
import { FeatureStatCard } from './FeatureStatCard';
import { PopularPicks } from './PopularPicks';

type HeroFeaturedItemProps = {
    item: MenuItem;
    onAdd: (item: MenuItem) => void;
};

function HeroFeaturedItem({ item, onAdd }: HeroFeaturedItemProps) {
    return (
        <div className="relative min-h-[400px] max-md:min-h-[320px] rounded-[28px] max-md:rounded-[22px] overflow-hidden bg-gradient-to-br from-[#e7f6ee] to-[#f3f7f5] dark:from-[#0e1f14] dark:to-[#0a1118] border border-[#6bffb8]/22 dark:border-[#6bffb8]/14 p-9 max-md:p-5 flex flex-col justify-end col-span-2 max-md:col-span-1">
            <div className="absolute -top-20 -right-20 w-[280px] h-[280px] rounded-full bg-[radial-gradient(circle,rgba(107,255,184,0.18),transparent)] blur-[40px]" />
            <div className="absolute -bottom-16 -left-10 w-[200px] h-[200px] rounded-full bg-[radial-gradient(circle,rgba(0,212,170,0.12),transparent)] blur-[32px]" />
            <div className="relative z-10">
                <div className="inline-flex items-center gap-1.5 bg-[#6bffb8]/12 border border-[#6bffb8]/22 rounded-full px-3.5 py-1 mb-5">
                    <span className="text-[11px]">✦</span>
                    <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#00a37a] dark:text-[#6bffb8]">
                        Today&apos;s favourite
                    </span>
                </div>
                <div className="text-[72px] max-md:text-[52px] leading-none mb-4">{item.emoji}</div>
                <h1
                    className="text-[clamp(32px,5vw,52px)] font-black text-slate-900 dark:text-white leading-[1.1] mb-3"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                    {item.title}
                </h1>
                <p className="text-sm leading-[1.7] text-slate-500 dark:text-slate-500 max-w-[440px] max-md:max-w-none mb-6">
                    {item.description}
                </p>
                <div className="flex items-center gap-3.5 flex-wrap">
                    <span
                        className="text-[26px] font-bold text-[#00a37a] dark:text-[#6bffb8]"
                        style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                    >
                        {formatMoney(item.price)}
                    </span>
                    <button
                        type="button"
                        onClick={() => onAdd(item)}
                        className="flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-[#6bffb8] to-[#00d4aa] text-[#0d1117] text-sm font-semibold border-none cursor-pointer hover:opacity-90 transition-opacity"
                    >
                        🛒 Add to order
                    </button>
                </div>
            </div>
        </div>
    );
}

type HeroSectionProps = {
    hero?: MenuItem;
    popular: MenuItem[];
    itemCount: number;
    categoryCount: number;
    onAdd: (item: MenuItem) => void;
};

export function HeroSection({
    hero,
    popular,
    itemCount,
    categoryCount,
    onAdd,
}: HeroSectionProps) {
    if (!hero) {
        return null;
    }

    return (
        <section className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-5 mb-10 max-md:grid-cols-1 max-md:gap-3.5 max-md:mb-6 animate-[fadeUp_.5s_ease_both]">
            <HeroFeaturedItem item={hero} onAdd={onAdd} />
            <FeatureStatCard
                icon="⚡"
                title="Instant ordering"
                description="Browse the menu and place your order directly from this page — no waiting for staff."
            />
            <FeatureStatCard
                icon="🍴"
                title={`${itemCount} dishes`}
                description={`${categoryCount} categories from Nepali classics to Italian comfort food and more.`}
            />
            <PopularPicks items={popular} />
        </section>
    );
}
