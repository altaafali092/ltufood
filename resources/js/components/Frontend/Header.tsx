import React from "react";
import { Button } from "../ui/button";

interface HeaderProps {
    isDark: boolean;
    toggleTheme: () => void;
    totalItems: number;
    setCartOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const Header = ({
    isDark,
    toggleTheme,
    totalItems,
    setCartOpen,
}: HeaderProps) => {
    return (
        <header className="sticky top-0 z-40 bg-[#f7f8f7]/95 dark:bg-[#080c10]/95 backdrop-blur-[18px] border-b border-black/[0.06] dark:border-white/[0.06]">
            <div className="max-w-[1200px] mx-auto px-6 py-3.5 flex items-center justify-between gap-4">
                {/* Logo */}
                <div className="flex items-center gap-3">
                    <div className="w-[42px] h-[42px] rounded-[14px] bg-gradient-to-br from-[#6bffb8] to-[#00d4aa] flex items-center justify-center text-xl">
                        🍽️
                    </div>

                    <div>
                        <p
                            className="text-xl font-bold text-slate-900 dark:text-white"
                            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                        >
                            LTU Food
                        </p>

                        <p className="text-[10px] uppercase tracking-[0.15em] text-[#00a37a] dark:text-[#6bffb8]">
                            Scan · Choose · Order
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {/* Theme Toggle */}
                    <button
                        onClick={toggleTheme}
                        aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
                        className="w-[38px] h-[38px] rounded-full bg-black/[0.06] dark:bg-white/[0.07] flex items-center justify-center"
                    >
                        {isDark ? "☀️" : "🌙"}
                    </button>

                    <button>Log in</button>

                    <Button
                        variant="outline"
                        className="rounded-full border-[#6bffb8]/20 bg-[#6bffb8]/10 text-[#00a37a] hover:bg-[#6bffb8]/20 dark:text-[#6bffb8]"
                    >
                        Register
                    </Button>


                    <Button
                        onClick={() => setCartOpen(true)}
                        variant="outline"
                        className={`rounded-full px-4 py-2
                        ${totalItems > 0
                                ? "bg-gradient-to-r from-[#6bffb8] to-[#00d4aa] text-black"
                                : "bg-black/[0.05] dark:bg-white/[0.07]"
                            }`}
                    >
                        🛒{" "}
                        {totalItems > 0
                            ? `${totalItems} item${totalItems > 1 ? "s" : ""}`
                            : "Cart"}
                    </Button>
                </div>
            </div>
        </header>
    );
};

export default Header;