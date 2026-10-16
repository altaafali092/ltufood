import { ChefHat } from 'lucide-react';

import { Button } from '@/components/ui/button';
import type { OrderUser } from '@/types/admin/Order';

const escapeHtml = (value: string): string =>
    value.replace(
        /[&<>"']/g,
        (character) =>
            ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#039;',
            })[character] ?? character,
    );

export default function AdminOrderKitchenTicketButton({
    order,
    compact = false,
}: {
    order: OrderUser;
    compact?: boolean;
}) {
    const printTicket = () => {
        const printWindow = window.open('', '_blank', 'width=420,height=640');

        if (!printWindow) {
            return;
        }

        const items = (order.items ?? [])
            .map(
                (item) => `
            <tr>
                <td class="qty">${item.quantity}&times;</td>
                <td>
                    <span class="item">${escapeHtml(item.food_item?.title ?? `Food Item #${item.food_item_id}`)}</span>
                    ${item.special_notes ? `<span class="notes">${escapeHtml(item.special_notes)}</span>` : ''}
                </td>
            </tr>
        `,
            )
            .join('');
        const orderType = (order.order_type ?? 'dine_in').replace('_', ' ');

        printWindow.document.write(`
            <!doctype html>
            <html>
                <head>
                    <title>KOT ${escapeHtml(order.order_number || `#${order.id}`)}</title>
                    <style>
                        * { box-sizing: border-box; }
                        body { margin: 0; padding: 24px; color: #111827; font: 14px Arial, sans-serif; }
                        .ticket { max-width: 380px; margin: 0 auto; }
                        h1 { margin: 0; text-align: center; font-size: 20px; letter-spacing: .05em; text-transform: uppercase; }
                        .order { text-align: center; font-size: 17px; font-weight: 700; margin: 6px 0 2px; }
                        .muted { color: #6b7280; font-size: 12px; text-align: center; }
                        .meta { display: flex; justify-content: space-between; gap: 16px; border-top: 2px solid #111827; border-bottom: 2px dashed #9ca3af; margin: 16px 0; padding: 10px 0; font-weight: 700; }
                        table { width: 100%; border-collapse: collapse; }
                        td { padding: 10px 4px; border-bottom: 1px dashed #d1d5db; vertical-align: top; }
                        .qty { width: 56px; font-size: 20px; font-weight: 700; }
                        .item { display: block; font-size: 16px; font-weight: 600; }
                        .notes { display: block; margin-top: 2px; color: #b45309; font-size: 12px; font-weight: 600; }
                        .notes-box { margin-top: 16px; border: 1px dashed #b45309; border-radius: 8px; padding: 10px; color: #92400e; font-size: 13px; }
                        .foot { margin-top: 20px; text-align: center; color: #6b7280; font-size: 11px; }
                        @media print { body { padding: 0; } }
                    </style>
                </head>
                <body>
                    <main class="ticket">
                        <h1>Kitchen Order Ticket</h1>
                        <p class="order">${escapeHtml(order.order_number || `#${order.id}`)}</p>
                        <p class="muted">${escapeHtml(new Date(order.created_at).toLocaleString())}</p>
                        <div class="meta">
                            <span>Table: ${escapeHtml(order.table?.table_number ?? 'N/A')}</span>
                            <span>${escapeHtml(orderType)}</span>
                        </div>
                        <table><tbody>${items}</tbody></table>
                        ${order.notes ? `<div class="notes-box"><strong>Instructions:</strong> ${escapeHtml(order.notes)}</div>` : ''}
                        <p class="foot">Printed ${escapeHtml(new Date().toLocaleTimeString())}</p>
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
            variant="outline"
            size={compact ? 'sm' : 'default'}
            className="gap-2"
            onClick={printTicket}
            aria-label={`Print kitchen ticket for ${order.order_number || `order ${order.id}`}`}
        >
            <ChefHat className="size-4" />
            {compact ? 'KOT' : 'Print KOT'}
        </Button>
    );
}
