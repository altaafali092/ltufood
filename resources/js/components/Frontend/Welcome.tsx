import { useMemo, useState } from "react";
import { useAppearance } from "@/hooks/use-appearance";
import Header from "./Header";
import { FoodItem } from "@/types/frontend/Index";
import FilterBar from "./FilterBar";
import MenuGrid from "./MenuGrid";
import { Link, router, usePage } from "@inertiajs/react";
import { cartStore, cartUpdate, foodItemDetail, ordersStore } from "@/routes";
import FloatingCartBar from "./FloatingCartBar";
import CartDrawer, { CartState } from "./CartDrawer";
import { CartItem } from "@/types";
import { Money } from "@/Utils/Money";
import HeroCarousel from "./HeroCarousel";


const itemImage = (item: FoodItem): string | null =>
  Array.isArray(item.images) && item.images.length > 0 ? item.images[0] : null;

const itemEmoji = (item: FoodItem): string =>
  ((item.tags?.find((t) => t) ?? "") as string) || "🍽️";

interface WelcomeProps {
  foodItems: FoodItem[];
  cartItems: CartItem[];
  totalQuantity: number;
  totalPrice: number;
}

const requestOptions = {
  preserveScroll: true,
  preserveState: true,
};

export default function Welcome({
  foodItems,
  totalQuantity,
  totalPrice,
  cartItems,
}: WelcomeProps) {
  const pageProps = usePage<{
    activeTable?: { id: number; table_number: string } | null;
  }>().props;

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [cartOpen, setCartOpen] = useState(false);
  const [ordered, setOrdered] = useState(false);
  const [orderProcessing, setOrderProcessing] = useState(false);

  const { resolvedAppearance, updateAppearance } = useAppearance();
  const isDark = resolvedAppearance === "dark";
  const toggleTheme = () => updateAppearance(isDark ? "light" : "dark");

  const categories = useMemo(() => {
    const names = foodItems
      .map((item) => item.sub_category?.title)
      .filter((title): title is string => Boolean(title));
    return ["All", ...Array.from(new Set(names))];
  }, [foodItems]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();

    return foodItems.filter((item) => {
      const inCategory =
        category === "All" || item.sub_category?.title === category;

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

  const cart = useMemo<CartState>(() => {
    const foodItemsById = new Map(foodItems.map((item) => [item.id, item]));
    const rawItems = Array.isArray(cartItems)
      ? cartItems
      : Object.values(cartItems ?? {});

    return rawItems.reduce<CartState>((items, line) => {
      const foodItem = foodItemsById.get(line.food_item_id);

      items[line.food_item_id] = {
        ...(foodItem ?? {
          id: line.food_item_id,
          title: line.title,
          slug: line.slug ?? String(line.food_item_id),
          description: null,
          price: line.price,
          popularity_score: 0,
          images: null,
          status: true,
          tags: null,
          sub_category: null,
        }),
        qty: line.quantity ?? line.qty ?? 1,
      };

      return items;
    }, {});
  }, [foodItems, cartItems]);

  const addToCart = (item: FoodItem) => {
    router.post(cartStore(item.id).url, { quantity: 1 }, requestOptions);
  };

  const removeFromCart = (id: number) => {
    const quantity = cart[id]?.qty ?? 0;

    if (quantity > 1) {
      router.put(cartUpdate(id).url, { quantity: quantity - 1 }, requestOptions);
      return;
    }

    router.delete(`/cart/${id}`, requestOptions);
  };

  const placeOrder = () => {
    if (Object.keys(cart).length === 0 || orderProcessing) {
      return;
    }

    setOrderProcessing(true);

    router.post(
      ordersStore().url,
      {
        table_id: pageProps.activeTable?.id ?? null,
      },
      {
        preserveScroll: true,
        onSuccess: () => {
          setOrdered(true);
          setTimeout(() => {
            setOrdered(false);
            setCartOpen(false);
          }, 3200);
        },
        onFinish: () => setOrderProcessing(false),
      },
    );
  };

  return (
    <div
      className="min-h-screen bg-[#f7f8f7] dark:bg-[#080c10] text-slate-700 dark:text-slate-200"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      <Header
        isDark={isDark}
        toggleTheme={toggleTheme}
        totalItems={totalQuantity}
        setCartOpen={setCartOpen}
      />

      <main className="max-w-300 mx-auto px-6 pb-20 pt-9 max-md:px-4 max-md:pb-24 max-md:pt-5">
        {foodItems.length === 0 ? (
          <div className="rounded-[22px] py-20 px-6 text-center bg-black/2 dark:bg-white/3 border border-black/6 dark:border-white/[0.07]">
            <p className="text-6xl mb-4">🍽️</p>
            <p className="font-bold text-slate-900 dark:text-white text-lg mb-1.5">
              The menu is being prepared
            </p>
            <p className="text-[13px] text-slate-400 dark:text-slate-600">
              No dishes are available right now. Please check back soon.
            </p>
          </div>
        ) : (
          <>
            {/* Hero Grid */}
            <section className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-5 mb-10 max-md:grid-cols-1 max-md:gap-3.5 max-md:mb-6 animate-[fadeUp_.5s_ease_both]">
              <div className="col-span-2 max-md:col-span-1">
                <HeroCarousel
                  heroItems={foodItems}
                  addToCart={addToCart}
                  Money={Money}
                  itemImage={itemImage} // Pass your image helper function down
                />
              </div>

              {/* Stat Cards */}
              <div className="rounded-[22px] max-md:rounded-[18px] p-5 max-md:p-5 bg-black/3 dark:bg-white/4 border border-black/6 dark:border-white/[0.07] flex flex-col gap-2.5">
                <div className="w-10.5 h-10.5 rounded-[12px] bg-[#6bffb8]/10 flex items-center justify-center text-[22px]">
                  ⚡
                </div>
                <p className="font-bold text-slate-900 dark:text-white text-base">
                  Instant ordering
                </p>
                <p className="text-xs text-slate-500 leading-[1.6]">
                  Browse the menu and place your order directly from this page — no waiting for staff.
                </p>
              </div>

              <div className="rounded-[22px] max-md:rounded-[18px] p-5 max-md:p-4.5 bg-black/3 dark:bg-white/4 border border-black/6 dark:border-white/[0.07] flex flex-col gap-2.5">
                <div className="w-10.5 h-10.5 rounded-[12px] bg-yellow-400/10 flex items-center justify-center text-[22px]">
                  🍴
                </div>
                <p className="font-bold text-slate-900 dark:text-white text-base">
                  {foodItems.length} dishes
                </p>
                <p className="text-xs text-slate-500 leading-[1.6]">
                  {categories.length - 1} categories from Nepali classics to Italian comfort food and more.
                </p>
              </div>

              {/* Popular Picks */}
              <div className="rounded-[22px] max-md:rounded-[18px] p-5 max-md:p-4.5 bg-black/3 dark:bg-white/4 border border-black/6 dark:border-white/[0.07] col-span-2 max-md:col-span-1">
                <p className="text-[11px] uppercase tracking-[0.12em] text-[#00a37a] dark:text-[#6bffb8] mb-4">
                  🔥 Popular picks
                </p>
                <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] max-md:grid-cols-1 gap-4 max-md:gap-3.5">
                  {popular.map((item, i) => {
                    const img = itemImage(item);
                    return (
                      <Link
                        key={item.id}
                        href={foodItemDetail(item.slug)}
                        className="flex items-center gap-2.5 group cursor-pointer hover:bg-black/2 dark:hover:bg-white/2 p-1.5 -m-1.5 rounded-xl transition-colors duration-200"
                      >
                        <span
                          className="text-xs font-bold text-slate-300 dark:text-[#6bffb8]/30 w-5.5 group-hover:text-emerald-500 dark:group-hover:text-[#6bffb8] transition-colors"
                          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                        >
                          0{i + 1}
                        </span>
                        <div className="w-10 h-10 shrink-0 overflow-hidden rounded-xl bg-black/4 dark:bg-white/6 flex items-center justify-center text-[20px] border border-black/4 dark:border-white/4 group-hover:scale-[1.03] transition-transform duration-300 ease-out">
                          {img ? (
                            <img src={img} alt={item.title} className="h-full w-full object-cover" />
                          ) : (
                            <span className="select-none transform group-hover:scale-110 transition-transform">
                              {itemEmoji(item)}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-semibold text-slate-800 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-[#6bffb8] truncate transition-colors duration-150">
                            {item.title}
                          </p>
                          <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium mt-0.5">
                            {Money(item.price)}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </section>

            <FilterBar
              search={search}
              setSearch={setSearch}
              category={category}
              setCategory={setCategory}
              categories={categories}
            />

            <MenuGrid
              filtered={filtered}
              cartItems={cartItems}
              addToCart={addToCart}
              removeFromCart={removeFromCart}
              money={Money}
              itemImage={itemImage}
              itemEmoji={itemEmoji}
            />
          </>
        )}
      </main>

      {/* Floating Cart Bar */}
      {totalQuantity > 0 && !cartOpen && (
        <FloatingCartBar
          totalQuantity={totalQuantity}
          subtotal={totalPrice}
          onOpenCart={() => setCartOpen(true)}
        />
      )}

      {/* Cart Drawer */}
      {cartOpen && (
        <CartDrawer
          cart={cart}
          onAdd={addToCart}
          onRemove={removeFromCart}
          onClose={() => setCartOpen(false)}
          onOrder={placeOrder}
          ordered={ordered}
          money={Money}
          itemImage={itemImage}
          itemEmoji={itemEmoji}
        />
      )}
    </div>
  );
}
