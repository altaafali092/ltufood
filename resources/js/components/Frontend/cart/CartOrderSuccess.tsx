export function CartOrderSuccess() {
    return (
        <div className="flex-1 flex flex-col items-center justify-center px-8 py-12 text-center">
            <div className="text-[64px] mb-4 animate-bounce">✅</div>
            <p
                className="font-['Playfair_Display',Georgia,serif] text-[26px] font-bold text-slate-900 dark:text-white mb-2"
            >
                Order Placed!
            </p>
            <p className="text-[13px] text-slate-500">
                Your food is being prepared. Sit back & relax 🎉
            </p>
        </div>
    );
}
