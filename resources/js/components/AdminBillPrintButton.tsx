import { Printer } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { OrderUser } from '@/types/admin/Order';

const escapeHtml = (value: string): string =>
    value.replace(/[&<>"']/g, (character) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;',
    })[character] ?? character);

const money = (value: number | string): string =>
    `NPR ${Number(value).toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;

export default function AdminBillPrintButton({ order }: { order: OrderUser }) {
    const printBill = () => {
        const printWindow = window.open('', '_blank', 'width=480,height=720');

        if (!printWindow) {
            return;
        }

        const items = (order.items ?? []).map((item) => `
            <tr>
                <td>${escapeHtml(item.food_item?.title ?? `Food Item #${item.food_item_id}`)}</td>
                <td>${item.quantity}</td>
                <td>${money(item.price_at_time)}</td>
                <td>${money(item.total_price)}</td>
            </tr>
        `).join('');
        const paymentLabel = order.payment_status === 'paid' ? 'Paid' : 'Payment Pending';

        printWindow.document.write(`
            <!doctype html>
            <html>
                <head>
                    <title>Bill ${escapeHtml(order.order_number || `#${order.id}`)}</title>
                    <style>
                        * { box-sizing: border-box; }
                        body { margin: 0; padding: 24px; color: #172033; font: 14px Arial, sans-serif; }
                        .bill { max-width: 440px; margin: 0 auto; }
                        h1 { margin: 0; text-align: center; font-size: 22px; }
                        .muted { color: #667085; font-size: 12px; }
                        .center { text-align: center; }
                        .meta { display: flex; justify-content: space-between; gap: 16px; border-top: 1px dashed #cbd5e1; border-bottom: 1px dashed #cbd5e1; margin: 16px 0; padding: 10px 0; }
                        table { width: 100%; border-collapse: collapse; margin: 16px 0; }
                        th, td { padding: 8px 0; border-bottom: 1px solid #e2e8f0; text-align: left; }
                        th { color: #667085; font-size: 11px; text-transform: uppercase; }
                        th:not(:first-child), td:not(:first-child) { text-align: right; }
                        .total { display: flex; justify-content: space-between; padding-top: 10px; font-size: 17px; font-weight: 700; }
                        .payment { margin-top: 20px; color: #047857; text-align: center; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; }
                        @media print { body { padding: 0; } }
                    </style>
                </head>
                <body>
                    <main class="bill">
                        <h1>Food Order Bill</h1>
                        <p class="center muted">Order ${escapeHtml(order.order_number || `#${order.id}`)}</p>
                        <p class="center muted">${escapeHtml(new Date(order.created_at).toLocaleString())}</p>
                        <div class="meta">
                            <span>Customer: <strong>${escapeHtml(order.customer?.name ?? 'Walk-in Guest')}</strong></span>
                            <span>Table: <strong>${escapeHtml(order.table?.table_number ?? 'N/A')}</strong></span>
                        </div>
                        <table>
                            <thead><tr><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead>
                            <tbody>${items}</tbody>
                        </table>
                        <div class="total"><span>Subtotal</span><span>${money(order.subtotal)}</span></div>
                        ${Number(order.discount_amount) > 0 ? `<div class="total"><span>Discount</span><span>- ${money(order.discount_amount)}</span></div>` : ''}
                        <div class="total"><span>Grand Total</span><span>${money(order.total)}</span></div>
                        <p class="payment">${paymentLabel}</p>
                    </main>
                    <script>window.onload = () => { window.print(); window.onafterprint = () => window.close(); };</script>
                </body>
            </html>
        `);
        printWindow.document.close();
    };

    return (
        <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8 text-emerald-600 hover:text-emerald-700"
            onClick={printBill}
            aria-label={`Print bill for ${order.order_number || `order ${order.id}`}`}
            title="Print bill"
        >
            <Printer className="size-4" />
        </Button>
    );
}
