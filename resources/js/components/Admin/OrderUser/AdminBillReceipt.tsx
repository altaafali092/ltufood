import React from 'react';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import { OrderUser } from '@/types/admin/Order';
import { OfficeSetting } from '@/types/admin/OfficeSetting';

interface AdminBillReceiptProps {
    order: OrderUser | null;
    officeSetting: OfficeSetting;
}

export default function AdminBillReceipt({
    order,
    officeSetting,
}: AdminBillReceiptProps) {
    if (!order) return null;

    const handlePrint = () => {
        window.print();
    };

    const formattedDate = order.created_at
        ? new Date(order.created_at)
            .toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
            })
            .toUpperCase()
        : 'N/A';

    const formattedTime = order.created_at
        ? new Date(order.created_at).toLocaleTimeString('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        })
        : 'N/A';

    const taxAmount = Number(order.tax_amount ?? 0);
    const subtotal = Number(order.subtotal ?? 0);
    const total = Number(order.total ?? 0);

    return (
        <div className="flex flex-col items-center gap-4 py-2">
            {/* Thermal Print Receipt Container */}
            <div className="receipt-print-area w-[320px] rounded-sm border bg-white p-4 font-mono text-xs uppercase leading-tight text-black shadow-sm print:w-[80mm] print:border-none print:p-0 print:shadow-none">
                {/* Header */}
                <div className="space-y-1 text-center">
                    <h1 className="text-base font-extrabold tracking-wide">
                        {officeSetting?.office_name}
                    </h1>
                    <p className="text-[11px] text-gray-700">
                        {officeSetting?.office_address}
                    </p>
                    <p className="pt-1 font-bold">
                        BILL NO: {order.order_number || `#${order.id}`}
                    </p>
                </div>

                {/* Dashed Separator */}
                <div className="my-2 border-b border-dashed border-black" />

                {/* Metadata */}
                <div className="space-y-1 font-semibold">
                    <div className="flex justify-between">
                        <span>TABLE: {order.table?.table_number ?? 'N/A'}</span>
                        <span>DATE: {formattedDate}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="max-w-42.5 truncate">
                            CUST: {order.customer?.name ?? 'WALK-IN GUEST'}
                        </span>
                        <span>TIME: {formattedTime}</span>
                    </div>
                </div>

                {/* Dashed Separator */}
                <div className="my-2 border-b border-dashed border-black" />

                {/* Items Table */}
                <div>
                    <div className="flex justify-between pb-1 font-bold">
                        <span className="w-1/2 text-left">DESCRIPTION</span>
                        <span className="w-1/6 text-center">QTY</span>
                        <span className="w-1/6 text-right">RATE</span>
                        <span className="w-1/6 text-right">AMOUNT</span>
                    </div>

                    <div className="space-y-1 pt-1">
                        {order.items && order.items.length > 0 ? (
                            order.items.map((item) => (
                                <div key={item.id} className="flex justify-between">
                                    <span className="w-1/2 truncate text-left">
                                        {item.food_item?.title || 'ITEM'}
                                    </span>
                                    <span className="w-1/6 text-center">
                                        {item.quantity}
                                    </span>
                                    <span className="w-1/6 text-right">
                                        {Number(item.price_at_time).toFixed(2)}
                                    </span>
                                    <span className="w-1/6 text-right font-medium">
                                        {Number(item.total_price).toFixed(2)}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <div className="flex justify-between">
                                <span className="w-1/2 text-left">ITEM</span>
                                <span className="w-1/6 text-center">1</span>
                                <span className="w-1/6 text-right">0.00</span>
                                <span className="w-1/6 text-right font-medium">
                                    0.00
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Dashed Separator */}
                <div className="my-2 border-b border-dashed border-black" />

                {/* Calculation Summary */}
                <div className="space-y-1 font-medium">
                    <div className="flex justify-between">
                        <span>SUB TOTAL</span>
                        <span>Rs. {subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>VAT</span>
                        <span>Rs. {(taxAmount / 2).toFixed(2)}</span>
                    </div>

                </div>

                {/* Dashed Separator */}
                <div className="my-2 border-b border-dashed border-black" />

                {/* Total */}
                <div className="flex items-center justify-between py-0.5 text-sm font-extrabold">
                    <span>TOTAL</span>
                    <span className="text-base">Rs. {total.toFixed(2)}</span>
                </div>

                {/* Dashed Separator */}
                <div className="my-2 border-b border-dashed border-black" />

                {/* Tax Statement */}
                <div className="space-y-1 text-center text-[11px]">
                    <p className="font-bold tracking-wide">
                        ABOVE PRICES INCLUDE TAXES
                    </p>
                    <div className="flex justify-between font-semibold">
                        <span>TOTAL VAT</span>
                        <span>Rs. {taxAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-semibold">
                        <span>NON-TAXABLE</span>
                        <span>Rs. 0.00</span>
                    </div>
                </div>

                {/* Dashed Separator */}
                <div className="my-2 border-b border-dashed border-black" />

                {/* Footer */}
                <div className="space-y-2">
                    <div className="flex justify-between font-bold">
                        <span>PAID BY:</span>
                        <span>
                            {(
                                order.payment_method || 'CASH'
                            ).toUpperCase()}
                        </span>
                    </div>

                    <div className="space-y-1 pt-1 text-center font-bold">
                        <p>THANKS FOR YOUR VISIT! HAPPY JOURNEY</p>
                        <p>{new Date().toLocaleString()}</p>
                    </div>
                    <div className="space-y-1 pt-1 text-center font-bold">
                        <div className="space-y-1 pt-1 text-center font-bold">
                            <p>
                                Bill prepared By: {order?.updated_by?.name || 'N/A'}
                            </p>
                        </div>

                    </div>
                </div>
            </div>

            {/* Print Button */}
            <Button
                type="button"
                onClick={handlePrint}
                className="w-full gap-2 print:hidden"
            >
                <Printer className="size-4" />
                <span>Print Bill</span>
            </Button>

            {/* Thermal Print Media Query Fixes */}
            <style
                dangerouslySetInnerHTML={{
                    __html: `
                    @media print {
                        @page {
                            size: 80mm auto;
                            margin: 0;
                        }
                        body * {
                            visibility: hidden !important;
                        }
                        .receipt-print-area,
                        .receipt-print-area * {
                            visibility: visible !important;
                        }
                        .receipt-print-area {
                            position: fixed !important;
                            left: 0 !important;
                            top: 0 !important;
                            width: 80mm !important;
                            max-height: none !important;
                            overflow: visible !important;
                            padding: 4mm !important;
                            margin: 0 !important;
                            box-shadow: none !important;
                            border: none !important;
                            background: white !important;
                            z-index: 99999 !important;
                        }
                    }
                `,
                }}
            />
        </div>
    );
}