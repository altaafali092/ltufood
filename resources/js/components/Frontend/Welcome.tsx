import { useMemo, useState } from "react";
import { useAppearance } from "@/hooks/use-appearance";
import Header from "./Header";
import { FoodItem } from "@/types/frontend/Index";

type CartItem = FoodItem & { qty: number };
type CartState = Record<number, CartItem>;

const money = (price: number) =>
  new Intl.NumberFormat("en-NP", { style: "currency", currency: "NPR", maximumFractionDigits: 0 }).format(Number(price || 0));

/* Pick the first available image for a dish, falling back to an emoji. */
const itemImage = (item: FoodItem): string | null =>
  Array.isArray(item.images) && item.images.length > 0 ? item.images[0] : null;

const itemEmoji = (item: FoodItem): string =>
  (item.tags?.find((t) => t) ?? "") as string || "🍽️";

/* Category badge colours — keyed by sub-category title. */
const CAT_CLASS: Record<string, { pill: string; dot: string }> = {
  Nepali: { pill: "bg-orange-400/10 text-orange-400", dot: "bg-orange-400" },
  Chinese: { pill: "bg-red-400/10 text-red-400", dot: "bg-red-400" },
  Italian: { pill: "bg-green-400/10 text-green-400", dot: "bg-green-400" },
  "Fast Food": { pill: "bg-yellow-400/10 text-yellow-400", dot: "bg-yellow-400" },
  Drinks: { pill: "bg-blue-400/10 text-blue-400", dot: "bg-blue-400" },
  Desserts: { pill: "bg-fuchsia-400/10 text-fuchsia-400", dot: "bg-fuchsia-400" },
};
const cs = (cat?: string) =>
  CAT_CLASS[cat ?? ""] ?? { pill: "bg-slate-400/10 text-slate-400", dot: "bg-slate-400" };

