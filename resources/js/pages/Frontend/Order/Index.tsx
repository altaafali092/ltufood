import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import axios from 'axios';
import Header from '@/components/Frontend/Header';
import { useAppearance } from '@/hooks/use-appearance';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CreditCard, ChevronDown } from 'lucide-react';
import { Money } from '@/Utils/Money';
import { home, orderPayment, orderTrack } from '@/routes';
import { receipt } from '@/routes/orders';
import { Order } from '@/types/frontend/Order';
import { OrderItem } from '@/types/admin/Order';

interface OrderIndexProps {
    orders: Order[];
    totalQuantity: number;
}

const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });

const StatusBadge: React.FC<{ status: Order['status'] }> = ({ status }) => {
    const styles: Record<Order['status'], string> = {
        pending: 'bg-amber-50 text-amber-700 border-amber-200/60 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/50',
        preparing: 'bg-blue-50 text-blue-700 border-blue-200/60 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800/50',
        ready: 'bg-indigo-50 text-indigo-700 border-indigo-200/60 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-800/50',
        served: 'bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/50',
        paid: 'bg-slate-100 text-slate-700 border-slate-200/60 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700/50',
        cancelled: 'bg-rose-50 text-rose-700 border-rose-200/60 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/50',
    };

    return (
        <span className={`px-2 py-0.5 text-[11px] font-medium rounded-md border capitalize ${styles[status]}`}>
            {status}
        </span>
    );
};

const PaymentStatusBadge: React.FC<{ status: Order['payment_status'] }> = ({ status }) => {
    const isPaid = status === 'paid';
    return (
        <span className={`px-2 py-0.5 text-[11px] font-medium rounded-md border capitalize ${
            isPaid
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/50'
                : 'bg-amber-50 text-amber-700 border-amber-200/60 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/50'
        }`}>
            {status}
        </span>
    );
};

const EmptyState: React.FC = () => (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm p-12 text-center">
        <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
            🍽️
        </div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100 mb-1">No orders found</h3>
        <p className="text-sm text-gray-500 dark:text-slate-400 mb-6">Looks like you haven't placed any orders yet.</p>
        <Link
            href={home().url}
            className="inline-flex items-center px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm rounded-xl transition-colors shadow-sm"
        >
            Browse Menu
        </Link>
    </div>
);

const OrderItemRow: React.FC<{ item: OrderItem }> = ({ item }) => (
    <div className="py-2.5 flex justify-between items-center text-sm">
        <div>
            <p className="font-semibold text-gray-800 dark:text-slate-200">
                {item.food_item?.title || `Item #${item.food_item_id}`}
            </p>
            <p className="text-xs text-gray-400 dark:text-slate-500">
                {Money(item.price_at_time)} × {item.quantity}
            </p>
        </div>
        <span className="font-bold text-gray-900 dark:text-slate-100">{Money(item.total_price)}</span>
    </div>
);

