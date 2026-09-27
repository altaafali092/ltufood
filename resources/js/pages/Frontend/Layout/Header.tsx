import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, usePage, router } from "@inertiajs/react";
import Dialog from "../../../components/Frontend/Dialog";
import { Button } from "../../../components/ui/button";
import { loginPage, userLogout, orderIndex, home } from "@/routes";
import { availableTables, switchTable } from "@/routes/orders";
import { OfficeSetting } from "@/types/frontend/officeSetting";
import {
    Menu as MenuIcon,
    X,
    ShoppingCart,
    Receipt,
    Sun,
    Moon,
    MapPin,
    ArrowRightLeft,
    LoaderCircle,
    ChevronRight,
    User as UserIcon,
    LogIn,
    LogOut,
} from "lucide-react";

interface HeaderProps {
    isDark: boolean;
    toggleTheme: () => void;
    totalItems: number;
    setCartOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

interface User {
    id: number;
    name: string;
    email: string;
}

interface PageProps {
    auth?: {
        user?: User | null;
    };
    activeTable?: {
        id: number;
        table_number: string;
    } | null;
    activeOrder?: {
        id: number;
        table_id: number | null;
        table_number: string | null;
    } | null;
    officeSetting: OfficeSetting;
    totalQuantity?: number;
    [key: string]: unknown;
}

interface AvailableTable {
    id: number;
    table_number: string;
}

const serif = { fontFamily: "'Playfair Display', Georgia, serif" };

const Header = ({
    isDark,
    toggleTheme,
    totalItems,
    setCartOpen,
}: HeaderProps) => {
    const [mobileNav, setMobileNav] = useState(false);
    const { auth, totalQuantity, activeTable, activeOrder, officeSetting } =
        usePage<PageProps>().props;
    const user = auth?.user;

    // Table Switcher States
    const [switchOpen, setSwitchOpen] = useState(false);
    const [confirmingSwitch, setConfirmingSwitch] = useState<AvailableTable | null>(null);
    const [availableTableList, setAvailableTableList] = useState<AvailableTable[]>([]);
    const [loadingTables, setLoadingTables] = useState(false);
    const [switchingTable, setSwitchingTable] = useState(false);
    const [switchError, setSwitchError] = useState<string | null>(null);

    // Close mobile menu when screen resizes to desktop width
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) {
                setMobileNav(false);
            }
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const cartCount = totalQuantity ?? totalItems ?? 0;
    const brandName = officeSetting?.office_name ?? "Menu App";

    // Table Switcher Functions
    const loadAvailableTables = async () => {
        setLoadingTables(true);
        setSwitchError(null);

        try {
            const response = await axios.get(availableTables().url);
            setAvailableTableList(response.data.tables);
        } catch {
            setSwitchError("Unable to load available tables. Please try again.");
        } finally {
            setLoadingTables(false);
        }
    };

    const openSwitchTable = () => {
        setSwitchOpen(true);
        setConfirmingSwitch(null);
        void loadAvailableTables();
    };

    const closeSwitchTable = () => {
        if (switchingTable) return;
        setSwitchOpen(false);
        setConfirmingSwitch(null);
        setSwitchError(null);
    };