/* ─── Cart Drawer ──────────────────────────────────────────────────────── */
function CartDrawer({
  cart, onAdd, onRemove, onClose, onOrder, ordered,
}: {
  cart: CartState;
  onAdd: (item: FoodItem) => void;
  onRemove: (id: number) => void;
  onClose: () => void;
  onOrder: () => void;
  ordered: boolean;
}) {
  const items = Object.values(cart);
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const service = Math.round(subtotal * 0.1);
  const total = subtotal + service;
  const totalQty = items.reduce((s, i) => s + i.qty, 0);

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* backdrop */}
      <div className="flex-1 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* panel */}
      <div className="w-full max-w-[440px] md:max-w-[440px] bg-white dark:bg-[#0d1117] border-l border-black/[0.08] dark:border-white/[0.08] flex flex-col">

        {/* header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-black/[0.08] dark:border-white/[0.08]">
          <div>
            <p className="text-[11px] uppercase tracking-[0.12em] text-[#6bffb8] mb-1 font-['DM_Sans',sans-serif]">Your Order</p>
            <p className="font-['Playfair_Display',Georgia,serif] text-[22px] font-bold text-slate-900 dark:text-white">
              {totalQty} item{totalQty !== 1 ? "s" : ""}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-black/[0.06] dark:bg-white/[0.07] text-slate-500 dark:text-slate-400 border-none cursor-pointer text-base flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
          >
            ✕
          </button>
        </div>

        {ordered ? (
          <div className="flex-1 flex flex-col items-center justify-center px-8 py-12 text-center">
            <div className="text-[64px] mb-4 animate-bounce">✅</div>
            <p className="font-['Playfair_Display',Georgia,serif] text-[26px] font-bold text-slate-900 dark:text-white mb-2">Order Placed!</p>
            <p className="text-[13px] text-slate-500">Your food is being prepared. Sit back & relax 🎉</p>
          </div>
        ) : (
          <>
            {/* items list */}
            <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-2.5">
              {items.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-16 text-center">
                  <p className="text-5xl mb-3">🛒</p>
                  <p className="text-[13px] text-slate-500">Your cart is empty.<br />Add something delicious!</p>
                </div>
              ) : items.map(item => {
                const img = itemImage(item);
                return (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 px-3.5 py-3 rounded-[14px] bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.07]"
                  >
                    <div className="w-9 h-9 shrink-0 overflow-hidden rounded-[8px] bg-black/[0.04] dark:bg-white/[0.06] flex items-center justify-center text-[22px]">
                      {img
                        ? <img src={img} alt={item.title} className="h-full w-full object-cover" />
                        : <span>{itemEmoji(item)}</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-slate-900 dark:text-white truncate">{item.title}</p>
                      <p className="text-[11px] text-slate-400 dark:text-slate-600 mt-0.5">{money(item.price)} each</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => onRemove(item.id)}
                        className="w-7 h-7 rounded-full bg-black/[0.06] dark:bg-white/[0.08] text-slate-900 dark:text-white border-none cursor-pointer text-[15px] font-bold flex items-center justify-center hover:bg-black/15 dark:hover:bg-white/20 transition-colors"
                      >−</button>
                      <span className="text-[13px] font-bold text-slate-900 dark:text-white w-[18px] text-center">{item.qty}</span>
                      <button
                        onClick={() => onAdd(item)}
                        className="w-7 h-7 rounded-full bg-gradient-to-br from-[#6bffb8] to-[#00d4aa] text-[#0d1117] border-none cursor-pointer text-[15px] font-bold flex items-center justify-center hover:opacity-90 transition-opacity"
                      >+</button>
                    </div>
                    <span className="text-[13px] font-bold text-[#00a37a] dark:text-[#6bffb8] w-[70px] text-right shrink-0">
                      {money(item.price * item.qty)}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* totals + CTA */}
            {items.length > 0 && (
              <div className="px-6 pb-6 pt-4 border-t border-black/[0.08] dark:border-white/[0.08]">
                <div className="flex flex-col gap-2 mb-4">
                  {([["Subtotal", subtotal], ["Service charge (10%)", service]] as [string, number][]).map(([label, val]) => (
                    <div key={label} className="flex justify-between text-[13px] text-slate-500">
                      <span>{label}</span><span>{money(val)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between text-[15px] font-bold text-slate-900 dark:text-white pt-2.5 border-t border-black/[0.08] dark:border-white/[0.08]">
                    <span>Total</span>
                    <span className="text-[#00a37a] dark:text-[#6bffb8]">{money(total)}</span>
                  </div>
                </div>
                <button
                  onClick={onOrder}
                  className="w-full py-3.5 rounded-[14px] bg-gradient-to-br from-[#6bffb8] to-[#00d4aa] text-[#0d1117] text-sm font-bold uppercase tracking-[0.1em] border-none cursor-pointer hover:opacity-90 transition-opacity"
                >
                  Place Order
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/* ─── Main ─────────────────────────────────────────────────────────────── */
interface WelcomeProps {
  foodItems: FoodItem[];
  canRegister?: boolean;
}

export default function Welcome({ foodItems }: WelcomeProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [cart, setCart] = useState<CartState>({});
  const [cartOpen, setCartOpen] = useState(false);
  const [ordered, setOrdered] = useState(false);

  const { resolvedAppearance, updateAppearance } = useAppearance();
  const isDark = resolvedAppearance === "dark";
  const toggleTheme = () => updateAppearance(isDark ? "light" : "dark");

  const categories = useMemo(() => {
    const names = foodItems
      .map(item => item.subCategory?.title)
      .filter((title): title is string => Boolean(title));
    return ["All", ...Array.from(new Set(names))];
  }, [foodItems]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();

    return foodItems.filter(item => {
      const inCategory =
        category === "All" ||
        item.subCategory?.title === category;

      const inSearch =
        !term ||
        item.title.toLowerCase().includes(term) ||
        item.description?.toLowerCase().includes(term);

      return inCategory && inSearch;
    });
  }, [foodItems, search, category]);

  const popular = useMemo(() => {
    return [...foodItems]
      .sort((a, b) => b.popularity_score - a.popularity_score)
      .slice(0, 4);
  }, [foodItems]);

  const hero = popular[0];

  const addToCart = (item: FoodItem) =>
    setCart(p => ({ ...p, [item.id]: { ...item, qty: (p[item.id]?.qty || 0) + 1 } }));
  const removeFromCart = (id: number) =>
    setCart(p => {
      const u = { ...p };
      if (u[id]?.qty > 1) { u[id] = { ...u[id], qty: u[id].qty - 1 }; }
      else { delete u[id]; }
      return u;
    });

  const totalItems = Object.values(cart).reduce((s, i) => s + i.qty, 0);
  const subtotal = Object.values(cart).reduce((s, i) => s + i.price * i.qty, 0);

  const placeOrder = () => {
    setOrdered(true);
    setTimeout(() => { setCart({}); setOrdered(false); setCartOpen(false); }, 3200);
  };

  return (
    <div className="min-h-screen bg-[#f7f8f7] dark:bg-[#080c10] text-slate-700 dark:text-slate-200" style={{ fontFamily: "'DM Sans', sans-serif" }}>

      <Header
        isDark={isDark}
        toggleTheme={toggleTheme}
        totalItems={totalItems}
        setCartOpen={setCartOpen}
      />


      <main className="max-w-[1200px] mx-auto px-6 pb-20 pt-9 max-md:px-4 max-md:pb-24 max-md:pt-5">

        {/* ── EMPTY STATE ─────────────────────────────────────── */}
        {foodItems.length === 0 ? (
          <div className="rounded-[22px] py-20 px-6 text-center bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.07]">
            <p className="text-6xl mb-4">🍽️</p>
            <p className="font-bold text-slate-900 dark:text-white text-lg mb-1.5">The menu is being prepared</p>
            <p className="text-[13px] text-slate-400 dark:text-slate-600">No dishes are available right now. Please check back soon.</p>
          </div>
        ) : (
          <>
            {/* ── HERO GRID ─────────────────────────────────────── */}
            <section className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-5 mb-10 max-md:grid-cols-1 max-md:gap-3.5 max-md:mb-6 animate-[fadeUp_.5s_ease_both]">

              {/* Hero card */}
              <div className="relative min-h-[400px] max-md:min-h-[320px] rounded-[28px] max-md:rounded-[22px] overflow-hidden bg-gradient-to-br from-[#e7f6ee] to-[#f3f7f5] dark:from-[#0e1f14] dark:to-[#0a1118] border border-[#6bffb8]/22 dark:border-[#6bffb8]/14 p-9 max-md:p-5 flex flex-col justify-end col-span-2 max-md:col-span-1">
                {/* blobs */}
                <div className="absolute -top-20 -right-20 w-[280px] h-[280px] rounded-full bg-[radial-gradient(circle,rgba(107,255,184,0.18),transparent)] blur-[40px]" />
                <div className="absolute -bottom-16 -left-10 w-[200px] h-[200px] rounded-full bg-[radial-gradient(circle,rgba(0,212,170,0.12),transparent)] blur-[32px]" />
                {itemImage(hero) && (
                  <img
                    src={itemImage(hero) ?? undefined}
                    alt={hero.title}
                    className="absolute inset-0 h-full w-full object-cover opacity-90"
                  />
                )}
                <div className="relative z-10">
                  <div className="inline-flex items-center gap-1.5 bg-[#6bffb8]/12 border border-[#6bffb8]/22 rounded-full px-3.5 py-1 mb-5">
                    <span className="text-[11px]">✦</span>
                    <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#00a37a] dark:text-[#6bffb8]">Today's favourite</span>
                  </div>
                  <h1 className="text-[clamp(32px,5vw,52px)] font-black text-slate-900 dark:text-white leading-[1.1] mb-3" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                    {hero.title}
                  </h1>
                  <p className="text-sm leading-[1.7] text-slate-500 dark:text-slate-500 max-w-[440px] max-md:max-w-none mb-6">{hero.description}</p>
                  <div className="flex items-center gap-3.5 flex-wrap">
                    <span className="text-[26px] font-bold text-[#00a37a] dark:text-[#6bffb8]" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                      {money(hero.price)}
                    </span>
                    <button
                      onClick={() => addToCart(hero)}
                      className="flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-[#6bffb8] to-[#00d4aa] text-[#0d1117] text-sm font-semibold border-none cursor-pointer hover:opacity-90 transition-opacity"
                    >
                      🛒 Add to order
                    </button>
                  </div>
                </div>
              </div>

              {/* Stat card 1 */}
              <div className="rounded-[22px] max-md:rounded-[18px] p-5 max-md:p-[18px] bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.07] flex flex-col gap-2.5">
                <div className="w-[42px] h-[42px] rounded-[12px] bg-[#6bffb8]/10 flex items-center justify-center text-[22px]">⚡</div>
                <p className="font-bold text-slate-900 dark:text-white text-base">Instant ordering</p>
                <p className="text-xs text-slate-500 leading-[1.6]">Browse the menu and place your order directly from this page — no waiting for staff.</p>
              </div>

              {/* Stat card 2 */}
              <div className="rounded-[22px] max-md:rounded-[18px] p-5 max-md:p-[18px] bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.07] flex flex-col gap-2.5">
                <div className="w-[42px] h-[42px] rounded-[12px] bg-yellow-400/10 flex items-center justify-center text-[22px]">🍴</div>
                <p className="font-bold text-slate-900 dark:text-white text-base">{foodItems.length} dishes</p>
                <p className="text-xs text-slate-500 leading-[1.6]">{categories.length - 1} categories from Nepali classics to Italian comfort food and more.</p>
              </div>

              {/* Popular picks */}
              <div className="rounded-[22px] max-md:rounded-[18px] p-5 max-md:p-[18px] bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.07] col-span-2 max-md:col-span-1">
                <p className="text-[11px] uppercase tracking-[0.12em] text-[#00a37a] dark:text-[#6bffb8] mb-4">🔥 Popular picks</p>
                <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] max-md:grid-cols-1 gap-3.5 max-md:gap-3">
                  {popular.map((item, i) => {
                    const img = itemImage(item);
                    return (
                      <div key={item.id} className="flex items-center gap-2.5">
                        <span className="text-xs font-bold text-[#6bffb8]/40 w-[22px]" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                          0{i + 1}
                        </span>
                        <div className="w-9 h-9 shrink-0 overflow-hidden rounded-[8px] bg-black/[0.04] dark:bg-white/[0.06] flex items-center justify-center text-[20px]">
                          {img
                            ? <img src={img} alt={item.title} className="h-full w-full object-cover" />
                            : <span>{itemEmoji(item)}</span>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-semibold text-slate-900 dark:text-white truncate">{item.title}</p>
                          <p className="text-[11px] text-slate-400 dark:text-slate-600 mt-0.5">{money(item.price)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* ── FILTER BAR ────────────────────────────────────── */}
            <section className="rounded-[22px] max-md:rounded-[18px] p-5 max-md:p-[18px] bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.07] mb-7 max-md:mb-5 animate-[fadeUp_.5s_.1s_ease_both]">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4 max-md:flex-col max-md:items-stretch max-md:gap-3.5">
                <div>
                  <h2 className="text-[26px] font-bold text-slate-900 dark:text-white" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>Full Menu</h2>
                  <p className="text-xs text-slate-400 dark:text-slate-600 mt-1">Filter by category · search what you crave</p>
                </div>
                <div className="relative w-[min(280px,100%)] max-md:w-full">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-slate-400 dark:text-slate-600">🔍</span>
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search dishes…"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-[12px] bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.08] dark:border-white/10 text-slate-900 dark:text-white text-[13px] outline-none placeholder:text-slate-400 dark:placeholder:text-slate-600"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                  />
                </div>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`rounded-full px-4 py-1.5 text-[13px] font-semibold whitespace-nowrap border-none cursor-pointer transition-all shrink-0
                      ${category === cat
                        ? "bg-gradient-to-r from-[#6bffb8] to-[#00d4aa] text-[#0d1117]"
                        : "bg-black/[0.05] dark:bg-white/[0.05] text-slate-500 dark:text-slate-400 border border-black/[0.08] dark:border-white/[0.08] hover:text-slate-900 dark:hover:text-white hover:bg-black/10 dark:hover:bg-white/10"
                      }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </section>

            {/* ── MENU GRID ─────────────────────────────────────── */}
            <section className="animate-[fadeUp_.5s_.2s_ease_both]">
              {filtered.length === 0 ? (
                <div className="rounded-[22px] py-16 px-6 text-center bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.07]">
                  <p className="text-5xl mb-3">🍽️</p>
                  <p className="font-bold text-slate-900 dark:text-white text-base mb-1.5">No dishes found</p>
                  <p className="text-[13px] text-slate-400 dark:text-slate-600">Try a different category or search term.</p>
                </div>
              ) : (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] max-md:grid-cols-1 gap-[18px] max-md:gap-3.5">
                  {filtered.map((item, idx) => {
                    const { pill, dot } = cs(item.subCategory?.title);
                    const inCart = cart[item.id];
                    const img = itemImage(item);

                    return (
                      <article
                        key={item.id}
                        className="bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.07] rounded-[20px] overflow-hidden hover:-translate-y-1.5 hover:shadow-[0_20px_56px_rgba(107,255,184,0.09)] transition-all duration-[220ms]"
                        style={{ animationDelay: `${0.04 * idx}s` }}
                      >
                        {/* Image zone */}
                        <div className="relative h-[160px] max-md:h-[132px] flex items-center justify-center overflow-hidden bg-gradient-to-br from-black/[0.04] to-black/[0.01] dark:from-white/[0.04] dark:to-white/[0.01]">
                          {img ? (
                            <img src={img} alt={item.title} className="h-full w-full object-cover" />
                          ) : (
                            <span className="text-[72px] max-md:text-[56px] leading-none select-none">{itemEmoji(item)}</span>
                          )}

                          {/* Category pill */}
                          {item.subCategory?.title && (
                            <span className={`absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.1em] ${pill}`}>
                              <span className={`w-1.5 h-1.5 rounded-full inline-block ${dot}`} />
                              {item.subCategory.title}
                            </span>
                          )}

                          {/* Hot badge */}
                          {(item.popularity_score ?? 0) >= 85 && (
                            <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.1em] bg-[#6bffb8]/10 text-[#00a37a] dark:text-[#6bffb8] border border-[#6bffb8]/20">
                              🔥 Hot
                            </span>
                          )}
                        </div>

                        {/* Content */}
                        <div className="p-4 flex flex-col gap-2.5">
                          <div>
                            <h3
                              className="text-[17px] font-bold text-slate-900 dark:text-white leading-[1.3] truncate"
                              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                            >
                              {item.title}
                            </h3>
                            <p
                              className="text-xs leading-[1.65] text-slate-400 dark:text-slate-600 mt-1.5 overflow-hidden"
                              style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}
                            >
                              {item.description ?? "Freshly prepared for your table."}
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
              )}
            </section>
          </>
        )}
      </main>

      {/* ── FLOATING CART BAR ──────────────────────────────────── */}
      {totalItems > 0 && !cartOpen && (
        <div className="fixed bottom-6 max-md:bottom-3 left-0 right-0 flex justify-center px-4 max-md:px-3 z-40">
          <button
            onClick={() => setCartOpen(true)}
            className="flex items-center gap-3.5 max-md:gap-3 px-6 py-3.5 max-md:px-4 max-md:py-3 rounded-[18px] max-md:rounded-[16px] border-none cursor-pointer bg-gradient-to-r from-[#6bffb8] to-[#00d4aa] text-[#0d1117] text-sm font-bold w-full max-w-[440px] max-md:max-w-none shadow-[0_16px_48px_rgba(107,255,184,0.32)] hover:opacity-95 transition-opacity"
          >
            <span className="w-7 h-7 rounded-full bg-black/20 flex items-center justify-center text-xs font-black shrink-0">
              {totalItems}
            </span>
            <span className="flex-1 text-left">View your order</span>
            <span className="font-black">{money(subtotal)}</span>
          </button>
        </div>
      )}

      {/* ── CART DRAWER ────────────────────────────────────────── */}
      {cartOpen && (
        <CartDrawer
          cart={cart}
          onAdd={addToCart}
          onRemove={removeFromCart}
          onClose={() => setCartOpen(false)}
          onOrder={placeOrder}
          ordered={ordered}
        />
      )}
    </div>
  );
}