const OrderCard: React.FC<{
    order: Order;
    isExpanded: boolean;
    onToggleExpand: (id: number) => void;
}> = ({ order, isExpanded, onToggleExpand }) => {
    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-800 shadow-xs overflow-hidden transition-all hover:border-gray-200 dark:hover:border-slate-700">
            {/* Header Row */}
            <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-gray-900 dark:text-slate-100 text-sm tracking-tight">
                            {order.order_number}
                        </span>
                        <StatusBadge status={order.status} />
                        <PaymentStatusBadge status={order.payment_status} />
                        {order.payment_status === 'paid' && (
                            <div className="text-xs text-gray-500 bg-green-300 border border-green-600 px-1.5 rounded-md">
                                <Link href={receipt(order.order_number)}>Receipt</Link>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-slate-500">
                        <span>{formatDate(order.created_at)}</span>
                        <span>•</span>
                        <span className="capitalize">{order.order_type.replace('_', ' ')}</span>
                        {order.table && (
                            <>
                                <span>•</span>
                                <span className="text-gray-600 dark:text-slate-300 font-medium">
                                    {order.table.name}
                                </span>
                            </>
                        )}
                    </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-5 pt-3 md:pt-0 border-t md:border-0 border-gray-100 dark:border-slate-800">
                    <div className="text-left md:text-right">
                        <span className="block text-[10px] text-gray-400 dark:text-slate-500 uppercase font-semibold tracking-wider">
                            Total
                        </span>
                        <span className="text-base font-extrabold text-gray-900 dark:text-slate-100">
                            {Money(order.total)}
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        {order?.status === 'Served' && order.payment_status === 'unpaid' && (
                            <Link
                                href={orderPayment(order.id)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-lg transition-colors shadow-2xs"
                            >
                                <CreditCard className="w-3.5 h-3.5" />
                                Make Payment
                            </Link>
                        )}

                        {order.payment_status === 'unpaid' && (
                            <Link
                                href={orderTrack(order.id)}
                                className="inline-flex items-center px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium rounded-lg transition-colors"
                            >
                                Track Live
                            </Link>
                        )}

                        <button
                            type="button"
                            onClick={() => onToggleExpand(order.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-900 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg transition-colors"
                        >
                            <span>{isExpanded ? 'Hide Details' : 'View Details'}</span>
                            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Expandable Details */}
            {isExpanded && (
                <div className="bg-slate-50/50 dark:bg-slate-800/30 border-t border-gray-100 dark:border-slate-800 p-4 sm:p-5 space-y-3">
                    <h4 className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">
                        Order Items ({order.items.length})
                    </h4>
                    <div className="divide-y divide-gray-100 dark:divide-slate-800">
                        {order.items.map((item) => (
                            <OrderItemRow key={item.id} item={item} />
                        ))}
                    </div>
                    <div className="pt-3 border-t border-gray-200/60 dark:border-slate-700/60 text-xs space-y-1.5 max-w-xs ml-auto">
                        <div className="flex justify-between text-gray-500 dark:text-slate-400">
                            <span>Subtotal</span>
                            <span>{Money(order.subtotal)}</span>
                        </div>
                        {order.discount_amount > 0 && (
                            <div className="flex justify-between text-rose-600 dark:text-rose-400">
                                <span>Discount</span>
                                <span>- {Money(order.discount_amount)}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-gray-900 dark:text-slate-100 font-bold text-xs pt-2 border-t border-gray-200 dark:border-slate-700">
                            <span>Grand Total</span>
                            <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">{Money(order.total)}</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// ==========================================
// Main Page Component
// ==========================================

export default function Index({ orders, totalQuantity }: OrderIndexProps) {
    const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);
    const [, setCartOpen] = useState(false);

    const { resolvedAppearance, updateAppearance } = useAppearance();
    const isDark = resolvedAppearance === 'dark';
    const toggleTheme = () => updateAppearance(isDark ? 'light' : 'dark');

    const handleBack = () => window.history.back();

    const toggleExpand = (id: number) => {
        setExpandedOrderId((prev) => (prev === id ? null : id));
    };

    // --- GEOFENCING CORE HOOK ---
    useEffect(() => {
        // Find if there is an active, unpaid dine-in order that contains table parameters
        const activeUnpaidOrder = orders.find(
            (o) => o.payment_status === 'unpaid' && o.status !== 'cancelled' && o.table?.qr_uuid
        );

        // If there's no dynamic table tracking needed, do not engage GPS
        if (!activeUnpaidOrder || !activeUnpaidOrder.table?.qr_uuid) return;

        if (!('geolocation' in navigator)) {
            console.warn('Geolocation is not supported by this browser.');
            return;
        }

        const targetTableUuid = activeUnpaidOrder.table.qr_uuid;

        // Monitor continuous hardware coordinates
        const watchId = navigator.geolocation.watchPosition(
            (position) => {
                const { latitude, longitude } = position.coords;

                axios.post(`/api/geofence/verify/${targetTableUuid}`, {
                    lat: latitude,
                    lng: longitude,
                }, {
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                })
                .catch((error) => {
                    // Triggers the 403 Forbidden alert window built in the controller logic
                    if (error.response && error.response.status === 403) {
                        alert(error.response.data.message);
                    }
                });
            },
            (error) => {
                console.error(`Geofence location error: ${error.message}`);
            },
            {
                enableHighAccuracy: true,
                timeout: 12000,
                maximumAge: 0,
            }
        );

        // Cleanup tracking instance automatically if component handles routing or unmounts
        return () => {
            navigator.geolocation.clearWatch(watchId);
        };
    }, [orders]);

    return (
        <>
            <Head title="My Orders" />

            <div
                className="min-h-screen bg-[#f7f8f7] dark:bg-[#080c10] text-slate-700 dark:text-slate-200 transition-colors duration-200"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
                <Header isDark={isDark} toggleTheme={toggleTheme} totalItems={totalQuantity} setCartOpen={setCartOpen} />

                <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <Button
                            onClick={handleBack}
                            variant="outline"
                            className="rounded-full w-fit dark:border-slate-700 dark:hover:bg-slate-800"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back
                        </Button>

                        <div className="sm:text-right">
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">My Orders</h1>
                            <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                                Track active orders and review your past food history.
                            </p>
                        </div>
                    </div>

                    {orders.length === 0 ? (
                        <EmptyState />
                    ) : (
                        <div className="space-y-3">
                            {orders.map((order) => (
                                <OrderCard
                                    key={order.id}
                                    order={order}
                                    isExpanded={expandedOrderId === order.id}
                                    onToggleExpand={toggleExpand}
                                />
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </>
    );
}