    const confirmSwitchTable = () => {
        if (!activeOrder || !confirmingSwitch) return;

        setSwitchingTable(true);
        setSwitchError(null);
        router.post(
            switchTable(activeOrder.id).url,
            { table_id: confirmingSwitch.id },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setSwitchOpen(false);
                    setConfirmingSwitch(null);
                },
                onError: (errors) => {
                    const message = Object.values(errors)[0];
                    setSwitchError(
                        typeof message === "string"
                            ? message
                            : "That table is no longer available."
                    );
                    setConfirmingSwitch(null);
                    void loadAvailableTables();
                },
                onFinish: () => setSwitchingTable(false),
            }
        );
    };

    return (
        <header className="sticky top-0 z-40 h-19 border-b border-black/[0.07] bg-[#f7f8f7]/95 backdrop-blur dark:border-white/[0.07] dark:bg-[#080c10]/95">
            <div className="mx-auto flex h-full w-full max-w-300 items-center justify-between gap-4 px-6 max-md:px-4">
                
                {/* Brand & Table Badge */}
                <div className="flex items-center gap-3">
                    <Link
                        href={home().url}
                        className="flex items-center gap-2.5"
                        aria-label={`${brandName} home`}
                    >
                        <span className="grid h-10 w-10 place-items-center overflow-hidden rounded-xl bg-linear-to-br from-[#6bffb8] to-[#00d4aa] text-[22px] shadow-sm">
                            {officeSetting?.office_logo ? (
                                <img
                                    src={officeSetting?.office_logo}
                                    alt={officeSetting?.office_logo}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                "🍽️"
                            )}
                        </span>
                        <span className="flex flex-col gap-0.5">
                            <strong
                                className="text-[20px] font-bold leading-none tracking-tight text-slate-900 dark:text-white"
                                style={serif}
                            >
                                {brandName}
                            </strong>
                            <span className="text-[7px] font-medium tracking-[1.5px] text-[#00a37a] dark:text-[#6bffb8]">
                                SCAN · CHOOSE · ORDER
                            </span>
                        </span>
                    </Link>

                    {/* Active Table Pill & Switch Action */}
                    {activeTable && (
                        <div className="flex items-center gap-1.5">
                            <span className="inline-flex items-center gap-1 rounded-full border border-[#00a37a]/25 bg-[#00a37a]/10 px-2.5 py-1 text-[10px] font-semibold text-[#00a37a] dark:text-[#6bffb8]">
                                <MapPin size={12} />
                                T-{activeTable.table_number}
                            </span>

                            {activeOrder && (
                                <button
                                    type="button"
                                    onClick={openSwitchTable}
                                    title="Switch Table"
                                    aria-label="Switch Table"
                                    className="inline-flex items-center justify-center p-1.5 sm:px-2.5 sm:py-1 rounded-full border border-slate-200 bg-white text-slate-600 shadow-xs transition-colors hover:border-emerald-300 hover:text-emerald-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-emerald-700 dark:hover:text-emerald-400 active:scale-95"
                                >
                                    <ArrowRightLeft className="h-3 w-3" />
                                    <span className="hidden sm:inline text-[10px] font-bold ml-1">
                                        Switch
                                    </span>
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Desktop Main Navigation */}
                <nav
                    className="flex h-full items-center gap-7 text-[12px] text-slate-500 dark:text-slate-400 max-md:hidden"
                    aria-label="Main navigation"
                >
                    <Link
                        href={home().url}
                        className="relative flex h-full items-center font-medium text-[#00a37a] dark:text-[#6bffb8] after:absolute after:bottom-4.5 after:left-1/2 after:h-1 after:w-1 after:-translate-x-1/2 after:rounded-full  dark:after:bg-[#6bffb8]"
                    >
                        Home
                    </Link>
                    <a
                        href="#how-it-works"
                        className="flex h-full items-center transition-colors hover:text-[#00a37a] dark:hover:text-[#6bffb8]"
                    >
                        How it works
                    </a>
                    <a
                        href="#menu"
                        className="flex h-full items-center transition-colors hover:text-[#00a37a] dark:hover:text-[#6bffb8]"
                    >
                        Our menu
                    </a>
                </nav>

                {/* Action Controls */}
                <div className="flex items-center gap-2.5">
                    {/* User Auth Info (Desktop) */}
                    {user ? (
                        <div className="hidden lg:flex items-center gap-0.5 mr-1">
                            <span  className="flex text-[12px] font-mono font-bold items-center gap-1.5 rounded-l-full bg-black/4 px-3.5 py-2.5  text-slate-600 transition-colors hover:bg-[#00a37a]/10 hover:text-[#00a37a] dark:bg-white/6 dark:text-slate-300 dark:hover:text-[#6bffb8] max-md:hidden">
                                😎 {user.name}
                            </span>
                            <button
                                type="button"
                                onClick={() => router.post(userLogout().url)}
                                className="flex text-[12px] items-center gap-1.5 rounded-r-full bg-black/4 px-3.5 py-2.5 font-mono font-bold text-slate-600 transition-colors hover:bg-red-200 hover:text-[#00a37a] dark:bg-white/6 dark:text-slate-300 dark:hover:text-[#6bffb8] max-md:hidden"
                            >
                                Logout
                            </button>
                        </div>
                    ) : (
                        <Link
                            href={loginPage().url}
                            className="hidden lg:inline-flex rounded-full py-1.5 px-3.5 text-[11px] font-semibold border border-[#00a37a]/30 bg-[#6bffb8]/10 text-[#00a37a] hover:bg-[#6bffb8]/20 dark:text-[#6bffb8] transition-colors"
                        >
                            Login
                        </Link>
                    )}

                    {/* My Orders (Inertia Route) */}
                    <Link
                        href={orderIndex().url}
                        className="flex items-center gap-1.5 rounded-full bg-black/4 px-3.5 py-2.5 text-[11px] font-medium text-slate-600 transition-colors hover:bg-[#00a37a]/10 hover:text-[#00a37a] dark:bg-white/6 dark:text-slate-300 dark:hover:text-[#6bffb8] max-md:hidden"
                    >
                        <Receipt size={15} className="text-[#00a37a] dark:text-[#6bffb8]" />
                        My Orders
                    </Link>

                    {/* Theme Toggle */}
                    <button
                        type="button"
                        onClick={toggleTheme}
                        aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
                        className="grid h-9 w-9 place-items-center rounded-full bg-black/4 text-slate-500 transition-colors hover:bg-[#00a37a]/10 hover:text-[#00a37a] dark:bg-white/6 dark:text-slate-300 dark:hover:text-[#6bffb8]"
                    >
                        {isDark ? <Sun size={17} /> : <Moon size={17} />}
                    </button>

                    {/* Cart Trigger Button */}
                    <button
                        type="button"
                        onClick={() => setCartOpen(true)}
                        aria-label={`Open cart, ${cartCount} items`}
                        className="flex items-center gap-2 rounded-full bg-linear-to-br from-[#6bffb8] to-[#00d4aa] px-4 py-2.5 text-[11px] font-semibold text-[#083b29] shadow-sm transition-transform hover:-translate-y-0.5 active:scale-95"
                    >
                        <ShoppingCart size={16} />
                        <span className="max-sm:hidden">Cart</span>
                        <span className="grid h-4.5 min-w-4.5 place-items-center rounded-full bg-white/40 px-1 text-[9px]">
                            {cartCount}
                        </span>
                    </button>

                    {/* Mobile Hamburger Toggle */}
                    <button
                        type="button"
                        aria-label="Toggle navigation"
                        aria-expanded={mobileNav}
                        onClick={() => setMobileNav((v) => !v)}
                        className="hidden h-9 w-9 place-items-center rounded-full bg-black/4 text-slate-600 dark:bg-white/6 dark:text-slate-300 max-md:grid"
                    >
                        {mobileNav ? <X size={20} /> : <MenuIcon size={20} />}
                    </button>
                </div>
            </div>

            {/* Mobile Drawer Menu */}
            {mobileNav && (
                <nav
                    className="absolute inset-x-0 top-19 border-b border-black/[0.07] bg-[#f7f8f7] px-6 pb-5 pt-3 shadow-lg dark:border-white/[0.07] dark:bg-[#080c10] md:hidden space-y-3"
                    aria-label="Mobile navigation"
                >
                    {/* User Auth Banner in Mobile Drawer */}
                    {user ? (
                        <div className="p-3 rounded-xl bg-black/3 dark:bg-white/4 border border-black/5 dark:border-white/5 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                                <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">
                                    <UserIcon size={14} />
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                        {user.name}
                                    </span>
                                    <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                                        {user.email}
                                    </span>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    setMobileNav(false);
                                    router.post(userLogout().url);
                                }}
                                className="text-xs font-semibold text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl px-2.5 shrink-0"
                            >
                                <LogOut size={14} className="mr-1" /> Logout
                            </Button>
                        </div>
                    ) : (
                        <div className="p-3 rounded-xl bg-[#6bffb8]/10 border border-[#6bffb8]/20 flex items-center justify-between gap-2">
                            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                                Log in to track & save your orders
                            </span>
                            <Link
                                href={loginPage().url}
                                onClick={() => setMobileNav(false)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-linear-to-r from-[#6bffb8] to-[#00d4aa] text-black font-bold text-xs shadow-xs shrink-0 active:scale-95 transition-transform"
                            >
                                <LogIn size={14} /> Login
                            </Link>
                        </div>
                    )}

                    {/* Links */}
                    <div className="divide-y divide-black/5 dark:divide-white/5">
                        {[
                            ["Home", "/"],
                            ["How it works", "#how-it-works"],
                            ["Our menu", "#menu"],
                        ].map(([label, href]) => (
                            <a
                                key={label}
                                href={href}
                                onClick={() => setMobileNav(false)}
                                className="flex items-center justify-between py-3 text-[13px] font-medium text-slate-600 dark:text-slate-300"
                            >
                                {label}
                                <ChevronRight size={15} />
                            </a>
                        ))}
                    </div>

                    {/* Orders Trigger (Mobile) */}
                    <Link
                        href={orderIndex().url}
                        onClick={() => setMobileNav(false)}
                        className="flex w-full items-center gap-2.5 rounded-xl border border-[#00a37a]/25 bg-[#00a37a]/10 p-3 text-[12px] font-medium text-[#00a37a] dark:text-[#6bffb8]"
                    >
                        <Receipt size={16} />
                        My Orders
                    </Link>
                </nav>
            )}

            {/* Switch Table Dialog */}
            {switchOpen && (
                <Dialog
                    title={confirmingSwitch ? "Confirm Table Switch" : "Switch Table"}
                    eyebrow="Active order"
                    onClose={closeSwitchTable}
                >
                    <div className="space-y-4 p-4 sm:p-5 max-w-full">
                        {switchError && (
                            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs sm:text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
                                {switchError}
                            </div>
                        )}

                        {confirmingSwitch ? (
                            <>
                                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                                    Move your order from{" "}
                                    <strong className="text-slate-900 dark:text-white">
                                        Table {activeTable?.table_number}
                                    </strong>{" "}
                                    to{" "}
                                    <strong className="text-slate-900 dark:text-white">
                                        Table {confirmingSwitch.table_number}
                                    </strong>
                                    ? Your order details and items will remain unchanged.
                                </p>
                                <div className="flex gap-2 pt-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="flex-1 min-h-10.5 text-xs font-bold rounded-xl"
                                        onClick={() => setConfirmingSwitch(null)}
                                        disabled={switchingTable}
                                    >
                                        Back
                                    </Button>
                                    <Button
                                        type="button"
                                        className="flex-1 min-h-10.5 text-xs font-bold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 active:scale-[0.98]"
                                        onClick={confirmSwitchTable}
                                        disabled={switchingTable}
                                    >
                                        {switchingTable && (
                                            <LoaderCircle className="h-4 w-4 animate-spin mr-1.5" />
                                        )}
                                        {switchingTable ? "Switching..." : "Confirm Switch"}
                                    </Button>
                                </div>
                            </>
                        ) : (
                            <>
                                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                                    Select an available table to switch to:
                                </p>
                                {loadingTables ? (
                                    <div className="flex items-center justify-center gap-2 py-8 text-xs sm:text-sm text-slate-500">
                                        <LoaderCircle className="h-4 w-4 animate-spin" />
                                        Checking available tables...
                                    </div>
                                ) : availableTableList.length > 0 ? (
                                    <div className="grid grid-cols-2 gap-2.5 max-h-[50vh] overflow-y-auto p-0.5">
                                        {availableTableList.map((table) => (
                                            <button
                                                key={table.id}
                                                type="button"
                                                onClick={() => setConfirmingSwitch(table)}
                                                className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-left text-xs sm:text-sm font-semibold text-slate-700 active:bg-emerald-50 active:border-emerald-400 transition-colors hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-emerald-700 dark:hover:bg-emerald-950/40"
                                            >
                                                Table {table.table_number}
                                                <span className="mt-0.5 block text-[10px] font-normal text-emerald-600 dark:text-emerald-400">
                                                    Available
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="py-8 text-center text-xs sm:text-sm text-slate-500">
                                        No other tables are currently available.
                                    </p>
                                )}
                            </>
                        )}
                    </div>
                </Dialog>
            )}
        </header>
    );
};

export default Header;