import { useMemo, useState } from "react";

type MenuCategory = {
  id: number;
  title: string;
};

type MenuItem = {
  id: number;
  title: string;
  description: string;
  price: number;
  popularity_score: number;
  foodCategory?: MenuCategory;
  emoji: string;
};

type CartItem = MenuItem & {
  qty: number;
};

type CartState = Record<number, CartItem>;

/* ─── Fake data ────────────────────────────────────────────────────────── */
const FOOD_ITEMS: MenuItem[] = [
  { id: 1, title: "Momo (Steam)", description: "Hand-folded dumplings stuffed with spiced minced chicken, ginger & garlic, served with tomato achar.", price: 180, popularity_score: 98, foodCategory: { id: 1, title: "Nepali" }, emoji: "🥟" },
  { id: 2, title: "Dal Bhat Set", description: "Traditional set — steamed rice, lentil soup, seasonal vegetable curry, pickles & papad.", price: 250, popularity_score: 95, foodCategory: { id: 1, title: "Nepali" }, emoji: "🍛" },
  { id: 3, title: "Chowmein", description: "Stir-fried egg noodles with crunchy vegetables and house soy-chilli sauce.", price: 160, popularity_score: 88, foodCategory: { id: 2, title: "Chinese" }, emoji: "🍜" },
  { id: 4, title: "Fried Rice", description: "Wok-tossed jasmine rice with egg, spring onions, sweet corn & sesame oil.", price: 170, popularity_score: 82, foodCategory: { id: 2, title: "Chinese" }, emoji: "🍚" },
  { id: 5, title: "Margherita Pizza", description: "San Marzano tomato base, fresh mozzarella, basil leaves baked in a stone oven.", price: 420, popularity_score: 76, foodCategory: { id: 3, title: "Italian" }, emoji: "🍕" },
  { id: 6, title: "Pasta Arrabiata", description: "Penne pasta in fiery tomato-chilli sauce with garlic and fresh parsley.", price: 350, popularity_score: 71, foodCategory: { id: 3, title: "Italian" }, emoji: "🍝" },
  { id: 7, title: "Chicken Burger", description: "Crispy fried chicken thigh, pickled jalapeños, sriracha mayo on a toasted brioche bun.", price: 290, popularity_score: 85, foodCategory: { id: 4, title: "Fast Food" }, emoji: "🍔" },
  { id: 8, title: "Loaded Fries", description: "Thick-cut fries, melted cheddar, crispy bacon bits, sour cream & chives.", price: 220, popularity_score: 79, foodCategory: { id: 4, title: "Fast Food" }, emoji: "🍟" },
  { id: 9, title: "Masala Chai", description: "Spiced milk tea brewed with cardamom, ginger, cinnamon & Assam tea leaves.", price: 60, popularity_score: 91, foodCategory: { id: 5, title: "Drinks" }, emoji: "🍵" },
  { id: 10, title: "Fresh Juice", description: "Cold-pressed seasonal fruit juice — orange, mango or mixed berry.", price: 120, popularity_score: 74, foodCategory: { id: 5, title: "Drinks" }, emoji: "🥤" },
  { id: 11, title: "Thukpa", description: "Tibetan noodle soup with bone broth, tender vegetables and hand-rolled noodles.", price: 200, popularity_score: 87, foodCategory: { id: 1, title: "Nepali" }, emoji: "🍲" },
  { id: 12, title: "Chocolate Lava Cake", description: "Warm dark-chocolate cake with a molten centre, served with a scoop of vanilla ice cream.", price: 280, popularity_score: 90, foodCategory: { id: 6, title: "Desserts" }, emoji: "🍫" },
];

const money = (price: number) =>
  new Intl.NumberFormat("en-NP", { style: "currency", currency: "NPR", maximumFractionDigits: 0 }).format(Number(price || 0));

const CAT_STYLE: Record<string, { bg: string; text: string; dot: string }> = {
  Nepali: { bg: "rgba(251,146,60,.12)", text: "#fb923c", dot: "#fb923c" },
  Chinese: { bg: "rgba(248,113,113,.12)", text: "#f87171", dot: "#f87171" },
  Italian: { bg: "rgba(74,222,128,.12)", text: "#4ade80", dot: "#4ade80" },
  "Fast Food": { bg: "rgba(250,204,21,.12)", text: "#facc15", dot: "#facc15" },
  Drinks: { bg: "rgba(96,165,250,.12)", text: "#60a5fa", dot: "#60a5fa" },
  Desserts: { bg: "rgba(232,121,249,.12)", text: "#e879f9", dot: "#e879f9" },
};
const cs = (cat?: string) => CAT_STYLE[cat ?? ""] ?? { bg: "rgba(148,163,184,.12)", text: "#94a3b8", dot: "#94a3b8" };

