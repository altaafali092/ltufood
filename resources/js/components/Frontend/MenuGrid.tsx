import { FoodItem } from "@/types/frontend/Index";

type CartItem = FoodItem & { qty: number };
type CartState = Record<number, CartItem>;

interface MenuGridProps {
    filtered: FoodItem[];
    cart: CartState;
    addToCart: (item: FoodItem) => void;
    removeFromCart: (id: number) => void;
    money: (price: number) => string;
    itemImage: (item: FoodItem) => string | null;
    itemEmoji: (item: FoodItem) => string;
}

export default function MenuGrid({
    filtered,
    cart,
    addToCart,
    removeFromCart,
    money,
    itemImage,
    itemEmoji,
}: MenuGridProps) {
    if (filtered.length === 0) {
        return (
            <section>
                <div className="rounded-[22px] py-16 px-6 text-center bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.07]">
                    <p className="text-5xl mb-3">🍽️</p>
                    <p className="font-bold text-slate-900 dark:text-white text-base">
                        No dishes found
                    </p>
                    <p className="text-[13px] text-slate-400 dark:text-slate-600">
                        Try another category or search.
                    </p>
                </div>
            </section>
        );
    }

    return (
        <section>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-[18px]">
                {filtered.map((item) => {
                    const img = itemImage(item);
                    const inCart = cart[item.id];

                    return (
                        <article
                            key={item.id}
                            className="rounded-2xl overflow-hidden border border-black/10 dark:border-white/10 bg-black/[0.03] dark:bg-white/[0.04]"
                        >
                            {/* Image */}
                            <div className="relative h-40 flex items-center justify-center bg-black/5 dark:bg-white/5">
                                {img ? (
                                    <img
                                        src={img}
                                        alt={item.title}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <span className="text-6xl">
                                        {itemEmoji(item)}
                                    </span>
                                )}

                                {item.sub_category?.title && (
                                    <span className="absolute left-3 top-3 rounded-full bg-[#6bffb8]/20 px-3 py-1 text-xs font-semibold">
                                        {item.sub_category.title}
                                    </span>
                                )}

                                {(item.popularity_score ?? 0) >= 85 && (
                                    <span className="absolute right-3 top-3 rounded-full bg-red-500 text-white px-2 py-1 text-xs">
                                        🔥 Hot
                                    </span>
                                )}
                            </div>

                            {/* Body */}
                            <div className="p-4 space-y-3">
                                <div>
                                    <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                                        {item.title}
                                    </h3>

                                    <p className="text-xs text-slate-500 line-clamp-2">
                                        {item.description ??
                                            "Freshly prepared for your table."}
                                    </p>
                                </div>

                                <div className="flex items-center justify-between gap-2 mt-1">
                                    <span
                                        className="text-[18px] font-bold text-[#00a37a] dark:text-[#6bffb8]"
                                        style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                                    >
                                        {money(item.price)}
                                    </span>

                                    {inCart ? (
                                        <div className="flex items-center gap-1.5">
                                            <button
                                                onClick={() => removeFromCart(item.id)}
                                                className="w-[30px] h-[30px] rounded-full bg-black/[0.06] dark:bg-white/[0.08] text-slate-900 dark:text-white border-none cursor-pointer text-[15px] font-bold flex items-center justify-center hover:bg-black/15 dark:hover:bg-white/20 transition-colors"
                                            >−</button>
                                            <span className="text-[13px] font-bold text-slate-900 dark:text-white w-[18px] text-center">{inCart.qty}</span>
                                            <button
                                                onClick={() => addToCart(item)}
                                                className="w-[30px] h-[30px] rounded-full bg-gradient-to-br from-[#6bffb8] to-[#00d4aa] text-[#0d1117] border-none cursor-pointer text-[15px] font-bold flex items-center justify-center hover:opacity-90 transition-opacity"
                                            >+</button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => addToCart(item)}
                                            className="px-4 py-2 rounded-full text-xs font-semibold bg-[#6bffb8]/10 text-[#00a37a] dark:text-[#6bffb8] border border-[#6bffb8]/22 cursor-pointer hover:bg-[#6bffb8]/20 transition-colors"
                                        >
                                            + Add
                                        </button>
                                    )}
                                </div>
                            </div>
                        </article>
                    );
                })}
            </div>
        </section>
    );
}