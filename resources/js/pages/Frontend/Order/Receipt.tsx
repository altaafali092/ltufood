import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { Money } from '@/Utils/Money';
import { Printer, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Order } from '@/types/frontend/Order';



interface ReceiptProps {
    order: Order
}

export default function Receipt({ order }: ReceiptProps) {
    const isPaid = order.payment_status === 'paid';

    return (
        <div className="min-h-screen bg-slate-100 dark:bg-slate-950 py-10 px-4 font-sans print:p-0 print:bg-white">
            <Head title={`Bill Receipt #${order.order_number}`} />

            <div className="max-w-md mx-auto space-y-4">
                {/* Navigation & Action Bar */}
                <div className="flex items-center justify-between print:hidden bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
                    <Link
                        href="/orders"
                        className="inline-flex items-center text-xs font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 shrink-0"
                    >
                        <ArrowLeft className="w-4 h-4 mr-1" /> My Orders
                    </Link>

                    {/* Native Print / Save as PDF Button */}
                    <Button
                        type="button"
                        onClick={() => window.print()}
                        variant="outline"
                        size="sm"
                        className="rounded-lg text-xs px-3 py-1.5 flex items-center gap-1.5 cursor-pointer bg-white dark:bg-slate-800"
                    >
                        <Printer className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" /> Print / Save PDF
                    </Button>
                </div>

                {/* Printable Receipt Target Area */}
                <div className="bg-white text-slate-800 rounded-2xl border border-slate-200 p-6 shadow-xs print:shadow-none print:border-none print:w-full">
                    {!isPaid && (
                        <div className="mb-6 p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2.5 print:hidden">
                            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                            <p className="text-xs text-amber-800">
                                Please present this bill at the reception counter to pay your bill.
                            </p>
                        </div>
                    )}

                    {/* Restaurant Header */}
                    <div className="text-center border-b border-dashed border-slate-200 pb-4">
                        <h2 className="text-xl font-black tracking-tight text-slate-900 uppercase">
                            Food Order Receipt
                        </h2>
                        <p className="text-xs text-slate-500 mt-1">Order #{order.order_number}</p>
                        <p className="text-[11px] text-slate-400">
                            {new Date(order.created_at).toLocaleString()}
                        </p>
                    </div>

                    {/* Table & Method Info */}
                    <div className="py-3 border-b border-dashed border-slate-200 text-xs flex justify-between text-slate-600">
                        <div>
                            <span>Table: </span>
                            <span className="font-bold text-slate-800">{order.table?.name || 'N/A'}</span>
                        </div>
                        <div>
                            <span>Payment: </span>
                            <span className="font-bold text-slate-800 uppercase">{order.payment_method}</span>
                        </div>
                    </div>

                    {/* Items List */}
                    <div className="py-4 border-b border-dashed border-slate-200 space-y-2">
                        {order.items.map((item) => (
                            <div key={item.id} className="flex justify-between text-xs">
                                <div>
                                    <p className="font-bold text-slate-800">{item.food_item?.title}</p>
                                    <p className="text-[10px] text-slate-400">
                                        {Money(item.price_at_time)} × {item.quantity}
                                    </p>
                                </div>
                                <span className="font-bold text-slate-800">{Money(item.total_price)}</span>
                            </div>
                        ))}
                    </div>

                    {/* Calculation Breakdown */}
                    <div className="pt-4 space-y-1.5 text-xs">
                        <div className="flex justify-between text-slate-500">
                            <span>Subtotal</span>
                            <span>{Money(order.subtotal)}</span>
                        </div>
                        {order.discount_amount > 0 && (
                            <div className="flex justify-between text-rose-600">
                                <span>Discount</span>
                                <span>- {Money(order.discount_amount)}</span>
                            </div>
                        )}
                        <div className="flex justify-between font-black text-sm text-slate-900 pt-2 border-t border-slate-200">
                            <span>Grand Total</span>
                            <span className="text-emerald-600">{Money(order.total)}</span>
                        </div>
                    </div>

                    {/* Footer Status */}
                    <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col items-center justify-center text-center">
                        {isPaid ? (
                            <div className="flex items-center gap-1.5 text-emerald-600 font-extrabold text-sm uppercase tracking-wider">
                                <CheckCircle2 className="w-5 h-5" /> Paid
                            </div>
                        ) : (
                            <div className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full font-bold text-xs tracking-wider uppercase">
                                Payment Pending at Counter
                            </div>
                        )}
                        <p className="text-[10px] text-slate-400 mt-3">Thank you for dining with us!</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
