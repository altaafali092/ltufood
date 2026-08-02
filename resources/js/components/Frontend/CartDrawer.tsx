import { FoodItem } from "@/types/frontend/Index";

export type CartStateItem = FoodItem & { qty: number };
export type CartState = Record<number, CartStateItem>;

interface CartDrawerProps {
  cart: CartState;
  onAdd: (item: FoodItem) => void;
  onRemove: (id: number) => void;
  onClose: () => void;
  onOrder: () => void;
  ordered: boolean;
  money: (price: number) => string;
  itemImage: (item: FoodItem) => string | null;
  itemEmoji: (item: FoodItem) => string;
}

export default function CartDrawer({
  cart,
  onAdd,
  onRemove,
  onClose,
  onOrder,
  ordered,
  money,
  itemImage,
  itemEmoji,
}: CartDrawerProps) {
  const items = Object.values(cart);
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const service = Math.round(subtotal * 0.1);
  const total = subtotal + service;
  const totalQty = items.reduce((s, i) => s + i.qty, 0);

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="flex-1 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer Panel */}
      <div className="w-full max-w-[440px] md:max-w-[440px] bg-white dark:bg-[#0d1117] border-l border-black/[0.08] dark:border-white/[0.08] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-black/[0.08] dark:border-white/[0.08]">
          <div>
            <p className="text-[11px] uppercase tracking-[0.12em] text-[#6bffb8] mb-1 font-['DM_Sans',sans-serif]">
              Your Order
            </p>
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
            <p className="font-['Playfair_Display',Georgia,serif] text-[26px] font-bold text-slate-900 dark:text-white mb-2">
              Order Placed!
            </p>
            <p className="text-[13px] text-slate-500">
              Your food is being prepared. Sit back & relax 🎉
            </p>
          </div>
        ) : (
          <>
            {/* Items List */}
            <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-2.5">
              {items.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-16 text-center">
                  <p className="text-5xl mb-3">🛒</p>
                  <p className="text-[13px] text-slate-500">
                    Your cart is empty.
                    <br />
                    Add something delicious!
                  </p>
                </div>
              ) : (
                items.map((item) => {
                  const img = itemImage(item);
                  return (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 px-3.5 py-3 rounded-[14px] bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.07]"
                    >
                      <div className="w-9 h-9 shrink-0 overflow-hidden rounded-[8px] bg-black/[0.04] dark:bg-white/[0.06] flex items-center justify-center text-[22px]">
                        {img ? (
                          <img
                            src={img}
                            alt={item.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span>{itemEmoji(item)}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold text-slate-900 dark:text-white truncate">
                          {item.title}
                        </p>
                        <p className="text-[11px] text-slate-400 dark:text-slate-600 mt-0.5">
                          {money(item.price)} each
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => onRemove(item.id)}
                          className="w-7 h-7 rounded-full bg-black/[0.06] dark:bg-white/[0.08] text-slate-900 dark:text-white border-none cursor-pointer text-[15px] font-bold flex items-center justify-center hover:bg-black/15 dark:hover:bg-white/20 transition-colors"
                        >
                          −
                        </button>
                        <span className="text-[13px] font-bold text-slate-900 dark:text-white w-[18px] text-center">
                          {item.qty}
                        </span>
                        <button
                          onClick={() => onAdd(item)}
                          className="w-7 h-7 rounded-full bg-gradient-to-br from-[#6bffb8] to-[#00d4aa] text-[#0d1117] border-none cursor-pointer text-[15px] font-bold flex items-center justify-center hover:opacity-90 transition-opacity"
                        >
                          +
                        </button>
                      </div>
                      <span className="text-[13px] font-bold text-[#00a37a] dark:text-[#6bffb8] w-[70px] text-right shrink-0">
                        {money(item.price * item.qty)}
                      </span>
                    </div>
                  );
                })
              )}
            </div>

            {/* Totals + CTA */}
            {items.length > 0 && (
              <div className="px-6 pb-6 pt-4 border-t border-black/[0.08] dark:border-white/[0.08]">
                <div className="flex flex-col gap-2 mb-4">
                  {(
                    [
                      ["Subtotal", subtotal],
                      ["Service charge (10%)", service],
                    ] as [string, number][]
                  ).map(([label, val]) => (
                    <div
                      key={label}
                      className="flex justify-between text-[13px] text-slate-500"
                    >
                      <span>{label}</span>
                      <span>{money(val)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between text-[15px] font-bold text-slate-900 dark:text-white pt-2.5 border-t border-black/[0.08] dark:border-white/[0.08]">
                    <span>Total</span>
                    <span className="text-[#00a37a] dark:text-[#6bffb8]">
                      {money(total)}
                    </span>
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