import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Money } from '@/Utils/Money';

interface FloatingCartBarProps {
    totalQuantity: number;
    totalPrice: number;
    cartOpen: boolean;
    setCartOpen: (open: boolean) => void;
}

export default function FloatingCartBar({
    totalQuantity,
    totalPrice,
    cartOpen,
    setCartOpen,
}: FloatingCartBarProps) {
    if (totalQuantity <= 0 || cartOpen) return null;

    return (
        <button
            onClick={() => setCartOpen(true)}
            className="welcome-fade-in fixed bottom-6 left-1/2 z-40 flex -translate-x-1/2 items-center gap-3.5 whitespace-nowrap rounded-full bg-gradient-to-br from-[#6bffb8] to-[#00d4aa] px-4 py-3 text-[12px] font-medium text-[#083a2b] shadow-[0_10px_35px_#00493235] transition-shadow hover:shadow-[0_10px_35px_#00493255] max-md:w-[calc(100%-2rem)] max-md:max-w-100 cursor-pointer"
        >
            <span className="grid h-7 w-7 place-items-center rounded-full bg-white/40 text-[11px] font-semibold">
                {totalQuantity}
            </span>
            <span>View your cart</span>
            <strong className="border-l border-[#005d3525] pl-3.5 font-semibold max-md:ml-auto">
                {Money(totalPrice)}
            </strong>
            <ArrowRight size={17} />
        </button>
    );
}