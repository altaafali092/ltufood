import React from 'react';
import { Link } from '@inertiajs/react';
import {
    X,
    ShoppingCart,
    Minus,
    Plus,
    CheckCheck,
    ArrowRight,
    LogIn,
    Loader2 as Loader2Icon,
} from 'lucide-react';
import { Money } from '@/Utils/Money';
import { Textarea } from '@/components/ui/textarea';


interface CartLineItem {
    id: number;
    title: string;
    price: number;
    qty: number;
    [key: string]: any;
}

interface ActiveTable {
    table_number: string | number;
}

interface CartDrawerProps {
    cartOpen: boolean;
    setCartOpen: (open: boolean) => void;
    ordered: boolean;
    activeTable?: ActiveTable | null;
    showMenu: () => void;
    cartLines: CartLineItem[];
    totalQuantity: number;
    totalPrice: number;
    itemImage: (item: any) => string | null;
    itemEmoji: (item: any) => string;
    removeFromCart: (id: number) => void;
    addToCart: (item: any) => void;
    note: string;
    setNote: (note: string) => void;
    auth?: {
        user?: any;
    };
    placeOrder: (note: string) => void;
    orderProcessing: boolean;
    loginPage: () => { url: string };
    serif?: React.CSSProperties;
}

export default function CartDrawer({
    cartOpen,
    setCartOpen,
    ordered,
    activeTable,
    showMenu,
    cartLines,
    totalQuantity,
    totalPrice,
    itemImage,
    itemEmoji,
    removeFromCart,
    addToCart,
    note,
    setNote,
    auth,
    placeOrder,
    orderProcessing,
    loginPage,
    serif,
}: CartDrawerProps) {
    if (!cartOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex justify-end"
            role="dialog"
            aria-modal="true"
            aria-label="Your cart"
        >
            <button
                type="button"
                aria-label="Close cart backdrop"
                onClick={() => setCartOpen(false)}
                className="welcome-fade-in absolute inset-0 cursor-default bg-black/30 backdrop-blur-[2px]"
            />
            <div className="welcome-drawer-in relative z-1 h-full w-110 max-w-[calc(100%-3rem)] overflow-y-auto bg-white p-5 shadow-2xl dark:bg-[#0e141b]">
                <button
                    type="button"
                    aria-label="Close cart"
                    onClick={() => setCartOpen(false)}
                    className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full bg-black/4 text-slate-500 transition-colors hover:bg-[#00a37a]/10 hover:text-[#00a37a] dark:bg-white/6 dark:text-slate-300"
                >
                    <X size={16} />
                </button>

                {ordered ? (
                    <div className="flex flex-col items-center p-6 text-center">
                        <div className="mb-4 grid h-18 w-18 place-items-center rounded-full bg-[#00a37a]/10 text-[#00a37a] dark:text-[#6bffb8]">
                            <CheckCheck size={33} />
                        </div>
                        <h2
                            className="mb-2 text-[22px] font-semibold tracking-tight text-slate-900 dark:text-white"
                            style={serif}
                        >
                            Order confirmed!
                        </h2>
                        <p className="mb-5 text-[11px] leading-[1.7] text-slate-500 dark:text-slate-400">
                            {activeTable ? `Table T-${activeTable.table_number}. ` : ''}
                            Our team is getting your food ready.
                        </p>
                        <button
                            type="button"
                            onClick={() => {
                                setCartOpen(false);
                                showMenu();
                            }}
                            className="inline-flex cursor-pointer items-center gap-2.5 rounded-full border border-black/10 px-5 py-3 text-[11px] font-semibold text-slate-600 dark:border-white/10 dark:text-slate-300"
                        >
                            Continue browsing
                            <ArrowRight size={14} />
                        </button>
                    </div>
                ) : cartLines.length === 0 ? (
                    <div className="flex flex-col items-center p-6 text-center">
                        <span className="mb-3 grid h-18 w-18 place-items-center rounded-full bg-black/4 text-[#00a37a] dark:bg-white/6 dark:text-[#6bffb8]">
                            <ShoppingCart size={30} />
                        </span>
                        <h2
                            className="mb-2 text-[22px] font-semibold tracking-tight text-slate-900 dark:text-white"
                            style={serif}
                        >
                            Your cart is empty
                        </h2>
                        <p className="mb-5 text-[11px] leading-[1.7] text-slate-500 dark:text-slate-400">
                            Something delicious is waiting. Let&rsquo;s find it.
                        </p>
                        <button
                            type="button"
                            onClick={() => {
                                setCartOpen(false);
                                showMenu();
                            }}
                            className="inline-flex cursor-pointer items-center gap-2.5 rounded-full bg-gradient-to-br from-[#6bffb8] to-[#00d4aa] px-5 py-3 text-[11px] font-semibold text-[#073b2b]"
                        >
                            Browse the menu
                            <ArrowRight size={14} />
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="flex items-center gap-3">
                            <span className="grid h-9 w-9 place-items-center rounded-[11px] bg-[#00a37a]/10 text-[#00a37a] dark:text-[#6bffb8]">
                                <ShoppingCart size={19} strokeWidth={1.6} />
                            </span>
                            <div>
                                <h2 className="text-[17px] font-semibold tracking-tight text-slate-900 dark:text-white">
                                    Your cart
                                </h2>
                                <p className="mt-0.5 text-[10px] text-slate-400">
                                    {totalQuantity} item{totalQuantity !== 1 ? 's' : ''}
                                    {activeTable ? ` · Table T-${activeTable.table_number}` : ''}
                                </p>
                            </div>
                        </div>

                        <div className="my-4 flex flex-col gap-2">
                            {cartLines.map((line) => {
                                const img = itemImage(line);
                                return (
                                    <div
                                        key={line.id}
                                        className="flex items-center gap-2.5 rounded-xl border border-black/[0.07] bg-white p-2 dark:border-white/[0.07] dark:bg-white/2"
                                    >
                                        <span className="h-13 w-13 shrink-0 overflow-hidden rounded-lg bg-[#00a37a]/[.07]">
                                            {img ? (
                                                <img
                                                    src={img}
                                                    alt={line.title}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <span className="flex h-full w-full items-center justify-center text-[26px]">
                                                    check
                                                </span>
                                            )}
                                        </span>
                                        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                                            <h3 className="truncate text-[12px] font-semibold text-slate-900 dark:text-white">
                                                {line.title}
                                            </h3>
                                            <span className="text-[10px] text-[#00a37a] dark:text-[#6bffb8]">
                                                {Money(line.price)}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1.5 rounded-full border border-[#00a37a]/25 bg-[#00a37a]/10 px-1 py-1 text-[#00a37a] dark:text-[#6bffb8]">
                                            <button
                                                type="button"
                                                aria-label={`Remove one ${line.title}`}
                                                onClick={() => removeFromCart(line.id)}
                                                className="rounded-full p-1.5 transition-colors hover:bg-[#00a37a]/20"
                                            >
                                                <Minus size={13} />
                                            </button>
                                            <span className="min-w-2.75 text-center text-[10px] font-semibold">
                                                {line.qty}
                                            </span>
                                            <button
                                                type="button"
                                                aria-label={`Add one ${line.title}`}
                                                onClick={() => addToCart(line)}
                                                className="rounded-full p-1.5 transition-colors hover:bg-[#00a37a]/20"
                                            >
                                                <Plus size={13} />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <label className="mb-3 block">
                            <span className="mb-1.5 block text-[9px] text-slate-400">
                                Add a note for the kitchen (optional)
                            </span>
                            <Textarea
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                placeholder="E.g. no spicy, extra cheese…"
                                className="w-full rounded-xl border border-black/10 bg-black/2 p-3 text-[11px] text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#00a37a] focus:shadow-[0_0_0_2px_#00a37a22] dark:border-white/10 dark:bg-white/3 dark:text-white"
                            />
                        </label>

                        <div className="flex flex-col gap-1.5 rounded-xl border border-[#00a37a]/20 bg-[#00a37a]/6 p-4 text-[10px]">
                            <div className="flex justify-between text-slate-500 dark:text-slate-400">
                                <span>Subtotal</span>
                                <span>{Money(totalPrice)}</span>
                            </div>
                            <div className="flex justify-between text-slate-500 dark:text-slate-400">
                                <span>Service</span>
                                <span className="text-[#00a37a] dark:text-[#6bffb8]">
                                    On the house
                                </span>
                            </div>
                            <div className="mt-1 flex justify-between border-t border-[#00a37a]/20 pt-2.5 text-[13px] font-semibold">
                                <span className="text-slate-900 dark:text-white">Total</span>
                                <span className="text-[#00a37a] dark:text-[#6bffb8]">
                                    {Money(totalPrice)}
                                </span>
                            </div>
                        </div>

                        {auth?.user ? (
                            <button
                                type="button"
                                onClick={() => placeOrder(note)}
                                disabled={orderProcessing}
                                className="mt-4 flex w-full cursor-pointer items-center justify-center gap-2.5 rounded-full bg-gradient-to-br from-[#6bffb8] to-[#00d4aa] py-3.5 text-[12px] font-semibold text-[#073b2b] shadow-sm transition-all hover:-translate-y-0.5 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                            >
                                {orderProcessing ? (
                                    <>
                                        <Loader2Icon size={16} className="animate-spin" />
                                        <span>Placing order…</span>
                                    </>
                                ) : (
                                    <>
                                        <CheckCheck size={16} />
                                        <span>Place order · {Money(totalPrice)}</span>
                                    </>
                                )}
                            </button>
                        ) : (
                            <Link
                                href={loginPage().url}
                                className="mt-4 flex w-full items-center justify-center gap-2.5 rounded-full bg-slate-900 py-3.5 text-[12px] font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-slate-800 active:scale-95 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
                            >
                                <LogIn size={16} />
                                <span>Login to place order · {Money(totalPrice)}</span>
                            </Link>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}