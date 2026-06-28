export function CartEmptyState() {
    return (
        <div className="flex-1 flex flex-col items-center justify-center py-16 text-center">
            <p className="text-5xl mb-3">🛒</p>
            <p className="text-[13px] text-slate-500">
                Your cart is empty.
                <br />
                Add something delicious!
            </p>
        </div>
    );
}
