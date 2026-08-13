import React, { useState, useEffect, useRef } from 'react';
import { OrderUser } from '@/types/admin/Order';
import { router } from '@inertiajs/react';
import { orderStatus } from '@/routes/admin';

interface StatsProps {
    totalOrders: number;
    pendingOrders: number;
    completedOrders: number;
    totalRevenue: number;
}

interface OrderProps {
    orderUsers: OrderUser[];
    orderStatuses: Record<string, string>;
    filters: {
        search: string;
        status: string;
    };
    stats: StatsProps;
}

export default function Index({ orderUsers, orderStatuses, filters, stats }: OrderProps) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedStatus, setSelectedStatus] = useState<string>(filters.status || 'all');
    const [selectedOrder, setSelectedOrder] = useState<OrderUser | null>(null);

    const isFirstRender = useRef(true);

    // Sync search and status changes with backend via Inertia
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        const timer = setTimeout(() => {
            router.get(
                window.location.pathname,
                { search: searchTerm, status: selectedStatus },
                { preserveState: true, replace: true }
            );
        }, 300);

        return () => clearTimeout(timer);
    }, [searchTerm, selectedStatus]);

    // Quick Action to update order status
    const handleStatusChange = (orderId: number, newStatus: string) => {
        router.patch(orderStatus(orderId), {
            status: newStatus,
        });
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen text-gray-800">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Orders Dashboard</h1>
                    <p className="text-sm text-gray-500">Manage incoming restaurant orders and payment statuses</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Total Orders</p>
                    <p className="text-2xl font-extrabold text-gray-900 mt-1">{stats.totalOrders}</p>
                </div>
                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                    <p className="text-xs font-medium text-amber-500 uppercase tracking-wider">Pending Orders</p>
                    <p className="text-2xl font-extrabold text-amber-600 mt-1">{stats.pendingOrders}</p>
                </div>
                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                    <p className="text-xs font-medium text-emerald-500 uppercase tracking-wider">Completed Orders</p>
                    <p className="text-2xl font-extrabold text-emerald-600 mt-1">{stats.completedOrders}</p>
                </div>
                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                    <p className="text-xs font-medium text-blue-500 uppercase tracking-wider">Total Revenue</p>
                    <p className="text-2xl font-extrabold text-blue-600 mt-1">NPR {Number(stats.totalRevenue).toLocaleString()}</p>
                </div>
            </div>

            {/* Filter Tabs & Search Bar */}
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
                {/* Dynamic Status Tabs based on Enum */}
                <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
                    <button
                        onClick={() => setSelectedStatus('all')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors whitespace-nowrap ${selectedStatus === 'all'
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        All
                    </button>
                    {Object.entries(orderStatuses).map(([value, label]) => (
                        <button
                            key={value}
                            onClick={() => setSelectedStatus(value)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${selectedStatus === value
                                ? 'bg-emerald-600 text-white shadow-sm'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                {/* Search input */}
                <div className="w-full md:w-72">
                    <input
                        type="text"
                        placeholder="Search order # or customer..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            <tr>
                                <th className="py-4 px-6">Order ID</th>
                                <th className="py-4 px-6">Customer / Table</th>
                                <th className="py-4 px-6">Type</th>
                                <th className="py-4 px-6">Payment</th>
                                <th className="py-4 px-6">Order Status</th>
                                <th className="py-4 px-6">Total Amount</th>
                                <th className="py-4 px-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {orderUsers.length > 0 ? (
                                orderUsers.map((order) => (
                                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="py-4 px-6 font-semibold text-gray-900">
                                            {order.order_number || `#ORD-${order.id}`}
                                            <div className="text-xs text-gray-400 font-normal">
                                                {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="font-medium text-gray-900">
                                                {order.customer?.name || 'Walk-in Guest'}
                                            </div>
                                            {order.table && (
                                                <div className="text-xs text-emerald-600 font-medium">
                                                    Table: {order.table?.name}
                                                </div>
                                            )}
                                        </td>
                                        <td className="py-4 px-6 capitalize">
                                            <span className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs rounded-full font-medium">
                                                {order.order_type?.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-1.5">
                                                <span
                                                    className={`w-2 h-2 rounded-full ${order.payment_status === 'paid' ? 'bg-emerald-500' : 'bg-rose-500'
                                                        }`}
                                                />
                                                <span className="capitalize font-medium text-gray-800">
                                                    {order.payment_status}
                                                </span>
                                            </div>
                                            <span className="text-xs text-gray-400 uppercase">
                                                {order.payment_method || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <select
                                                value={order.status}
                                                onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                                className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border-gray-200"
                                            >
                                                {Object.entries(orderStatuses).map(([value, label]) => (
                                                    <option key={value} value={value}>
                                                        {label}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="py-4 px-6 font-bold text-gray-900">
                                            NPR {Number(order.total).toFixed(2)}
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <button
                                                onClick={() => setSelectedOrder(order)}
                                                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg transition-colors"
                                            >
                                                View Items
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className="text-center py-8 text-gray-400">
                                        No orders found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal remains unchanged */}

            {selectedOrder && (

                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">

                    <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-gray-100 relative">

                        <button

                            onClick={() => setSelectedOrder(null)}

                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 font-bold"

                        >

                            ✕

                        </button>



                        <h2 className="text-lg font-bold text-gray-900 mb-1">

                            Order {selectedOrder.order_number || `#${selectedOrder.id}`}

                        </h2>

                        <p className="text-xs text-gray-500 mb-4">

                            Customer: {selectedOrder.customer?.name || 'Guest'} | Payment: {selectedOrder.payment_method?.toUpperCase()}

                        </p>



                        {/* Order Items List */}

                        <div className="divide-y divide-gray-100 max-h-60 overflow-y-auto mb-4 pr-1">

                            {selectedOrder.items && selectedOrder.items.length > 0 ? (

                                selectedOrder.items.map((item) => (

                                    <div key={item.id} className="py-2.5 flex justify-between items-center text-sm">

                                        <div>

                                            <p className="font-medium text-gray-800">

                                                {item.food_item?.title || `Food Item #${item.food_item_id}`}

                                            </p>

                                            <p className="text-xs text-gray-400">

                                                NPR {item.price_at_time} × {item.quantity}

                                            </p>

                                        </div>

                                        <span className="font-semibold text-gray-900">

                                            NPR {(item.price_at_time * item.quantity).toFixed(2)}

                                        </span>

                                    </div>

                                ))

                            ) : (

                                <p className="text-sm text-gray-400 py-4">No item details available.</p>

                            )}

                        </div>



                        {/* Financial Breakdown */}

                        <div className="bg-gray-50 p-3 rounded-xl text-xs space-y-1 mb-4">

                            <div className="flex justify-between text-gray-500">

                                <span>Subtotal</span>

                                <span>NPR {Number(selectedOrder.subtotal).toFixed(2)}</span>

                            </div>

                            <div className="flex justify-between text-gray-500">

                                <span>Discount</span>

                                <span>- NPR {Number(selectedOrder.discount_amount).toFixed(2)}</span>

                            </div>

                            <div className="flex justify-between text-gray-900 font-bold text-sm pt-1 border-t border-gray-200">

                                <span>Grand Total</span>

                                <span className="text-emerald-600">NPR {Number(selectedOrder.total).toFixed(2)}</span>

                            </div>

                        </div>



                        <button

                            onClick={() => setSelectedOrder(null)}

                            className="w-full py-2.5 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-xl text-sm transition-colors"

                        >

                            Close

                        </button>

                    </div>

                </div>

            )}
        </div>
    );
}
