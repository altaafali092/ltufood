import { useMemo, useState } from "react";
import { useAppearance } from "@/hooks/use-appearance";
import { FoodItem } from "@/types/frontend/Index";
import { Link, router, usePage } from "@inertiajs/react";
import { cartStore, cartUpdate, foodItemDetail, loginPage, ordersStore } from "@/routes";
import { CartItem, SharedData } from "@/types";
import { Money } from "@/Utils/Money";
import { OfficeSetting } from "@/types/frontend/officeSetting";
import {
    ArrowRight,
    CheckCheck,
    ChevronRight,
    CookingPot,
    Leaf,
    Loader2Icon,
    LogIn,
    LogsIcon,
    MapPin,
    Menu as MenuIcon,
    Minus,
    Plus,
    QrCode,
    Receipt,
    Search,
    ShoppingCart,
    Smartphone,
    Sparkles,
    Utensils,
    X,

} from "lucide-react";

import HeroSection from "@/components/Frontend/HeroCarousel";
import Footer from "./Frontend/Layout/Footer";
import { Textarea } from "@/components/ui/textarea";
import MenuGrid from "@/components/Frontend/MenuGrid";
import FloatingCartBar from "@/components/Frontend/cart/FloatingCartBar";
import Header from "./Frontend/Layout/Header";
import CartDrawer from "@/components/Frontend/cart/CartDrawer";



type CartState = Record<number, FoodItem & { qty: number }>;

const itemImage = (item: FoodItem): string | null =>
    Array.isArray(item.images) && item.images.length > 0 ? item.images[0] : null;



interface WelcomeProps {
    foodItems: FoodItem[];
    cartItems: CartItem[];
    totalQuantity: number;
    totalPrice: number;
    auth: SharedData
}

interface RecentOrder {
    id: string;
    date: string;
    count: number;
    total: number;
}

const requestOptions = {
    preserveScroll: true,
    preserveState: true,
};

const serif = { fontFamily: "'Playfair Display', Georgia, serif" } as const;

