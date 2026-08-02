import { Button } from "../ui/button";

interface FloatingCartBarProps {
  totalItems: number;
  subtotal: number;
  money: (price: number) => string;
  onOpenCart: () => void;
}

export default function FloatingCartBar({
  totalItems,
  subtotal,
  money,
  onOpenCart,
}: FloatingCartBarProps) {
  return (
    <div className="fixed inset-x-0 bottom-6 z-40 flex justify-center px-4">
      <Button
        onClick={onOpenCart}
        className="w-full max-w-md rounded-2xl bg-gradient-to-r from-[#6bffb8]/30 to-[#00d4aa]/40 px-6 py-7 shadow-xl backdrop-blur hover:opacity-95"
      >
        <span className="flex w-full items-center gap-1.5">
          <span className="w-7 h-7 rounded-full bg-black/20 flex items-center justify-center text-xs font-black shrink-0">
            {totalItems}
          </span>

          <span className="flex-1 text-left">View your order</span>
          <span className="font-black">{money(subtotal)}</span>
        </span>
      </Button>
    </div>
  );
}