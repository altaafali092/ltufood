import React, { useEffect, useMemo, useState } from 'react';
import { FoodItem } from '@/types/frontend/Index';
import { Money } from '@/Utils/Money';
import {
    QrCode,
    ArrowRight,
    ArrowDown,
    Check,
    Zap,
    CookingPot,
    Flame,
    Plus,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';

interface HeroProps {
    heroItems: FoodItem[];
    foodItems: FoodItem[];
    categories: Array<{ id: number; name: string }>;
    activeTable?: { id: number; table_number: string } | null;
    addToCart: (item: FoodItem) => void;
    scrollToMenu: () => void;
}

const serif = { fontFamily: "'Playfair Display', Georgia, serif" };

export default function HeroSection({
    heroItems = [],
    foodItems = [],
    categories = [],
    activeTable,
    addToCart,
    scrollToMenu,
}: HeroProps) {
    const [currentIndex, setCurrentIndex] = useState(0);

    // Active hero items filtering
    const activeHeroItems = useMemo(
        () => heroItems.filter((item) => item.status),
        [heroItems]
    );

    // Bounds protection when heroItems list changes
    useEffect(() => {
        setCurrentIndex((index) =>
            activeHeroItems.length === 0
                ? 0
                : Math.min(index, activeHeroItems.length - 1)
        );
    }, [activeHeroItems.length]);

    const nextSlide = () => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % activeHeroItems.length);
    };

    const prevSlide = () => {
        setCurrentIndex((prevIndex) =>
            prevIndex === 0 ? activeHeroItems.length - 1 : prevIndex - 1
        );
    };

    // Helper utilities for images/emojis
    const getItemImage = (item: FoodItem): string | null => {
        if (item.images && item.images.length > 0 && item.images[0]) {
            return item.images[0];
        }
        return null;
    };

    const getItemEmoji = (item: FoodItem): string => {
        return item.emoji || "🍽️";
    };

    const currentHero = activeHeroItems[currentIndex];

    return (
        <section className="mx-auto grid w-full max-w-300 items-center gap-6 px-6 py-10 md:grid-cols-2 max-md:px-4 max-md:py-8">
            {/* Left Content Column */}
            <div className="animate-[fadeUp_.5s_ease_both] max-md:px-1">
                <div className="inline-flex items-center gap-2 rounded-full border border-[#00a37a]/25 bg-[#00a37a]/10 px-3 py-1.5 text-[8px] font-semibold tracking-[1.4px] text-[#00a37a] dark:text-[#6bffb8]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#00a37a] dark:bg-[#6bffb8]" />
                    A BETTER WAY TO DINE
                </div>

                <h1
                    className="mb-5 mt-5 text-[clamp(42px,4.5vw,64px)] font-semibold leading-[1.12] tracking-tight text-slate-900 dark:text-white max-md:text-[clamp(40px,10vw,56px)]"
                    style={serif}
                >
                    Your table.
                    <br />
                    Your favourites.
                    <br />
                    <span className="font-medium italic text-[#00a37a] dark:text-[#6bffb8]">
                        One simple scan.
                    </span>
                </h1>

                <p className="mb-6 text-[13px] leading-[1.9] text-slate-500 dark:text-slate-400">
                    From the first momo to the last sip of chai.
                    <br />
                    Scan your table&rsquo;s QR, find what you love, and order.
                    <br />
                    Good food is just a tap away.
                </p>

                {/* Primary Actions */}
                <div className="flex flex-wrap items-center gap-3">
                    <button
                        onClick={scrollToMenu}
                        type="button"
                        className="inline-flex items-center gap-2.5 rounded-full bg-linear-to-br from-[#6bffb8] to-[#00d4aa] px-5 py-3.5 text-[11px] font-semibold text-[#073b2b] shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md cursor-pointer active:scale-95"
                    >
                        <QrCode size={18} />
                        {activeTable
                            ? `Order for table T-${activeTable.table_number}`
                            : "Scan & start ordering"}
                        <ArrowRight size={17} />
                    </button>

                    <a
                        href="#menu"
                        className="inline-flex items-center gap-2.5 rounded-full border border-black/10 px-5 py-3.5 text-[11px] font-semibold text-slate-600 transition-colors hover:border-[#00a37a]/40 hover:bg-[#00a37a]/5 dark:border-white/10 dark:text-slate-300"
                    >
                        Explore the menu
                        <ArrowDown size={15} />
                    </a>
                </div>

                {/* Feature Highlights */}
                <div className="mt-4 flex gap-5 text-[9px] text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1.5">
                        <Check size={13} className="text-[#00a37a] dark:text-[#6bffb8]" />
                        No app needed
                    </span>
                    <span className="flex items-center gap-1.5">
                        <Check size={13} className="text-[#00a37a] dark:text-[#6bffb8]" />
                        Order at your own pace
                    </span>
                </div>

                {/* Counter Statistics */}
                <div className="mt-8 flex items-center gap-6">
                    <div className="flex flex-col gap-1">
                        <strong className="text-[22px] font-semibold leading-none text-slate-900 dark:text-white">
                            {foodItems.length}
                            <span className="text-[18px] text-[#00a37a] dark:text-[#6bffb8]">+</span>
                        </strong>
                        <span className="text-[9px] text-slate-500 dark:text-slate-400">
                            Dishes to discover
                        </span>
                    </div>

                    <span className="h-7 w-px bg-black/10 dark:bg-white/10" />

                    <div className="flex flex-col gap-1">
                        <strong className="text-[22px] font-semibold leading-none text-slate-900 dark:text-white">
                            {Math.max(0, categories.length - 1)}
                        </strong>
                        <span className="text-[9px] text-slate-500 dark:text-slate-400">
                            Flavours of the world
                        </span>
                    </div>

                    <span className="h-7 w-px bg-black/10 dark:bg-white/10" />

                    <div className="flex items-center gap-2.5">
                        <Zap size={20} strokeWidth={1.6} className="text-[#00a37a] dark:text-[#6bffb8]" />
                        <span className="text-[9px] leading-[1.7] text-slate-500 dark:text-slate-400">
                            Instant ordering.
                            <br />
                            <b className="font-medium text-slate-600 dark:text-slate-300">
                                More time to enjoy.
                            </b>
                        </span>
                    </div>
                </div>
            </div>

            {/* Right Interactive Carousel Container */}
            {activeHeroItems.length > 0 && (
                <div className="relative group flex h-120 items-center justify-center overflow-hidden rounded-[28px] bg-gradient-to-br from-[#eef7f0] to-[#e4efe9] animate-[fadeUp_.5s_ease_both] max-md:h-auto max-md:aspect-[1.05] dark:from-[#16281f] dark:to-[#0e1d18]">

                    {/* Background Blur Effect */}
                    <div className="absolute right-0 top-0 h-[60%] w-[60%] rounded-full bg-[#6bffb8]/20 blur-2xl pointer-events-none" />

                    {/* Today's Favourite Floating Tag */}
                    <div className="absolute  left-6 top-6 z-10 flex items-center gap-1.5 text-[8px] font-medium tracking-[1.2px] text-[#318d66] dark:text-[#9bddb9]">
                        <Flame size={14} className="text-[#018262] dark:text-[#6bffb8]" />
                        TODAY&rsquo;S FAVOURITE
                    </div>

                    {/* Fresh Hot Badge */}
                    <div className="absolute right-4 top-17.5 z-10 flex h-21.5 w-21.5 rotate-12 flex-col items-center justify-center gap-1 rounded-full border border-[#b4ddc5] bg-[#ddf6e6] text-[#267856] shadow-[0_0_0_5px_#f7f8f7,0_0_0_6px_#00a37a33] dark:border-[#357e54] dark:bg-[#153f2b] dark:text-[#91e8b4] dark:shadow-[0_0_0_5px_#080c10,0_0_0_6px_#6bffb833] pointer-events-none">
                        <CookingPot size={22} strokeWidth={1.5} />
                        <span className="text-center text-[7px] font-semibold leading-[1.6] tracking-[0.8px]">
                            MADE FRESH.
                            <br />
                            SERVED HOT.
                        </span>
                    </div>

                    {/* Sliding Food Items Track */}
                    <div
                        className="flex h-full w-full transition-transform duration-500 ease-out"
                        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                    >
                        {activeHeroItems.map((item) => {
                            const imageSrc = getItemImage(item);
                            return (
                                <div key={item.id} className="relative h-full w-full shrink-0">
                                    {imageSrc ? (
                                        <img
                                            src={imageSrc}
                                            alt={item.title}
                                            className="absolute inset-0 h-full w-full rounded-4xl object-cover"
                                        />
                                    ) : (
                                        <div className="absolute inset-0 grid place-items-center bg-linear-to-br from-[#43a057] to-[#e4efe9] dark:from-[#16281f] dark:to-[#0e1d18]">
                                            <span className="text-[110px] drop-shadow-lg">{getItemEmoji(item)}</span>
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/10 to-black/25" />
                                </div>
                            );
                        })}
                    </div>


                    {/* QR Code Action Widget (Bottom Left Overlaid) */}
                    <button
                        type="button"
                        onClick={scrollToMenu}
                        className="absolute bottom-[76px] left-4 z-10 flex -rotate-[4deg] items-center gap-3 rounded-2xl border border-black/[0.07] bg-white p-3 pr-5 text-left shadow-xl transition-transform hover:rotate-0 hover:-translate-y-1 dark:border-white/10 dark:bg-[#111820] cursor-pointer"
                    >
                        <div className="grid h-[68px] w-[68px] place-items-center rounded-lg border border-black/[0.07] bg-[#f7f8f7] text-[#00a37a] dark:border-white/10 dark:bg-white/[0.04] dark:text-[#6bffb8]">
                            <QrCode size={44} strokeWidth={1.4} />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <span className="text-[6px] tracking-[1.3px] text-slate-400">
                                YOUR TABLE. YOUR MENU.
                            </span>
                            <strong className="text-[13px] font-semibold text-slate-900 dark:text-white">
                                Scan. Choose. Order.
                            </strong>
                            <span className="flex items-center gap-2 text-[8px] text-[#00a37a] dark:text-[#6bffb8]">
                                {activeTable
                                    ? `Table T-${activeTable.table_number}`
                                    : "No waiting to get started"}
                                <ArrowRight size={12} />
                            </span>
                        </div>
                    </button>

                    {/* Slide Specific Details Overlay (Bottom Right Info & Add to Cart) */}
                    {currentHero && (
                        <div className="absolute inset-x-6 bottom-5 z-10 flex items-center justify-between">
                            <div className="flex flex-col gap-0.5 max-w-[60%]">
                                <span className="text-[7px] tracking-[1.2px] text-slate-100 dark:text-slate-400 uppercase truncate">
                                    {currentHero.sub_category?.title ?? "FROM OUR KITCHEN"}
                                </span>
                                <strong
                                    className="text-[19px] font-semibold text-slate-200 dark:text-slate-100 truncate"
                                    style={serif}
                                >
                                    {currentHero.title}
                                </strong>
                            </div>

                            <button
                                type="button"
                                onClick={() => addToCart(currentHero)}
                                aria-label={`Add ${currentHero.title} to cart`}
                                className="flex items-center gap-2 rounded-full border border-[#00a37a]/25 bg-white/90 px-3.5 py-2.5 text-[12px] font-medium text-[#008560] backdrop-blur transition-all hover:bg-[#6bffb8] hover:text-[#073b2b] dark:border-[#6bffb8]/25 dark:bg-[#153f2b]/90 dark:text-[#9ef4be] dark:hover:bg-[#6bffb8] dark:hover:text-[#073b2b] shadow-sm active:scale-95 cursor-pointer"
                            >
                                <span>Add to cart {Money(currentHero.price)}</span>
                                <Plus size={16} />
                            </button>
                        </div>
                    )}

                    {/* Carousel Arrow Controls */}
                    {activeHeroItems.length > 1 && (
                        <>
                            <button
                                type="button"
                                onClick={prevSlide}
                                aria-label="Previous slide"
                                className="absolute left-3 top-1/2 z-20 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full bg-white/80 text-slate-800 opacity-0 shadow-md transition-opacity hover:bg-white dark:bg-slate-900/80 dark:text-slate-200 dark:hover:bg-slate-900 group-hover:opacity-100 cursor-pointer"
                            >
                                <ChevronLeft size={18} />
                            </button>

                            <button
                                type="button"
                                onClick={nextSlide}
                                aria-label="Next slide"
                                className="absolute right-3 top-1/2 z-20 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full bg-white/80 text-slate-800 opacity-0 shadow-md transition-opacity hover:bg-white dark:bg-slate-900/80 dark:text-slate-200 dark:hover:bg-slate-900 group-hover:opacity-100 cursor-pointer"
                            >
                                <ChevronRight size={18} />
                            </button>

                            {/* Indicators / Dots */}
                            <div className="absolute top-6 left-1/2 z-20 flex -translate-x-1/2 gap-1.5">
                                {activeHeroItems.map((_, index) => (
                                    <button
                                        key={index}
                                        type="button"
                                        onClick={() => setCurrentIndex(index)}
                                        aria-label={`Go to slide ${index + 1}`}
                                        className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${currentIndex === index
                                                ? "w-5 bg-[#00a37a] dark:bg-[#6bffb8]"
                                                : "w-1.5 bg-slate-300/80 dark:bg-slate-600/80"
                                            }`}
                                    />
                                ))}
                            </div>
                        </>
                    )}
                </div>
            )}
        </section>
    );
}