export default function Welcome({
    foodItems,
    totalQuantity,
    totalPrice,
    cartItems,

}: WelcomeProps) {
    const pageProps = usePage<{
        activeTable?: { id: number; table_number: string } | null;
        officeSetting?: OfficeSetting | null;
    }>().props;

    const { auth } = usePage().props as { auth?: { user: any } };

    const officeSetting = pageProps.officeSetting;
    const activeTable = pageProps.activeTable ?? null;
    const brandName = officeSetting?.office_name || "LTU Food";

    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("All");
    const [expanded, setExpanded] = useState(false);
    const [cartOpen, setCartOpen] = useState(false);
    const [ordersOpen, setOrdersOpen] = useState(false);
    const [ordered, setOrdered] = useState(false);
    const [orderProcessing, setOrderProcessing] = useState(false);
    const [note, setNote] = useState("");
    const [mobileNav, setMobileNav] = useState(false);
    const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);

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

    const popular = useMemo(
        () =>
            [...foodItems]
                .sort((a, b) => b.popularity_score - a.popularity_score)
                .slice(0, 4),
        [foodItems]
    );

    const hero = popular[0];


    const cart = useMemo<CartState>(() => {
        const foodItemsById = new Map(foodItems.map((item) => [item.id, item]));
        const rawItems = Array.isArray(cartItems)
            ? cartItems
            : Object.values(cartItems ?? {});

        return rawItems.reduce<CartState>((items, line: any) => {
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

    const cartLines = Object.values(cart);

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

    const placeOrder = (specialNote: string) => {
        if (cartLines.length === 0 || orderProcessing) return;
        const snapshot = { count: totalQuantity, total: totalPrice };
        setOrderProcessing(true);
        router.post(
            ordersStore().url,
            {
                table_id: activeTable?.id ?? null,
                notes: specialNote || null,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setRecentOrders((prev) => [
                        {
                            id: `LTU-${Date.now().toString(36).toUpperCase()}`,
                            date: new Date().toISOString(),
                            ...snapshot,
                        },
                        ...prev,
                    ]);
                    setOrdered(true);
                    setNote("");
                    setTimeout(() => {
                        setOrdered(false);
                        setCartOpen(false);
                    }, 3200);
                },
                onFinish: () => setOrderProcessing(false),
            }
        );
    };

    const showMenu = () => {
        setExpanded(true);
        setCategory("All");
        setSearch("");
        document.getElementById("menu")?.scrollIntoView({ behavior: "smooth" });
    };

    const scrollToMenu = () =>
        document.getElementById("menu")?.scrollIntoView({ behavior: "smooth" });

    const tabBase =
        "inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-4 py-2 text-[10px] font-medium transition-colors";

    return (
        <div className="min-h-screen bg-[#f7f8f7] text-slate-700 dark:bg-[#080c10] dark:text-slate-200">
            <style>{`
        @keyframes welcome-drawer-in { from { transform: translateX(100%); } to { transform: translateX(0); } }
        @keyframes welcome-fade-in { from { opacity: 0; } to { opacity: 1; } }
        .welcome-drawer-in { animation: welcome-drawer-in 0.28s ease-out; }
        .welcome-fade-in { animation: welcome-fade-in 0.2s ease-out; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { scrollbar-width: none; }
      `}</style>

            <Header
                isDark={isDark}
                toggleTheme={toggleTheme}
                totalItems={totalQuantity}
                setCartOpen={setCartOpen}
            />

            <main>

                <HeroSection
                    heroItems={foodItems}
                    addToCart={addToCart}
                    Money={Money}
                    itemImage={itemImage}
                />

                {/* ---------- How it works ---------- */}
                <section
                    id="how-it-works"
                    aria-label="How it works"
                    className="mx-auto grid w-full max-w-300 scroll-mt-24 items-center gap-6 rounded-[20px] border border-[#00a37a]/20 bg-[#00a37a]/6 p-7 px-6 md:grid-cols-[1.1fr_1fr_1.1fr_0.9fr] max-md:grid-cols-1 max-md:px-4"
                >
                    <div className="border-black/10 pr-4 md:border-r dark:border-white/10 max-md:border-b max-md:pb-4 max-md:pr-0">
                        <span className="text-[7px] font-semibold tracking-[1.2px] text-[#00a37a] dark:text-[#6bffb8]">
                            LESS WAITING. MORE ENJOYING.
                        </span>
                        <h2 className="mt-2 text-[22px] font-semibold tracking-tight text-slate-900 dark:text-white" style={serif}>
                            From scan to served.
                        </h2>
                    </div>
                    {[
                        { icon: QrCode, title: "Scan your table", text: "A unique QR. A menu just for you." },
                        { icon: Utensils, title: "Choose your favourites", text: "Browse, add, make it your own." },
                        { icon: CookingPot, title: "Order & relax", text: "We’ll take it from here." },
                    ].map((step, i) => (
                        <div className="relative flex items-center gap-3" key={step.title}>
                            <div className="relative grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-[#00a37a]/20 bg-white text-[#00a37a] dark:border-[#6bffb8]/20 dark:bg-[#111820] dark:text-[#6bffb8]">
                                <step.icon size={23} strokeWidth={1.6} />
                                <span className="absolute -right-1 -top-1 grid h-4 w-4 place-items-center rounded-full border-2 border-[#eef7f0] bg-[#00a37a] text-[7px] font-bold text-white dark:border-[#080c10] dark:bg-[#6bffb8] dark:text-[#063b27]">
                                    {i + 1}
                                </span>
                            </div>
                            <div>
                                <h3 className="mb-1 text-[11px] font-semibold text-slate-900 dark:text-white">{step.title}</h3>
                                <p className="text-[9px] text-slate-500 dark:text-slate-400">{step.text}</p>
                            </div>
                            {i < 2 && (
                                <ChevronRight size={15} className="absolute -right-5 hidden text-slate-300 dark:text-slate-600 md:block" />
                            )}
                        </div>
                    ))}
                </section>

                {/* ---------- Menu ---------- */}
                <MenuGrid
                    filtered={filtered}
                    cartItems={cartItems}
                    addToCart={addToCart}
                    removeFromCart={removeFromCart}
                    money={Money}
                    itemImage={itemImage}


                />


                <section className="mx-auto mt-1 grid w-full max-w-300 items-start gap-8 border-t border-black/[0.07] px-6 pb-14 pt-10 md:grid-cols-[1.45fr_1fr_1fr_1fr] dark:border-white/[0.07] max-md:grid-cols-1 max-md:px-4 max-md:pb-9 max-md:pt-8">
                    <div className="md:col-span-1 max-md:mb-0">
                        <span className="text-[8px] font-semibold tracking-[1.6px] text-[#00a37a] dark:text-[#6bffb8]">
                            THE {brandName.toUpperCase()} EXPERIENCE
                        </span>
                        <h2
                            className="mb-3 mt-2.5 text-[26px] font-semibold leading-[1.35] tracking-tight text-slate-900 dark:text-white"
                            style={serif}
                        >
                            Made for good food.
                            <br />
                            Designed around you.
                        </h2>
                        <p className="max-w-72.5 text-[11px] leading-[1.9] text-slate-500 dark:text-slate-400">
                            Less time trying to catch someone&rsquo;s attention. More time for the food, the
                            conversations, and the people at your table.
                        </p>
                    </div>
                    {[
                        { icon: Smartphone, title: "Your phone. Your menu.", text: "No downloads or paper menus. Everything you need, right in your browser." },
                        { icon: MapPin, title: "Always the right table.", text: "Every table has its own QR code, so your order knows exactly where to go." },
                        { icon: Receipt, title: "All your orders, together.", text: "A quick bite or one more round? Keep your order details in one place." },
                    ].map((card) => (
                        <div key={card.title} className="pt-2">
                            <span className="mb-5 grid h-12 w-12 place-items-center rounded-[15px] border border-[#00a37a]/20 bg-[#00a37a]/[.07] text-[#00a37a] dark:text-[#6bffb8]">
                                <card.icon size={24} strokeWidth={1.5} />
                            </span>
                            <h3 className="mb-2.5 text-[12px] font-semibold text-slate-900 dark:text-white">{card.title}</h3>
                            <p className="text-[11px] leading-[1.9] text-slate-500 dark:text-slate-400">{card.text}</p>
                        </div>
                    ))}
                </section>


                <section className="mx-auto w-full max-w-300 px-6 max-md:px-4">
                    <div className="relative flex items-center gap-6 overflow-hidden rounded-[22px] border border-[#234b3c] bg-[#0c3026] p-9 text-[#effbf3] max-md:flex-wrap max-md:gap-4 max-md:p-7 dark:bg-[#10231b]">
                        <div className="grid h-19 w-19 shrink-0 place-items-center rounded-[20px] border border-[#a3ffc225] bg-[#a3ffc20d] text-[#6bffb8] max-md:h-[52px] max-md:w-[52px]">
                            <QrCode size={38} strokeWidth={1.4} className="max-md:h-7 max-md:w-7" />
                        </div>
                        <div className="relative z-1 flex-1 max-md:basis-full">
                            <span className="text-[7px] tracking-[1.5px] text-[#74b69a]">
                                TAKE A SEAT. WE&rsquo;LL TAKE CARE OF THE REST.
                            </span>
                            <h2 className="mb-2.5 mt-2 text-[27px] font-medium tracking-tight max-md:text-[24px]" style={serif}>
                                Your next favourite is a scan away.
                            </h2>
                            <p className="text-[10px] text-[#89b5a0]">
                                Fresh flavours. Simple ordering. That&rsquo;s {brandName}.
                            </p>
                        </div>
                        <button
                            onClick={scrollToMenu}
                            className="relative z-1 inline-flex items-center gap-2.5 rounded-full bg-linear-to-br from-[#6bffb8] to-[#00d4aa] px-6 py-3.5 text-[11px] font-semibold text-[#073b2b] transition-transform hover:-translate-y-0.5"
                        >
                            Let&rsquo;s order
                            <ArrowRight size={17} />
                        </button>
                        <div className="absolute -top-30 right-10 h-80 w-80 rounded-full border border-[#86ffc215] shadow-[0_0_0_30px_#86ffc205,0_0_0_65px_#86ffc203] max-md:-right-[120px] max-md:-top-10" />
                    </div>
                </section>
            </main>


            <Footer />

            <FloatingCartBar
                totalQuantity={totalQuantity}
                totalPrice={totalPrice}
                cartOpen={cartOpen}
                setCartOpen={setCartOpen}
            />

            <CartDrawer
                cartOpen={cartOpen}
                setCartOpen={setCartOpen}
                ordered={ordered}
                activeTable={activeTable}
                showMenu={showMenu}
                cartLines={cartLines}
                totalQuantity={totalQuantity}
                totalPrice={totalPrice}
                itemImage={itemImage}
                removeFromCart={removeFromCart}
                addToCart={addToCart}
                note={note}
                setNote={setNote}
                auth={auth}
                placeOrder={placeOrder}
                orderProcessing={orderProcessing}
                loginPage={loginPage}
            />

        </div>
    );
}
