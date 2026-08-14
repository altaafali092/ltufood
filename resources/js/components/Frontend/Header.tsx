import React, { useState, useEffect } from "react";
import { Button } from "../ui/button";
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
    User as UserIcon 
} from "lucide-react";

interface HeaderProps {
    isDark: boolean;
    toggleTheme: () => void;
    totalItems: number;
    setCartOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

// Define the User interface matching your Laravel Auth payload
interface User {
    id: number;
    name: string;
    email: string;
}

// Define Inertia PageProps shape
interface PageProps {
    auth?: {
        user?: User | null;
    };
    activeTable?: {
        id: number;
        table_number: string;
    } | null;
    [key: string]: unknown;
    totalQuantity?: number;
}

const Header = ({
    isDark,
    toggleTheme,
    totalItems,
    setCartOpen,
}: HeaderProps) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { auth, totalQuantity, activeTable } = usePage<PageProps>().props;
    const user = auth?.user;

    // Close mobile menu on window resize to desktop
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

    return (
        <header className="sticky top-0 z-40 bg-[#f7f8f7]/95 dark:bg-[#080c10]/95 backdrop-blur-[18px] border-b border-black/[0.06] dark:border-white/[0.06] transition-colors duration-200">
            <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-2 sm:gap-4">
                
                {/* Brand Logo & Active Table */}
                <div className="flex items-center gap-2.5 sm:gap-3">
                    <Link href="/" className="flex items-center gap-2.5 group">
                        <div className="w-9 h-9 sm:w-[42px] sm:h-[42px] rounded-xl sm:rounded-[14px] bg-gradient-to-br from-[#6bffb8] to-[#00d4aa] flex items-center justify-center text-lg sm:text-xl shadow-xs group-hover:scale-105 transition-transform">
                            🍽️
                        </div>

                        <div>
                            <p
                                className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-tight"
                                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                            >
                                LTU Food
                            </p>

                            <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.15em] text-[#00a37a] dark:text-[#6bffb8] font-medium hidden sm:block">
                                Scan · Choose · Order
                            </p>
                        </div>
                    </Link>

                    {activeTable && (
                        <div className="ml-1 sm:ml-2 inline-flex items-center gap-1 bg-[#6bffb8]/15 border border-[#6bffb8]/30 text-[#00a37a] dark:text-[#6bffb8] px-2.5 py-1 rounded-full text-xs font-bold shrink-0">
                            <MapPin className="w-3 h-3 text-[#00a37a] dark:text-[#6bffb8]" />
                            <span>T-{activeTable.table_number}</span>
                        </div>
                    )}
                </div>

                {/* Desktop Navigation & Actions (md and up) */}
                <div className="hidden md:flex items-center gap-3.5">
                    {/* Orders Link */}
                    <Link
                        href={orderIndex().url}
                        className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-black/[0.04] hover:bg-black/[0.08] dark:text-slate-200 dark:hover:text-white dark:bg-white/[0.06] dark:hover:bg-white/[0.12] transition-colors"
                    >
                        <Receipt className="w-3.5 h-3.5 text-emerald-500" />
                        <span>My Orders</span>
                    </Link>

                    {/* Theme Toggle */}
                    <Button
                        onClick={toggleTheme}
                        aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
                        className="w-9 h-9 rounded-full bg-black/[0.06] dark:bg-white/[0.07] flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                    >
                        {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700 dark:text-slate-300" />}
                    </Button>

                    {/* Auth Area */}
                    {user ? (
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-slate-800 dark:text-slate-200 flex items-center gap-1">
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
                            className="rounded-full py-1.5 px-4 shadow-xs text-xs font-semibold border border-[#00a37a]/30 bg-[#6bffb8]/10 text-[#00a37a] hover:bg-[#6bffb8]/20 dark:text-[#6bffb8] transition-colors"
                        >
                            Login
                        </Link>
                    )}

                    {/* Cart Button */}
                    <Button
                        onClick={() => setCartOpen(true)}
                        variant="outline"
                        className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all flex items-center gap-1.5 ${
                            cartCount > 0
                                ? "bg-gradient-to-r from-[#6bffb8] to-[#00d4aa] text-black border-transparent shadow-md shadow-[#00d4aa]/20 hover:opacity-90"
                                : "bg-black/[0.05] dark:bg-white/[0.07] border-slate-200 dark:border-slate-800"
                        }`}
                    >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        <span>Cart ({cartCount})</span>
                    </Button>
                </div>

                {/* Mobile Right Controls (< md) */}
                <div className="flex md:hidden items-center gap-2">
                    {/* Quick Cart Button */}
                    <Button
                        onClick={() => setCartOpen(true)}
                        variant="outline"
                        size="sm"
                        className={`rounded-full px-3 py-1.5 text-xs font-bold flex items-center gap-1 ${
                            cartCount > 0
                                ? "bg-gradient-to-r from-[#6bffb8] to-[#00d4aa] text-black border-transparent shadow-xs"
                                : "bg-black/[0.05] dark:bg-white/[0.07] border-slate-200 dark:border-slate-800"
                        }`}
                    >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        <span>{cartCount}</span>
                    </Button>

                    {/* Hamburger Toggle */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        aria-label="Toggle mobile navigation menu"
                        className="p-2 rounded-xl bg-black/[0.05] dark:bg-white/[0.07] text-slate-800 dark:text-slate-200 hover:bg-black/10 dark:hover:bg-white/15 focus:outline-none transition-colors"
                    >
                        {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* Mobile Expandable Drawer Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden border-t border-black/[0.06] dark:border-white/[0.06] bg-[#f7f8f7]/98 dark:bg-[#080c10]/98 backdrop-blur-xl px-5 py-4 space-y-4 animate-in slide-in-from-top-2 duration-200">
                    
                    {/* User Profile Banner if logged in */}
                    {user ? (
                        <div className="p-3.5 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.05] dark:border-white/[0.05] flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <div className="w-9 h-9 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-sm">
                                    <UserIcon className="w-4 h-4" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                                        {user.name}
                                    </span>
                                    <span className="text-[10px] text-slate-500 dark:text-slate-400">
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
                                className="text-xs font-semibold text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl px-2.5"
                            >
                                <LogOut className="w-3.5 h-3.5 mr-1" /> Logout
                            </Button>
                        </div>
                    ) : (
                        <div className="p-3.5 rounded-2xl bg-[#6bffb8]/10 border border-[#6bffb8]/20 flex items-center justify-between">
                            <div className="text-xs font-medium text-slate-700 dark:text-slate-300">
                                Log in to track & save your orders
                            </div>
                            <Link
                                href={loginPage().url}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="inline-flex items-center gap-1 px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#6bffb8] to-[#00d4aa] text-black font-bold text-xs shadow-xs shrink-0 ml-2"
                            >
                                <LogIn className="w-3.5 h-3.5" /> Login
                            </Link>
                        </div>
                    )}

                    {/* Mobile Navigation Links Grid */}
                    <div className="grid grid-cols-2 gap-2.5 pt-1">
                        <Link
                            href={orderIndex().url}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="flex items-center gap-2 p-3 rounded-2xl bg-black/[0.04] dark:bg-white/[0.05] hover:bg-black/[0.08] dark:hover:bg-white/[0.1] text-xs font-bold text-slate-800 dark:text-slate-200 transition-colors"
                        >
                            <Receipt className="w-4 h-4 text-emerald-500" />
                            <span>My Orders</span>
                        </Link>

                        <button
                            onClick={() => {
                                setIsMobileMenuOpen(false);
                                setCartOpen(true);
                            }}
                            className="flex items-center gap-2 p-3 rounded-2xl bg-black/[0.04] dark:bg-white/[0.05] hover:bg-black/[0.08] dark:hover:bg-white/[0.1] text-xs font-bold text-slate-800 dark:text-slate-200 transition-colors text-left"
                        >
                            <ShoppingCart className="w-4 h-4 text-amber-500" />
                            <span>View Cart ({cartCount})</span>
                        </button>
                    </div>

                    {/* Bottom Utility Row: Theme Toggle */}
                    <div className="pt-2 border-t border-black/[0.05] dark:border-white/[0.05] flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                            Appearance Mode
                        </span>
                        <Button
                            onClick={toggleTheme}
                            size="sm"
                            variant="outline"
                            className="rounded-full px-3 py-1 text-xs font-bold flex items-center gap-1.5 bg-black/[0.04] dark:bg-white/[0.06] border-slate-200 dark:border-slate-800"
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
        </header>
    );
};

export default Header;