/* ─── Cart Drawer ────────────────────────────────────────────────────────── */
function CartDrawer({
  cart,
  onAdd,
  onRemove,
  onClose,
  onOrder,
  ordered,
}: {
  cart: CartState;
  onAdd: (item: MenuItem) => void;
  onRemove: (id: number) => void;
  onClose: () => void;
  onOrder: () => void;
  ordered: boolean;
}) {
  const items = Object.values(cart);
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const service = Math.round(subtotal * .10);
  const total = subtotal + service;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="drawer-panel">

        {/* header */}
        <div style={{ padding: "20px 24px", borderBottom: "1px solid rgba(255,255,255,.08)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.12em", color: "#6bffb8", marginBottom: 4 }}>Your Order</p>
            <p style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 22, fontWeight: 700, color: "#fff" }}>
              {items.reduce((s, i) => s + i.qty, 0)} item{items.reduce((s, i) => s + i.qty, 0) !== 1 ? "s" : ""}
            </p>
          </div>
          <button onClick={onClose} style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,.07)", color: "#94a3b8", border: "none", cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        </div>

        {ordered ? (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32, textAlign: "center" }}>
            <div style={{ fontSize: 64, marginBottom: 16, animation: "bounce 1s infinite" }}>✅</div>
            <p style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 26, fontWeight: 700, color: "#fff", marginBottom: 8 }}>Order Placed!</p>
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "#64748b" }}>Your food is being prepared. Sit back & relax 🎉</p>
          </div>
        ) : (
          <>
            <div style={{ flex: 1, overflowY: "auto", padding: "16px 24px", display: "flex", flexDirection: "column", gap: 10 }}>
              {items.length === 0 && (
                <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 0", textAlign: "center" }}>
                  <p style={{ fontSize: 48, marginBottom: 12 }}>🛒</p>
                  <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "#475569" }}>Your cart is empty.<br />Add something delicious!</p>
                </div>
              )}
              {items.map(item => (
                <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 14, background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.07)" }}>
                  <span style={{ fontSize: 26 }}>{item.emoji}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 600, color: "#fff", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>{item.title}</p>
                    <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: "#475569", marginTop: 2 }}>{money(item.price)} each</p>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <button onClick={() => onRemove(item.id)} style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(255,255,255,.08)", color: "#fff", border: "none", cursor: "pointer", fontSize: 15, fontWeight: 700 }}>−</button>
                    <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 700, color: "#fff", width: 18, textAlign: "center" }}>{item.qty}</span>
                    <button onClick={() => onAdd(item)} style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg,#6bffb8,#00d4aa)", color: "#0d1117", border: "none", cursor: "pointer", fontSize: 15, fontWeight: 700 }}>+</button>
                  </div>
                  <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 700, color: "#6bffb8", width: 70, textAlign: "right", flexShrink: 0 }}>{money(item.price * item.qty)}</span>
                </div>
              ))}
            </div>

            {items.length > 0 && (
              <div style={{ padding: "16px 24px 24px", borderTop: "1px solid rgba(255,255,255,.08)" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
                  {([["Subtotal", subtotal], ["Service charge (10%)", service]] as [string, number][]).map(([label, val]) => (
                    <div key={label} style={{ display: "flex", justifyContent: "space-between", fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "#64748b" }}>
                      <span>{label}</span><span>{money(val)}</span>
                    </div>
                  ))}
                  <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "'DM Sans',sans-serif", fontSize: 15, fontWeight: 700, color: "#fff", paddingTop: 10, borderTop: "1px solid rgba(255,255,255,.08)" }}>
                    <span>Total</span><span style={{ color: "#6bffb8" }}>{money(total)}</span>
                  </div>
                </div>
                <button onClick={onOrder} style={{ width: "100%", padding: "14px 0", borderRadius: 14, fontFamily: "'DM Sans',sans-serif", fontSize: 14, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", background: "linear-gradient(135deg,#6bffb8,#00d4aa)", color: "#0d1117", border: "none", cursor: "pointer" }}>
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

/* ─── Main ────────────────────────────────────────────────────────────────── */
export default function Welcome() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [cart, setCart] = useState<CartState>({});
  const [cartOpen, setCartOpen] = useState(false);
  const [ordered, setOrdered] = useState(false);

  const categories = useMemo(() => {
    const n = FOOD_ITEMS
      .map((i) => i.foodCategory?.title)
      .filter((title): title is string => Boolean(title));

    return ["All", ...Array.from(new Set(n))];
  }, []);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();

    return FOOD_ITEMS.filter(item => {
      const inCat = category === "All" || item.foodCategory?.title === category;
      const inS = !term || item.title.toLowerCase().includes(term) || item.description?.toLowerCase().includes(term);

      return inCat && inS;
    });
  }, [search, category]);

  const popular = useMemo(() => [...FOOD_ITEMS].sort((a, b) => (b.popularity_score ?? 0) - (a.popularity_score ?? 0)).slice(0, 4), []);
  const hero = popular[0];

  const addToCart = (item: MenuItem) =>
    setCart((p) => ({ ...p, [item.id]: { ...item, qty: (p[item.id]?.qty || 0) + 1 } }));
  const removeFromCart = (id: number) =>
    setCart((p) => {
      const u = { ...p };

      if (u[id]?.qty > 1) {
        u[id] = { ...u[id], qty: u[id].qty - 1 };
      } else {
        delete u[id];
      }

      return u;
    });
  const totalItems = Object.values(cart).reduce((s, i) => s + i.qty, 0);
  const subtotal = Object.values(cart).reduce((s, i) => s + i.price * i.qty, 0);
  const placeOrder = () => {
 setOrdered(true); setTimeout(() => {
 setCart({}); setOrdered(false); setCartOpen(false); 
}, 3200); 
};

  return (
    <div style={{ minHeight: "100vh", background: "#080c10", fontFamily: "'DM Sans',sans-serif", color: "#e2e8f0" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,400&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
        @keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}
        .fade-up{animation:fadeUp .5s ease both;}
        .card{transition:transform .22s ease,box-shadow .22s ease;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);border-radius:20px;overflow:hidden;}
        .card:hover{transform:translateY(-5px);box-shadow:0 20px 56px rgba(107,255,184,.09);}
        .pill-btn{border:none;cursor:pointer;border-radius:9999px;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:600;transition:all .18s ease;}
        .pill-btn:hover{opacity:.88;}
        .icon-btn{border:none;cursor:pointer;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:15px;transition:all .18s ease;}
        .icon-btn:hover{transform:scale(1.1);}
        ::-webkit-scrollbar{width:5px;height:5px;}
        ::-webkit-scrollbar-thumb{background:rgba(255,255,255,.1);border-radius:99px;}
        .drawer-panel{width:min(440px,100vw);background:#0d1117;border-left:1px solid rgba(255,255,255,.08);display:flex;flex-direction:column;}
        .page-shell{max-width:1200px;margin:0 auto;padding:36px 24px 80px;}
        .header-inner{max-width:1200px;margin:0 auto;padding:14px 24px;display:flex;align-items:center;justify-content:space-between;gap:16px;}
        .header-actions{display:flex;align-items:center;gap:10px;}
        .hero-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:20px;margin-bottom:40px;}
        .hero-card{position:relative;min-height:400px;border-radius:28px;overflow:hidden;background:linear-gradient(145deg,#0e1f14,#0a1118);border:1px solid rgba(107,255,184,.14);padding:36px;display:flex;flex-direction:column;justify-content:flex-end;grid-column:span 2;}
        .stats-card{border-radius:22px;padding:22px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);display:flex;flex-direction:column;gap:10px;}
        .popular-card{border-radius:22px;padding:22px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);grid-column:span 2;}
        .popular-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:14px;}
        .filter-panel{border-radius:22px;padding:22px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.07);margin-bottom:28px;}
        .filter-top{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:16px;margin-bottom:18px;}
        .search-box{position:relative;width:min(280px,100%);}
        .menu-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:18px;}
        .floating-cart{position:fixed;bottom:24px;left:0;right:0;display:flex;justify-content:center;padding:0 16px;z-index:40;}
        .floating-cart-btn{display:flex;align-items:center;gap:14px;padding:14px 24px;border-radius:18px;border:none;cursor:pointer;background:linear-gradient(135deg,#6bffb8,#00d4aa);color:#0d1117;font-family:'DM Sans',sans-serif;font-size:14px;font-weight:700;width:100%;max-width:440px;box-shadow:0 16px 48px rgba(107,255,184,.32);}
        @media (max-width: 768px){
          .page-shell{padding:20px 16px 88px;}
          .header-inner{padding:12px 16px;align-items:stretch;flex-direction:column;}
          .header-actions{width:100%;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;}
          .header-chip,.header-cart-button{width:100%;justify-content:center;padding-left:10px !important;padding-right:10px !important;}
          .hero-grid{grid-template-columns:1fr;gap:14px;margin-bottom:24px;}
          .hero-card,.popular-card{grid-column:auto;padding:22px;border-radius:22px;}
          .hero-card{min-height:320px;}
          .hero-copy{max-width:none !important;}
          .hero-title{font-size:34px !important;}
          .hero-emoji{font-size:52px !important;}
          .stats-card{padding:18px;border-radius:18px;}
          .popular-grid{grid-template-columns:1fr;gap:12px;}
          .filter-panel{padding:18px;border-radius:18px;margin-bottom:22px;}
          .filter-top{align-items:stretch;gap:14px;}
          .search-box{width:100%;}
          .menu-grid{grid-template-columns:1fr;gap:14px;}
          .menu-emoji-zone{height:132px !important;}
          .menu-emoji{font-size:56px !important;}
          .floating-cart{bottom:12px;padding:0 12px;}
          .floating-cart-btn{max-width:none;padding:13px 16px;border-radius:16px;gap:12px;}
          .drawer-panel{width:100vw;border-left:none;}
        }
      `}</style>

      {/* ── HEADER ──────────────────────────────────────────── */}
      <header style={{ position: "sticky", top: 0, zIndex: 40, background: "rgba(8,12,16,.94)", backdropFilter: "blur(18px)", borderBottom: "1px solid rgba(255,255,255,.06)" }}>
        <div className="header-inner">
          {/* logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 42, height: 42, borderRadius: 14, background: "linear-gradient(135deg,#6bffb8,#00d4aa)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🍽️</div>
            <div>
              <p style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 20, fontWeight: 700, color: "#fff", lineHeight: 1.1 }}>LTU Food</p>
              <p style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.15em", color: "#6bffb8", marginTop: 2 }}>Scan · Choose · Order</p>
            </div>
          </div>
          {/* nav */}
          <div className="header-actions">
            <button className="pill-btn header-chip" style={{ background: "transparent", color: "#94a3b8", padding: "8px 14px" }}>Log in</button>
            <button className="pill-btn header-chip" style={{ background: "rgba(107,255,184,.1)", color: "#6bffb8", border: "1px solid rgba(107,255,184,.22)", padding: "8px 18px" }}>Register</button>
            <button
              className="pill-btn header-cart-button"
              onClick={() => setCartOpen(true)}
              style={{
                background: totalItems > 0 ? "linear-gradient(135deg,#6bffb8,#00d4aa)" : "rgba(255,255,255,.07)",
                color: totalItems > 0 ? "#0d1117" : "#94a3b8",
                border: totalItems > 0 ? "none" : "1px solid rgba(255,255,255,.1)",
                padding: "9px 18px", display: "flex", alignItems: "center", gap: 7
              }}
            >
              🛒 {totalItems > 0 ? `${totalItems} item${totalItems > 1 ? "s" : ""}` : "Cart"}
            </button>
          </div>
        </div>
      </header>


   

      <main className="page-shell">

        {/* ── HERO ────────────────────────────────────────────── */}
        <section className="hero-grid fade-up">
          {/* hero card */}
          <div className="hero-card">
            {/* blobs */}
            <div style={{ position: "absolute", top: -80, right: -80, width: 280, height: 280, borderRadius: "50%", background: "radial-gradient(circle,rgba(107,255,184,.18),transparent)", filter: "blur(40px)" }} />
            <div style={{ position: "absolute", bottom: -60, left: -40, width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle,rgba(0,212,170,.12),transparent)", filter: "blur(32px)" }} />
            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(107,255,184,.12)", border: "1px solid rgba(107,255,184,.22)", borderRadius: 99, padding: "5px 14px", marginBottom: 20 }}>
                <span style={{ fontSize: 11 }}>✦</span>
                <span style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.12em", color: "#6bffb8" }}>Today's favourite</span>
              </div>
              <div className="hero-emoji" style={{ fontSize: 72, marginBottom: 16, lineHeight: 1 }}>{hero.emoji}</div>
              <h1 className="hero-title" style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: "clamp(32px,5vw,52px)", fontWeight: 900, color: "#fff", lineHeight: 1.1, marginBottom: 12 }}>{hero.title}</h1>
              <p className="hero-copy" style={{ fontSize: 14, lineHeight: 1.7, color: "#64748b", maxWidth: 440, marginBottom: 24 }}>{hero.description}</p>
              <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                <span style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 26, fontWeight: 700, color: "#6bffb8" }}>{money(hero.price)}</span>
                <button className="pill-btn" onClick={() => addToCart(hero)}
                  style={{ background: "linear-gradient(135deg,#6bffb8,#00d4aa)", color: "#0d1117", padding: "12px 24px", fontSize: 14, display: "flex", alignItems: "center", gap: 8 }}>
                  🛒 Add to order
                </button>
              </div>
            </div>
          </div>

          {/* stat card 1 */}
          <div className="stats-card">
            <div style={{ width: 42, height: 42, borderRadius: 12, background: "rgba(107,255,184,.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>⚡</div>
            <p style={{ fontWeight: 700, color: "#fff", fontSize: 16 }}>Instant ordering</p>
            <p style={{ fontSize: 12, color: "#475569", lineHeight: 1.6 }}>Browse the menu and place your order directly from this page — no waiting for staff.</p>
          </div>

          {/* stat card 2 */}
          <div className="stats-card">
            <div style={{ width: 42, height: 42, borderRadius: 12, background: "rgba(250,204,21,.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>🍴</div>
            <p style={{ fontWeight: 700, color: "#fff", fontSize: 16 }}>{FOOD_ITEMS.length} dishes</p>
            <p style={{ fontSize: 12, color: "#475569", lineHeight: 1.6 }}>{categories.length - 1} categories from Nepali classics to Italian comfort food and more.</p>
          </div>

          {/* popular picks */}
          <div className="popular-card">
            <p style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.12em", color: "#6bffb8", marginBottom: 18 }}>🔥 Popular picks</p>
            <div className="popular-grid">
              {popular.map((item, i) => (
                <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 12, fontWeight: 700, color: "rgba(107,255,184,.4)", width: 22 }}>0{i + 1}</span>
                  <span style={{ fontSize: 22 }}>{item.emoji}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "#fff", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>{item.title}</p>
                    <p style={{ fontSize: 11, color: "#475569", marginTop: 2 }}>{money(item.price)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FILTER BAR ──────────────────────────────────────── */}
        <section className="filter-panel fade-up" style={{ animationDelay: ".1s" }}>
          <div className="filter-top">
            <div>
              <h2 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 26, fontWeight: 700, color: "#fff" }}>Full Menu</h2>
              <p style={{ fontSize: 12, color: "#475569", marginTop: 4 }}>Filter by category · search what you crave</p>
            </div>
            <div className="search-box">
              <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 14, color: "#475569" }}>🔍</span>
              <input
                value={search} onChange={e => setSearch(e.target.value)} placeholder="Search dishes…"
                style={{ width: "100%", padding: "10px 14px 10px 40px", borderRadius: 12, background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)", color: "#fff", fontSize: 13, outline: "none", fontFamily: "'DM Sans',sans-serif" }}
              />
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
            {categories.map(cat => (
              <button key={cat} className="pill-btn" onClick={() => setCategory(cat)}
                style={{
                  padding: "7px 18px", whiteSpace: "nowrap",
                  background: category === cat ? "linear-gradient(135deg,#6bffb8,#00d4aa)" : "rgba(255,255,255,.05)",
                  color: category === cat ? "#0d1117" : "#94a3b8",
                  border: category === cat ? "none" : "1px solid rgba(255,255,255,.08)"
                }}>
                {cat}
              </button>
            ))}
          </div>
        </section>

        {/* ── MENU GRID ───────────────────────────────────────── */}
        <section className="fade-up" style={{ animationDelay: ".2s" }}>
          {filtered.length === 0 ? (
            <div style={{ borderRadius: 22, padding: "64px 24px", textAlign: "center", background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.07)" }}>
              <p style={{ fontSize: 48, marginBottom: 12 }}>🍽️</p>
              <p style={{ fontWeight: 700, color: "#fff", fontSize: 16, marginBottom: 6 }}>No dishes found</p>
              <p style={{ fontSize: 13, color: "#475569" }}>Try a different category or search term.</p>
            </div>
          ) : (
            <div className="menu-grid">
              {filtered.map((item, idx) => {
                const style = cs(item.foodCategory?.title);
                const inCart = cart[item.id];

                return (
                  <article key={item.id} className="card fade-up" style={{ animationDelay: `${.04 * idx}s` }}>
                    {/* emoji zone */}
                    <div className="menu-emoji-zone" style={{
                      position: "relative", height: 160, display: "flex", alignItems: "center", justifyContent: "center",
                      background: `linear-gradient(145deg,rgba(255,255,255,.04),rgba(255,255,255,.01))`
                    }}>
                      <span className="menu-emoji" style={{ fontSize: 72, lineHeight: 1, userSelect: "none" }}>{item.emoji}</span>
                      {/* category */}
                      <span style={{
                        position: "absolute", top: 12, left: 12, padding: "4px 10px", borderRadius: 99, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em",
                        background: style.bg, color: style.text, display: "flex", alignItems: "center", gap: 5
                      }}>
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: style.dot, display: "inline-block" }} />
                        {item.foodCategory?.title}
                      </span>
                      {/* hot badge */}
                      {(item.popularity_score ?? 0) >= 85 && (
                        <span style={{
                          position: "absolute", top: 12, right: 12, padding: "4px 10px", borderRadius: 99, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em",
                          background: "rgba(107,255,184,.1)", color: "#6bffb8", border: "1px solid rgba(107,255,184,.2)"
                        }}>
                          🔥 Hot
                        </span>
                      )}
                    </div>

                    {/* content */}
                    <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: 10 }}>
                      <div>
                        <h3 style={{
                          fontFamily: "'Playfair Display',Georgia,serif", fontSize: 17, fontWeight: 700, color: "#fff", lineHeight: 1.3,
                          overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical"
                        }}>{item.title}</h3>
                        <p style={{
                          fontSize: 12, lineHeight: 1.65, color: "#475569", marginTop: 6,
                          overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical"
                        }}>
                          {item.description ?? "Freshly prepared for your table."}
                        </p>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginTop: 4 }}>
                        <span style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 18, fontWeight: 700, color: "#6bffb8" }}>{money(item.price)}</span>
                        {inCart ? (
                          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                            <button className="icon-btn" onClick={() => removeFromCart(item.id)} style={{ width: 30, height: 30, background: "rgba(255,255,255,.08)", color: "#fff" }}>−</button>
                            <span style={{ fontSize: 13, fontWeight: 700, color: "#fff", width: 18, textAlign: "center" }}>{inCart.qty}</span>
                            <button className="icon-btn" onClick={() => addToCart(item)} style={{ width: 30, height: 30, background: "linear-gradient(135deg,#6bffb8,#00d4aa)", color: "#0d1117" }}>+</button>
                          </div>
                        ) : (
                          <button className="pill-btn" onClick={() => addToCart(item)}
                            style={{ padding: "8px 16px", fontSize: 12, background: "rgba(107,255,184,.1)", color: "#6bffb8", border: "1px solid rgba(107,255,184,.22)" }}>
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
      </main>

      {/* ── FLOATING CART BAR ──────────────────────────────────── */}
      {totalItems > 0 && !cartOpen && (
        <div className="floating-cart">
          <button onClick={() => setCartOpen(true)}
            className="floating-cart-btn">
            <span style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(0,0,0,.18)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 900 }}>{totalItems}</span>
            <span style={{ flex: 1, textAlign: "left" }}>View your order</span>
            <span style={{ fontWeight: 900 }}>{money(subtotal)}</span>
          </button>
        </div>
      )}

      {/* ── CART DRAWER ────────────────────────────────────────── */}
      {cartOpen && <CartDrawer cart={cart} onAdd={addToCart} onRemove={removeFromCart} onClose={() => setCartOpen(false)} onOrder={placeOrder} ordered={ordered} />}
    </div>
  );
}
