import React, { useState, useMemo } from 'react';
import { Link } from '@inertiajs/react';
import { foodItemDetail } from '@/routes';
import { FoodItem } from "@/types/frontend/Index";
import { Money } from '@/Utils/Money';
import { CartItem } from "@/types";
import { Search, X, Utensils, Sparkles, Minus, Plus, ArrowRight, Leaf } from 'lucide-react';

interface MenuGridProps {
    filtered: FoodItem[];
    cartItems: CartItem[];
    addToCart: (item: FoodItem) => void;
    removeFromCart: (id: number) => void;
    itemImage: (item: FoodItem) => string | null;
    itemEmoji: (item: FoodItem) => string;
    heroItem?: FoodItem;
}

const serifStyle = { fontFamily: 'Georgia, Cambria, "Times New Roman", Times, serif' };
const tabBase = "shrink-0 rounded-full border px-3.5 py-1.5 text-[11px] font-medium transition-colors cursor-pointer";

export default function MenuGrid({
    filtered,
    cartItems,
    addToCart,
    removeFromCart,
    itemImage,
    itemEmoji,
    heroItem,
}: MenuGridProps) {
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('All');

    // Extract unique categories dynamically from the input list
    const categories = useMemo(() => {
        const cats = new Set<string>();
        cats.add('All');
        filtered.forEach((item) => {
            if (item.sub_category?.title) {
                cats.add(item.sub_category.title);
            }
        });
        return Array.from(cats);
    }, [filtered]);

    // Apply internal search and category filters over the prop data
    const displayedItems = useMemo(() => {
        return filtered.filter((item) => {
            const matchesCategory =
                category === 'All' || item.sub_category?.title === category;
            const matchesSearch =
                item.title.toLowerCase().includes(search.toLowerCase()) ||
                (item.description && item.description.toLowerCase().includes(search.toLowerCase()));
            return matchesCategory && matchesSearch;
        });
    }, [filtered, category, search]);

    const resetFilters = () => {
        setSearch('');
        setCategory('All');
    };

    return (
        <section id="menu" className="mx-auto w-full max-w-300 scroll-mt-24 px-6 pb-9 pt-14 max-md:px-4 max-md:pt-10">
            {filtered.length === 0 ? (
                /* Global Empty State: When no items are passed in */
                <div className="rounded-[22px] border border-black/6 bg-black/2 px-6 py-20 text-center dark:border-white/[0.07] dark:bg-white/3">
                    <p className="mb-4 text-6xl">🍽️</p>
                    <p className="mb-1.5 text-lg font-bold text-slate-900 dark:text-white">
                        The menu is being prepared
                    </p>
                    <p className="text-[13px] text-slate-400 dark:text-slate-500">
                        No dishes are available right now. Please check back soon.
                    </p>
                </div>
            ) : (
                <>
                    {/* Header Banner */}
                    <div className="flex items-start justify-between gap-5">
                        <div>
                            <span className="text-[8px] font-semibold tracking-[1.6px] text-[#00a37a] dark:text-[#6bffb8]">
                                SOMETHING FOR EVERY CRAVING
                            </span>
                            <h2
                                className="mb-2.5 mt-2 max-w-110 text-[30px] font-semibold leading-[1.3] tracking-tight text-slate-900 dark:text-white max-md:text-[26px]"
                                style={serifStyle}
                            >
                                Local favourites. A world of flavour
                                <span className="text-[#00a37a] dark:text-[#6bffb8]">.</span>
                            </h2>
                            <p className="text-[11px] leading-[1.8] text-slate-500 dark:text-slate-400">
                                From Local classics to Global comfort food. Find your next favourite.
                            </p>
                        </div>
                    </div>

                    {/* Filter and Search Bar Container */}
                    <div className="mb-6 mt-6 rounded-[18px] border border-black/[0.07] bg-black/2 p-5 dark:border-white/[0.07] dark:bg-white/3 max-md:p-4">
                        <div className="mb-4 flex items-center justify-between gap-5 max-md:flex-col max-md:items-stretch max-md:gap-4">
                            <div className="flex items-center gap-2 text-[13px] font-medium text-slate-900 dark:text-white">
                                <Utensils size={17} className="text-[#00a37a] dark:text-[#6bffb8]" />
                                <span>Full Menu</span>
                                <span className="ml-1 border-l border-black/10 pl-2.5 text-[9px] font-normal text-slate-400 dark:border-white/10">
                                    {displayedItems.length} dishes
                                </span>
                            </div>

                            <label className="flex w-66.5 items-center gap-2 rounded-[10px] border border-black/10 bg-white p-2.5 px-3 text-slate-400 transition-shadow focus-within:border-[#00a37a] focus-within:shadow-[0_0_0_2px_#00a37a22] dark:border-white/10 dark:bg-[#111820] max-md:w-full">
                                <Search size={16} />
                                <input
                                    aria-label="Search dishes"
                                    placeholder="Search what you crave…"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full min-w-0 border-0 bg-transparent text-[11px] text-slate-900 outline-none placeholder:text-slate-400 dark:text-white"
                                />
                                {search && (
                                    <button
                                        type="button"
                                        aria-label="Clear search"
                                        onClick={() => setSearch('')}
                                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                    >
                                        <X size={14} />
                                    </button>
                                )}
                            </label>
                        </div>

                        {/* Category Pills */}
                        <div className="no-scrollbar flex items-center gap-2 overflow-x-auto" role="group" aria-label="Filter menu by category">
                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    type="button"
                                    aria-pressed={category === cat}
                                    onClick={() => setCategory(cat)}
                                    className={
                                        category === cat
                                            ? `${tabBase} border-transparent bg-gradient-to-br from-[#6bffb8] to-[#00d4aa] text-[#06452e]`
                                            : `${tabBase} border-black/10 bg-white text-slate-500 hover:border-[#00a37a]/30 hover:bg-[#00a37a]/6 dark:border-white/10 dark:bg-[#111820] dark:text-slate-400`
                                    }
                                >
                                    {cat === 'All' ? 'All dishes' : cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Food Grid or Search Empty State */}
                    {displayedItems.length > 0 ? (
                        <div className="grid grid-cols-4 gap-5 max-lg:grid-cols-2 max-md:gap-3">
                            {displayedItems.map((item) => {
                                const img = itemImage(item);
                                const inCart = cartItems.find((cart) => cart.food_item_id === item.id);
                                const qty = inCart ? inCart.quantity : 0;
                                const isTop = heroItem && item.id === heroItem.id;

                                return (
                                    <article
                                        key={item.id}
                                        className="group overflow-hidden rounded-2xl border border-black/[0.07] bg-white transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_12px_30px_-12px_rgba(0,163,122,0.25)] dark:border-white/[0.07] dark:bg-[#0e141b]"
                                    >
                                        {/* Image Box */}
                                        <Link
                                            href={foodItemDetail(item.slug)}
                                            className="relative block h-46 overflow-hidden bg-[#00a37a]/[.07] max-md:h-[150px]"
                                        >
                                            {img ? (
                                                <img
                                                    src={img}
                                                    alt={item.title}
                                                    loading="lazy"
                                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                />
                                            ) : (
                                                <span className="flex h-full w-full items-center justify-center text-[64px] dark:brightness-[.8]">
                                                    {itemEmoji(item)}
                                                </span>
                                            )}

                                            {isTop && (
                                                <span className="absolute left-2.5 top-2.5 inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-[7px] font-medium text-[#247953] backdrop-blur">
                                                    <Sparkles size={11} />
                                                    Today&rsquo;s favourite
                                                </span>
                                            )}

                                            {item.sub_category?.title && (
                                                <span className="absolute bottom-2.5 left-2.5 rounded-full border border-white/20 bg-black/60 px-2.5 py-1 text-[7px] text-white backdrop-blur">
                                                    {item.sub_category.title}
                                                </span>
                                            )}
                                        </Link>

                                        {/* Item Info & Actions */}
                                        <div className="p-4">
                                            <Link href={foodItemDetail(item.slug)}>
                                                <h3
                                                    className="mb-2 line-clamp-1 text-[16px] font-semibold leading-snug tracking-tight text-slate-900 transition-colors hover:text-[#00a37a] dark:text-white dark:hover:text-[#6bffb8]"
                                                    style={serifStyle}
                                                >
                                                    {item.title}
                                                </h3>
                                            </Link>

                                            <p className="mb-4 line-clamp-3 min-h-12 text-[10px] leading-[1.7] text-slate-500 dark:text-slate-400">
                                                {item.description || "A delicious dish from our kitchen."}
                                            </p>

                                            <div className="flex items-center justify-between gap-2">
                                                <strong className="text-[14px] font-semibold text-[#00a37a] dark:text-[#6bffb8]">
                                                    {Money(item.price)}
                                                </strong>

                                                {qty > 0 ? (
                                                    <div className="flex w-fit items-center justify-center gap-1.5 rounded-full border border-[#00a37a]/25 bg-[#00a37a]/10 px-1 py-1 text-[#00a37a] dark:text-[#6bffb8]">
                                                        <button
                                                            type="button"
                                                            aria-label={`Remove one ${item.title}`}
                                                            onClick={() => removeFromCart(item.id)}
                                                            className="rounded-full p-1.5 transition-colors hover:bg-[#00a37a]/20"
                                                        >
                                                            <Minus size={13} />
                                                        </button>
                                                        <span className="min-w-2.75 text-center text-[10px] font-semibold">
                                                            {qty}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            aria-label={`Add one ${item.title}`}
                                                            onClick={() => addToCart(item)}
                                                            className="rounded-full p-1.5 transition-colors hover:bg-[#00a37a]/20"
                                                        >
                                                            <Plus size={13} />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={() => addToCart(item)}
                                                        aria-label={`Add ${item.title} to cart`}
                                                        className="flex items-center gap-2 rounded-full border border-[#00a37a]/25 bg-[#00a37a]/10 px-3 py-1.5 text-[10px] font-medium text-[#00a37a] transition-colors hover:border-transparent hover:bg-gradient-to-br hover:from-[#6bffb8] hover:to-[#00d4aa] hover:text-[#06452e] dark:text-[#6bffb8]"
                                                    >
                                                        Add
                                                        <Plus size={14} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    ) : (
                        /* Search / Filter Empty State */
                        <div className="flex flex-col items-center justify-center gap-4 rounded-[18px] border border-dashed border-[#00a37a]/30 p-14 text-center">
                            <Search size={30} className="text-[#00a37a] dark:text-[#6bffb8]" />
                            <h3 className="text-[24px] font-semibold text-slate-900 dark:text-white" style={serifStyle}>
                                No dishes found
                            </h3>
                            <p className="text-[12px] text-slate-500 dark:text-slate-400">
                                Try another category or search for something else.
                            </p>
                            <button
                                type="button"
                                onClick={resetFilters}
                                className="inline-flex items-center gap-2.5 rounded-full border border-black/10 px-5 py-3 text-[11px] font-semibold text-slate-600 transition-colors hover:bg-black/5 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
                            >
                                Reset filters
                                <ArrowRight size={15} />
                            </button>
                        </div>
                    )}

                    {/* Footer note */}
                    <div className="mt-5 flex items-center justify-between gap-4 max-md:flex-col max-md:items-start max-md:gap-2">
                        <p className="flex items-center gap-1.5 text-[9px] text-slate-500 dark:text-slate-400">
                            <Leaf size={13} className="shrink-0 text-[#00a37a] dark:text-[#6bffb8]" />
                            Allergies? Please let our team know before ordering.
                        </p>
                    </div>
                </>
            )}
        </section>
    );
}