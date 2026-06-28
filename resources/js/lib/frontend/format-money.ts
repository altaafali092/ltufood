export function formatMoney(price: number): string {
    return new Intl.NumberFormat('en-NP', {
        style: 'currency',
        currency: 'NPR',
        maximumFractionDigits: 0,
    }).format(Number(price || 0));
}
