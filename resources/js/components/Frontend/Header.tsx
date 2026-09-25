import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "../ui/button";
import Dialog from "./Dialog";
import { Link, usePage, router } from "@inertiajs/react";
import { loginPage, userLogout, orderIndex } from "@/routes";
import {
    Menu,
    X,
    ShoppingCart,
    Receipt,
    Sun,
    Moon,
    LogOut,
    LogIn,
    MapPin,
    User as UserIcon,
    ArrowRightLeft,
    LoaderCircle,
} from "lucide-react";
import { OfficeSetting } from "@/types/frontend/officeSetting";
import { availableTables, switchTable } from "@/routes/orders";

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
    [key: string]: unknown;
    totalQuantity?: number;
}

interface AvailableTable {
    id: number;
    table_number: string;
}

const Header = ({
    isDark,
    toggleTheme,
    totalItems,
    setCartOpen,
}: HeaderProps) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { auth, totalQuantity, activeTable, activeOrder, officeSetting } = usePage<PageProps>().props;
    const user = auth?.user;
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
                setIsMobileMenuOpen(false);
            }
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const cartCount = totalQuantity ?? totalItems ?? 0;

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
                    setSwitchError(typeof message === "string" ? message : "That table is no longer available.");
                    setConfirmingSwitch(null);
                    void loadAvailableTables();
                },
                onFinish: () => setSwitchingTable(false),
            }
        );
    };

    return (
        <header className="sticky top-0 z-40 bg-[#f7f8f7]/95 dark:bg-[#080c10]/95 backdrop-blur-md border-b border-black/[0.06] dark:border-white/[0.06] transition-colors duration-200">
            <div className="max-w-7xl mx-auto px-3.5 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-2">
                
                {/* Brand & Table Badge Container */}
                <div className="flex items-center gap-2 min-w-0">
                    <Link href="/" className="flex items-center gap-2 group shrink-0">
                        <img
                            src={officeSetting?.office_logo}
                            alt={officeSetting?.office_name ?? "Office Logo"}
                            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl object-cover bg-gradient-to-br from-[#6bffb8] to-[#00d4aa] shadow-xs group-hover:scale-105 transition-transform"
                        />
                        <div className="min-w-0">
                            <p
                                className="text-base sm:text-xl font-bold text-slate-900 dark:text-white leading-tight truncate max-w-[120px] xs:max-w-[180px] sm:max-w-none"
                                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                            >
                                {officeSetting?.office_name}
                            </p>
                            <p className="text-[9px] uppercase tracking-[0.12em] text-[#00a37a] dark:text-[#6bffb8] font-medium hidden sm:block">
                                Scan · Choose · Order
                            </p>
                        </div>
                    </Link>

                    {/* Active Table Pill */}
                    {activeTable && (
                        <div className="flex items-center gap-1 shrink-0 ml-1">
                            <div className="inline-flex items-center gap-1 bg-[#6bffb8]/15 border border-[#6bffb8]/30 text-[#00a37a] dark:text-[#6bffb8] px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[11px] sm:text-xs font-bold">
                                <MapPin className="w-3 h-3 shrink-0 text-[#00a37a] dark:text-[#6bffb8]" />
                                <span>T-{activeTable.table_number}</span>
                            </div>

                            {activeOrder && (
                                <button
                                    type="button"
                                    onClick={openSwitchTable}
                                    title="Switch Table"
                                    aria-label="Switch Table"
                                    className="inline-flex items-center justify-center p-1.5 sm:px-2.5 sm:py-1 rounded-full border border-slate-200 bg-white text-slate-600 shadow-xs transition-colors hover:border-emerald-300 hover:text-emerald-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-emerald-700 dark:hover:text-emerald-400 active:scale-95"
                                >
                                    <ArrowRightLeft className="h-3 w-3" />
                                    <span className="hidden sm:inline text-[10px] font-bold ml-1">Switch</span>
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Desktop Controls (md+) */}
                <div className="hidden md:flex items-center gap-3">
                    <Link
                        href={orderIndex().url}
                        className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-black/[0.04] hover:bg-black/[0.08] dark:text-slate-200 dark:hover:text-white dark:bg-white/[0.06] dark:hover:bg-white/[0.12] transition-colors"
                    >
                        <Receipt className="w-3.5 h-3.5 text-emerald-500" />
                        <span>My Orders</span>
                    </Link>

                    <Button
                        onClick={toggleTheme}
                        aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
                        className="w-9 h-9 rounded-full bg-black/[0.06] dark:bg-white/[0.07] flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                    >
                        {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700 dark:text-slate-300" />}
                    </Button>

                    {user ? (
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                                👋 {user.name}
                            </span>
                            <Button
                                variant="ghost"
                                onClick={() => router.post(userLogout().url)}
                                className="rounded-full py-1 px-3 text-xs font-medium text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
                            >
                                Logout
                            </Button>
                        </div>
                    ) : (
                        <Link
                            href={loginPage().url}
                            className="rounded-full py-1.5 px-4 text-xs font-semibold border border-[#00a37a]/30 bg-[#6bffb8]/10 text-[#00a37a] hover:bg-[#6bffb8]/20 dark:text-[#6bffb8] transition-colors"
                        >
                            Login
                        </Link>
                    )}

                    <Button
                        onClick={() => setCartOpen(true)}
                        variant="outline"
                        className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all flex items-center gap-1.5 ${
                            cartCount > 0
                                ? "bg-gradient-to-r from-[#6bffb8] to-[#00d4aa] text-black border-transparent shadow-xs hover:opacity-90"
                                : "bg-black/[0.05] dark:bg-white/[0.07] border-slate-200 dark:border-slate-800"
                        }`}
                    >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        <span>Cart ({cartCount})</span>
                    </Button>
                </div>

                {/* Mobile Right Controls (< md) */}
                <div className="flex md:hidden items-center gap-1.5 shrink-0">
                    <Button
                        onClick={() => setCartOpen(true)}
                        variant="outline"
                        size="sm"
                        aria-label={`Open Cart (${cartCount} items)`}
                        className={`rounded-full px-3 py-1.5 min-h-[38px] text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-transform ${
                            cartCount > 0
                                ? "bg-gradient-to-r from-[#6bffb8] to-[#00d4aa] text-black border-transparent shadow-xs"
                                : "bg-black/[0.05] dark:bg-white/[0.07] border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200"
                        }`}
                    >
                        <ShoppingCart className="w-4 h-4" />
                        <span className="font-extrabold">{cartCount}</span>
                    </Button>

                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        aria-label="Toggle mobile menu"
                        className="p-2 min-h-[38px] min-w-[38px] flex items-center justify-center rounded-xl bg-black/[0.05] dark:bg-white/[0.07] text-slate-800 dark:text-slate-200 active:bg-black/10 dark:active:bg-white/15 transition-colors"
                    >
                        {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* Mobile Expandable Drawer Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden border-t border-black/[0.06] dark:border-white/[0.06] bg-[#f7f8f7]/98 dark:bg-[#080c10]/98 backdrop-blur-xl px-4 py-4 space-y-3.5 animate-in slide-in-from-top-2 duration-200 shadow-xl max-h-[85vh] overflow-y-auto">
                    
                    {/* User Profile / Auth State Banner */}
                    {user ? (
                        <div className="p-3.5 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.05] dark:border-white/[0.05] flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2.5 min-w-0">
                                <div className="w-9 h-9 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-sm shrink-0">
                                    <UserIcon className="w-4 h-4" />
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
                                    setIsMobileMenuOpen(false);
                                    router.post(userLogout().url);
                                }}
                                className="text-xs font-semibold text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl px-2.5 shrink-0"
                            >
                                <LogOut className="w-3.5 h-3.5 mr-1" /> Logout
                            </Button>
                        </div>
                    ) : (
                        <div className="p-3.5 rounded-2xl bg-[#6bffb8]/10 border border-[#6bffb8]/20 flex items-center justify-between gap-2">
                            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                                Log in to track & save your orders
                            </span>
                            <Link
                                href={loginPage().url}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#6bffb8] to-[#00d4aa] text-black font-bold text-xs shadow-xs shrink-0 active:scale-95 transition-transform"
                            >
                                <LogIn className="w-3.5 h-3.5" /> Login
                            </Link>
                        </div>
                    )}

                    {/* Quick Navigation Links */}
                    <div className="grid grid-cols-2 gap-2.5">
                        <Link
                            href={orderIndex().url}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="flex items-center gap-2.5 p-3 rounded-2xl bg-black/[0.04] dark:bg-white/[0.05] active:bg-black/[0.08] dark:active:bg-white/[0.1] text-xs font-bold text-slate-800 dark:text-slate-200 transition-colors"
                        >
                            <Receipt className="w-4 h-4 text-emerald-500 shrink-0" />
                            <span>My Orders</span>
                        </Link>

                        <button
                            type="button"
                            onClick={() => {
                                setIsMobileMenuOpen(false);
                                setCartOpen(true);
                            }}
                            className="flex items-center gap-2.5 p-3 rounded-2xl bg-black/[0.04] dark:bg-white/[0.05] active:bg-black/[0.08] dark:active:bg-white/[0.1] text-xs font-bold text-slate-800 dark:text-slate-200 transition-colors text-left"
                        >
                            <ShoppingCart className="w-4 h-4 text-amber-500 shrink-0" />
                            <span>View Cart ({cartCount})</span>
                        </button>
                    </div>

                    {/* Appearance Switcher */}
                    <div className="pt-2 border-t border-black/[0.05] dark:border-white/[0.05] flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                            Appearance
                        </span>
                        <Button
                            onClick={toggleTheme}
                            size="sm"
                            variant="outline"
                            className="rounded-full px-3 py-1 text-xs font-bold flex items-center gap-1.5 bg-black/[0.04] dark:bg-white/[0.06] border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200"
                        >
                            {isDark ? (
                                <>
                                    <Sun className="w-3.5 h-3.5 text-amber-400" /> Light Mode
                                </>
                            ) : (
                                <>
                                    <Moon className="w-3.5 h-3.5 text-slate-700 dark:text-slate-300" /> Dark Mode
                                </>
                            )}
                        </Button>
                    </div>
                </div>
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
                                    Move your order from <strong className="text-slate-900 dark:text-white">Table {activeTable?.table_number}</strong> to <strong className="text-slate-900 dark:text-white">Table {confirmingSwitch.table_number}</strong>? Your order details and items will remain unchanged.
                                </p>
                                <div className="flex gap-2 pt-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="flex-1 min-h-[42px] text-xs font-bold rounded-xl"
                                        onClick={() => setConfirmingSwitch(null)}
                                        disabled={switchingTable}
                                    >
                                        Back
                                    </Button>
                                    <Button
                                        type="button"
                                        className="flex-1 min-h-[42px] text-xs font-bold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 active:scale-[0.98]"
                                        onClick={confirmSwitchTable}
                                        disabled={switchingTable}
                                    >
                                        {switchingTable && <LoaderCircle className="h-4 w-4 animate-spin mr-1.5" />}
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