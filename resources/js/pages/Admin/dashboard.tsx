import { Head, Link, router } from '@inertiajs/react';
import { useEcho } from '@laravel/echo-react';
import {
    ArrowUpRight,
    Bell,
    Building2Icon,
    ChevronDown,
    Clock3,
    CloudOff,
    DollarSign,
    Ellipsis,
    Flame,
    LayoutDashboard,
    MoreHorizontal,
    Package,
    Plus,
    RefreshCw,
    Search,
    ShoppingBag,
    Sparkles,
    Table2,
    TrendingUp,
    Users,
    WalletCards,
    WifiCog,
} from 'lucide-react';
import { useMemo, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import AdminBillPrintButton from '@/components/AdminBillPrintButton';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { dashboard, orderStatus } from '@/routes/admin';
import type { Order } from '@/types/frontend/Order';
import { create } from '@/routes/admin/tables';
import { index } from '@/routes/admin/userOrders';
import { OrderItem, OrderUser } from '@/types/admin/Order';

type DashboardTableStatus = {
    id: number;
    table_number: string;
    status: string;
    amount: number;
};

type ActiveTablesSummary = {
    occupied: number;
    total: number;
    percent: number;
};

interface DashboardProps {
    order?: Order;
    orders_count?: number;
    todays_orders?: number;
    total_menu_items?: number;
    todaySales?: number;
    tables?: DashboardTableStatus[];
    active_tables?: ActiveTablesSummary;
    liveOrders?: OrderUser[];
    recentOrders?: OrderUser[];
    orderStatuses?: Record<string, string>;
    popularItems: OrderItem[],
    salesOverview?: Record<string, {
        total_sales: number;
        total_orders: number;
        average_order_value: number;
        change_percent: number;
        points: Array<{ label: string; sales: number }>;
    }>;
    paymentOverview?: {
        revenue: number;
        payment_methods: Record<string, number>;
        pending_amount: number;
        counts: { paid: number; pending: number; failed: number; refunded: number };
    };
}



import {
   
    useOfflineAdminOrders,
} from '@/hooks/use-offline-admin-orders';

const money = (value: number | string) =>
    `NPR ${Number(value).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

function formatRelativeTime(iso: string): string {
    const minutes = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);

    if (minutes < 1) {
        return 'Just now';
    }

    if (minutes < 60) {
        return `${minutes} min ago`;
    }

    const hours = Math.floor(minutes / 60);

    if (hours < 24) {
        return `${hours} hr ago`;
    }

    return new Date(iso).toLocaleDateString();
}

function orderItemsSummary(order: OrderUser): {
    text: string;
    quantity: number;
} {
    const items = order.items ?? [];
    const quantity = items.reduce((sum, item) => sum + item.quantity, 0);
    const text =
        items
            .map((item) => item.food_item?.title ?? `Item #${item.food_item_id}`)
            .join(', ') || 'No items';

    return { text, quantity };
}

function paymentLabel(paymentStatus: OrderUser['payment_status']): string {
    return paymentStatus === 'paid' ? 'Paid' : 'Pending';
}

function orderMatchesSearch(order: OrderUser, query: string): boolean {
    const { text } = orderItemsSummary(order);
    const haystack = [
        order.order_number,
        order.table?.table_number,
        order.customer?.name,
        text,
    ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

    return haystack.includes(query.toLowerCase());
}

const statusClasses: Record<string, string> = {
    Pending:
        'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300',
    Preparing:
        'border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-300',
    Ready: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300',
    Served: 'border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-500/20 dark:bg-slate-500/10 dark:text-slate-300',
    Cancelled:
        'border-red-200 bg-red-50 text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300',
    Paid: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300',
};

function StatusBadge({ status }: { status: string }) {
    return (
        <Badge
            variant="outline"
            className={cn(
                'rounded-full px-2.5 py-1 text-[11px]',
                statusClasses[status],
            )}
        >
            {status}
        </Badge>
    );
}



export default function Dashboard({
    order: initialOrder,
    orders_count,
    todays_orders,
    total_menu_items,
    todaySales,
    tables: tableStatuses = [],
    active_tables,
    liveOrders = [],
    recentOrders = [],
    popularItems = [],
    salesOverview = {},
    paymentOverview = {
        revenue: 0,
        payment_methods: {},
        pending_amount: 0,
        counts: { paid: 0, pending: 0, failed: 0, refunded: 0 },
    },
}: DashboardProps) {
    const [period, setPeriod] = useState('7 Days');
    const [search, setSearch] = useState('');
    const [selectedTable, setSelectedTable] = useState<string | null>(null);
    const [, setOrder] = useState<Order | undefined>(initialOrder);
    const { online } = useOfflineAdminOrders();
    const selectedSales = salesOverview[period] ?? {
        total_sales: 0,
        total_orders: 0,
        average_order_value: 0,
        change_percent: 0,
        points: [],
    };
    const chartPoints = selectedSales.points.length > 0
        ? selectedSales.points
        : [{ label: period, sales: 0 }];
    const maxSales = Math.max(...chartPoints.map((point) => point.sales), 1);
    const linePoints = chartPoints.map((point, index) => {
        const x = chartPoints.length === 1 ? 350 : (index / (chartPoints.length - 1)) * 700;
        const y = 195 - (point.sales / maxSales) * 165;
        return `${x},${y}`;
    }).join(' ');
    const areaPoints = `0,220 ${linePoints} 700,220`;
    const paymentTotal = paymentOverview.revenue + paymentOverview.pending_amount;
    const paymentPercent = paymentTotal > 0
        ? Math.round((paymentOverview.revenue / paymentTotal) * 100)
        : 0;
    const paymentRows = [
        ['Cash', paymentOverview.payment_methods.Cash ?? 0],
        ['Online', paymentOverview.payment_methods.Online ?? 0],
        ['Card', paymentOverview.payment_methods.Card ?? 0],
        ['Pending', paymentOverview.pending_amount],
    ].map(([label, value]) => [
        label,
        money(Number(value)),
        `${paymentTotal > 0 ? Math.round((Number(value) / paymentTotal) * 100) : 0}%`,
    ]);

    useEcho(
        `orders.${initialOrder?.id ?? 0}`,
        '.OrderStatusUpdated',
        (event: {
            order: { id: number; payment_status: Order['payment_status'] };
        }) => {
            if (event?.order?.payment_status) {
                setOrder((previous) =>
                    previous
                        ? {
                            ...previous,
                            payment_status: event.order.payment_status,
                        }
                        : undefined,
                );
            }
        },
        [initialOrder?.id],
    );

    const filteredLiveOrders = useMemo(() => {
        if (!search.trim()) {
            return liveOrders;
        }

        return liveOrders.filter((order) =>
            orderMatchesSearch(order, search.trim()),
        );
    }, [liveOrders, search]);

    const updateOrderStatus = (orderId: number, status: OrderUser['status']) => {
        router.patch(
            orderStatus(orderId),
            { status },
            { preserveScroll: true },
        );
    };

    const refreshOrders = () => {
        router.reload({
            only: ['liveOrders', 'recentOrders', 'orders_count'],
            preserveScroll: true,
        });
    };

    const progressColors = [
        'bg-blue-500',
        'bg-cyan-500',
        'bg-indigo-500',
        'bg-violet-500',
        'bg-sky-400',
    ];

    const summaryCards = [
        {
            title: "Today's Sales",
            value: money(todaySales?.toString() ?? '0'),
            change: '+12.8%',
            icon: DollarSign,
            tone: 'bg-blue-500/10 text-blue-600 dark:text-blue-300',
        },
        {
            title: "Today's Orders",
            value: todays_orders?.toString() ?? '0',
            change: '+8.4%',
            icon: ShoppingBag,
            tone: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-300',
        },
        {
            title: 'Pending Orders',
            value: orders_count?.toString() ?? '0',
            change: 'Needs action',
            icon: Clock3,
            tone: 'bg-amber-500/10 text-amber-600 dark:text-amber-300',
        },
        {
            title: 'Active Tables',
            value:
                active_tables && active_tables.total > 0
                    ? `${active_tables.occupied} / ${active_tables.total}`
                    : '0 / 0',
            change:
                active_tables && active_tables.total > 0
                    ? `${active_tables.percent}% occupied`
                    : 'No tables yet',
            icon: Table2,
            tone: 'bg-violet-500/10 text-violet-600 dark:text-violet-300',
        },
        {
            title: 'Customers Today',
            value: '72',
            change: '+14.2%',
            icon: Users,
            tone: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300',
        },
        {
            title: 'Total Menu Items',
            value: total_menu_items?.toString() ?? "0",
            change: '0 unavailable',
            icon: Package,
            tone: 'bg-slate-500/10 text-slate-600 dark:text-slate-300',
        },
    ];

    return (
        <>
            <Head title="Admin Dashboard" />
            <div className="w-full bg-[#f7f9fc] dark:bg-[#080d18]">

                <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
                    <div>

                        <h1 className="mt-1 text-xl font-bold tracking-tight text-slate-950 sm:text-2xl dark:text-white">
                            Welcome To Dashboard
                        </h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="relative hidden w-56 lg:block">
                            <div className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${online ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                                }`}>
                                {online ? <Building2Icon className="size-3.5" /> : <CloudOff className="size-3.5" />}
                                {online ? 'Online' : 'Offline'}
                            </div>
                        </div>


                    </div>
                </div>


                <main className="space-y-6 p-4 sm:p-6 lg:p-8">
                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
                        {summaryCards.map((card) => {
                            const Icon = card.icon;

                            return (
                                <Card
                                    key={card.title}
                                    className="border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/70"
                                >
                                    <CardContent className="p-4">
                                        <div className="flex items-start justify-between">
                                            <div
                                                className={cn(
                                                    'flex size-9 items-center justify-center rounded-lg',
                                                    card.tone,
                                                )}
                                            >
                                                <Icon className="size-4" />
                                            </div>
                                            <MoreHorizontal className="size-4 text-slate-300" />
                                        </div>
                                        <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
                                            {card.title}
                                        </p>
                                        <p className="mt-1 text-xl font-bold tracking-tight text-slate-950 dark:text-white">
                                            {card.value}
                                        </p>
                                        <p className="mt-2 flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                                            {card.change.includes('%') && (
                                                <ArrowUpRight className="size-3" />
                                            )}
                                            {card.change}
                                        </p>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>

                    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(300px,0.8fr)]">
                        <Card className="border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
                            <CardHeader className="flex-row items-start justify-between space-y-0">
                                <div>
                                    <CardTitle className="text-base">
                                        Sales overview
                                    </CardTitle>
                                    <p className="mt-1 text-xs text-slate-500">
                                        Revenue and order performance
                                    </p>
                                </div>
                                <div className="flex rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
                                    {[
                                        'Today',
                                        '7 Days',
                                        '30 Days',
                                        'This Year',
                                    ].map((item) => (
                                        <button
                                            key={item}
                                            type="button"
                                            onClick={() => setPeriod(item)}
                                            className={cn(
                                                'rounded-md px-2 py-1.5 text-[10px] font-medium transition-colors sm:px-3',
                                                period === item
                                                    ? 'bg-white text-blue-600 shadow-sm dark:bg-slate-700 dark:text-blue-300'
                                                    : 'text-slate-500',
                                            )}
                                        >
                                            {item}
                                        </button>
                                    ))}
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="mb-4 flex flex-wrap items-end gap-6">
                                    <div>
                                        <p className="text-2xl font-bold text-slate-950 dark:text-white">
                                            {money(selectedSales.total_sales)}
                                        </p>
                                        <p className={cn('mt-1 flex items-center gap-1 text-xs', selectedSales.change_percent >= 0 ? 'text-emerald-600' : 'text-rose-600')}>
                                            <TrendingUp className="size-3.5" /> {selectedSales.change_percent >= 0 ? '+' : ''}{selectedSales.change_percent}% vs last period
                                        </p>
                                    </div>
                                    <div className="text-xs">
                                        <p className="text-slate-400">
                                            Total orders
                                        </p>
                                        <p className="mt-1 font-bold text-slate-800 dark:text-slate-200">
                                            {selectedSales.total_orders}
                                        </p>
                                    </div>
                                    <div className="text-xs">
                                        <p className="text-slate-400">
                                            Avg. order value
                                        </p>
                                        <p className="mt-1 font-bold text-slate-800 dark:text-slate-200">
                                            {money(selectedSales.average_order_value)}
                                        </p>
                                    </div>
                                </div>
                                <div className="relative h-52 overflow-hidden rounded-xl bg-slate-50/80 dark:bg-slate-950/40">
                                    <div className="absolute inset-0 flex flex-col justify-between p-4">
                                        {[24, 18, 12, 6, 0].map((value) => (
                                            <div
                                                key={value}
                                                className="flex items-center gap-2 text-[10px] text-slate-400"
                                            >
                                                <span className="w-5 text-right">
                                                    {value}k
                                                </span>
                                                <span className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
                                            </div>
                                        ))}
                                    </div>
                                    <svg
                                        viewBox="0 0 700 220"
                                        preserveAspectRatio="none"
                                        className="absolute inset-x-9 top-4 h-[calc(100%-42px)] w-[calc(100%-56px)]"
                                        aria-label={`Revenue chart for ${period}`}
                                    >
                                        <defs>
                                            <linearGradient
                                                id="salesFill"
                                                x1="0"
                                                x2="0"
                                                y1="0"
                                                y2="1"
                                            >
                                                <stop
                                                    offset="0%"
                                                    stopColor="#2563eb"
                                                    stopOpacity=".25"
                                                />
                                                <stop
                                                    offset="100%"
                                                    stopColor="#2563eb"
                                                    stopOpacity="0"
                                                />
                                            </linearGradient>
                                        </defs>
                                        <polygon
                                            points={areaPoints}
                                            fill="url(#salesFill)"
                                        />
                                        <polyline
                                            points={linePoints}
                                            fill="none"
                                            stroke="#2563eb"
                                            strokeLinecap="round"
                                            strokeWidth="3"
                                        />
                                    </svg>
                                    <div className="absolute inset-x-4 bottom-2 flex justify-between pl-7 text-[10px] text-slate-400">
                                        {chartPoints.filter((_, index) => chartPoints.length <= 8 || index % Math.ceil(chartPoints.length / 8) === 0).map((point) => (
                                            <span key={point.label}>{point.label}</span>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
                            <CardHeader className="flex-row items-center justify-between space-y-0">
                                <CardTitle className="text-base">
                                    Payment overview
                                </CardTitle>
                                <WalletCards className="size-4 text-blue-500" />
                            </CardHeader>
                            <CardContent className="space-y-5">
                                <div className="rounded-xl bg-blue-50 p-4 dark:bg-blue-500/10">
                                    <p className="text-xs text-blue-700 dark:text-blue-300">
                                        Today's revenue
                                    </p>
                                    <p className="mt-1 text-2xl font-bold text-blue-950 dark:text-blue-100">
                                        {money(paymentOverview.revenue)}
                                    </p>
                                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-blue-100 dark:bg-blue-950">
                                        <div className="h-full rounded-full bg-blue-600" style={{ width: `${paymentPercent}%` }} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3 text-xs">
                                    {paymentRows.map(([label, value, percent]) => (
                                        <div
                                            key={label}
                                            className="rounded-lg border border-slate-100 p-3 dark:border-slate-800"
                                        >
                                            <div className="flex justify-between text-slate-500">
                                                <span>{label}</span>
                                                <span>{percent}</span>
                                            </div>
                                            <p className="mt-1 font-semibold text-slate-900 dark:text-white">
                                                {value}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                                <p className="text-[11px] text-slate-400">
                                    Paid {paymentOverview.counts.paid} · Pending {paymentOverview.counts.pending} · Failed {paymentOverview.counts.failed} · Refunded {paymentOverview.counts.refunded}
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
                        <CardHeader className="flex-row items-center justify-between space-y-0">
                            <div>
                                <CardTitle className="text-base">
                                    Live orders
                                </CardTitle>
                                <p className="mt-1 text-xs text-slate-500">
                                    Real-time kitchen and service workflow
                                </p>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                className="gap-2"
                                type="button"
                                onClick={refreshOrders}
                            >
                                <RefreshCw className="size-3.5" /> Refresh
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[850px] text-left text-xs">
                                    <thead className="border-y border-slate-100 text-[10px] tracking-wider text-slate-400 uppercase dark:border-slate-800">
                                        <tr>
                                            {[
                                                'Order',
                                                'Table / customer',
                                                'Items',
                                                'Amount',
                                                'Payment',
                                                'Status',
                                                'Action',
                                            ].map((heading) => (
                                                <th
                                                    key={heading}
                                                    className="px-3 py-3 font-medium"
                                                >
                                                    {heading}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {filteredLiveOrders.length === 0 && (
                                            <tr>
                                                <td
                                                    colSpan={7}
                                                    className="px-3 py-8 text-center text-slate-400"
                                                >
                                                    No active orders right now.
                                                </td>
                                            </tr>
                                        )}
                                        {filteredLiveOrders.map((order) => {
                                            const itemsSummary =
                                                orderItemsSummary(order);

                                            return (
                                                <tr
                                                    key={order.id}
                                                    className="group hover:bg-slate-50/70 dark:hover:bg-slate-800/30"
                                                >
                                                    <td className="px-3 py-3">
                                                        <p className="font-semibold text-slate-900 dark:text-white">
                                                            {order.order_number ||
                                                                `#ORD-${order.id}`}
                                                        </p>
                                                        <p className="mt-1 text-[10px] text-slate-400">
                                                            {formatRelativeTime(
                                                                order.created_at,
                                                            )}
                                                        </p>
                                                    </td>
                                                    <td className="px-3 py-3">
                                                        <p className="font-medium text-slate-800 dark:text-slate-200">
                                                            {order.table
                                                                ?.table_number ??
                                                                '—'}
                                                        </p>
                                                        <p className="mt-1 text-slate-400">
                                                            {order.customer
                                                                ?.name ??
                                                                'Walk-in guest'}
                                                        </p>
                                                    </td>
                                                    <td className="max-w-48 px-3 py-3">
                                                        <p className="truncate text-slate-600 dark:text-slate-300">
                                                            {itemsSummary.text}
                                                        </p>
                                                        <p className="mt-1 text-[10px] text-slate-400">
                                                            {
                                                                itemsSummary.quantity
                                                            }{' '}
                                                            item(s)
                                                        </p>
                                                    </td>
                                                    <td className="px-3 py-3 font-semibold text-slate-900 dark:text-white">
                                                        {money(order.total)}
                                                    </td>
                                                    <td className="px-3 py-3">
                                                        <StatusBadge
                                                            status={paymentLabel(
                                                                order.payment_status,
                                                            )}
                                                        />
                                                    </td>
                                                    <td className="px-3 py-3">
                                                        <StatusBadge
                                                            status={order.status}
                                                        />
                                                    </td>
                                                    <td className="px-3 py-3">
                                                        <div className="flex items-center gap-1">
                                                            {order.status ===
                                                                'Pending' && (
                                                                    <>
                                                                        <Button
                                                                            size="sm"
                                                                            className="h-7 bg-blue-600 px-2 text-[10px] hover:bg-blue-700"
                                                                            type="button"
                                                                            onClick={() =>
                                                                                updateOrderStatus(
                                                                                    order.id,
                                                                                    'Preparing',
                                                                                )
                                                                            }
                                                                        >
                                                                            Accept
                                                                        </Button>
                                                                        <Button
                                                                            size="sm"
                                                                            variant="ghost"
                                                                            className="h-7 px-2 text-[10px] text-red-500"
                                                                            type="button"
                                                                            onClick={() =>
                                                                                updateOrderStatus(
                                                                                    order.id,
                                                                                    'Cancelled',
                                                                                )
                                                                            }
                                                                        >
                                                                            Reject
                                                                        </Button>
                                                                    </>
                                                                )}
                                                            {order.status ===
                                                                'Preparing' && (
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline"
                                                                        className="h-7 px-2 text-[10px]"
                                                                        type="button"
                                                                        onClick={() =>
                                                                            updateOrderStatus(
                                                                                order.id,
                                                                                'Ready',
                                                                            )
                                                                        }
                                                                    >
                                                                        Mark ready
                                                                    </Button>
                                                                )}
                                                            {order.status ===
                                                                'Ready' && (
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline"
                                                                        className="h-7 px-2 text-[10px]"
                                                                        type="button"
                                                                        onClick={() =>
                                                                            updateOrderStatus(
                                                                                order.id,
                                                                                'Served',
                                                                            )
                                                                        }
                                                                    >
                                                                        Mark served
                                                                    </Button>
                                                                )}
                                                            <Button
                                                                size="icon"
                                                                variant="ghost"
                                                                className="size-7"
                                                                type="button"
                                                                aria-label="More actions"
                                                            >
                                                                <Ellipsis className="size-3.5" />
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
                        <Card className="border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
                            <CardHeader className="flex-row items-center justify-between space-y-0">
                                <div>
                                    <CardTitle className="text-base">
                                        Table status
                                    </CardTitle>
                                    <p className="mt-1 text-xs text-slate-500">
                                        QR table activity at a glance
                                    </p>
                                </div>
                                <Link href={create().url}>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="gap-1.5"
                                    >
                                        <Plus className="size-3.5" /> Add table
                                    </Button>
                                </Link>
                            </CardHeader>
                            <CardContent>
                                <div className="mb-4 flex flex-wrap gap-3 text-[10px] text-slate-500">
                                    {[
                                        'Available',
                                        'Order Requested',
                                        'Preparing',
                                        'Occupied',
                                    ].map((status) => (
                                        <span
                                            key={status}
                                            className="flex items-center gap-1.5"
                                        >
                                            <span
                                                className={cn(
                                                    'size-2 rounded-full',
                                                    status === 'Available'
                                                        ? 'bg-emerald-500'
                                                        : status ===
                                                            'Order Requested'
                                                            ? 'bg-amber-500'
                                                            : status ===
                                                                'Preparing'
                                                                ? 'bg-blue-500'
                                                                : 'bg-slate-500',
                                                )}
                                            />
                                            {status}
                                        </span>
                                    ))}
                                </div>
                                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                                    {tableStatuses.length === 0 && (
                                        <p className="col-span-full rounded-xl border border-dashed border-slate-200 p-6 text-center text-xs text-slate-500 dark:border-slate-700">
                                            No tables yet. Add tables from the
                                            Tables section to see live status
                                            here.
                                        </p>
                                    )}
                                    {tableStatuses.map((table) => (
                                        <button
                                            key={table.id}
                                            type="button"
                                            onClick={() =>
                                                setSelectedTable(
                                                    table.table_number,
                                                )
                                            }
                                            className={cn(
                                                'rounded-xl border p-3 text-left transition-all hover:-translate-y-0.5 hover:shadow-md',
                                                table.status === 'Available'
                                                    ? 'border-emerald-200 bg-emerald-50/60 dark:border-emerald-500/20 dark:bg-emerald-500/5'
                                                    : table.status ===
                                                        'Order Requested'
                                                        ? 'border-amber-200 bg-amber-50/60 dark:border-amber-500/20 dark:bg-amber-500/5'
                                                        : table.status ===
                                                            'Preparing'
                                                            ? 'border-blue-200 bg-blue-50/60 dark:border-blue-500/20 dark:bg-blue-500/5'
                                                            : 'border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50',
                                            )}
                                        >
                                            <div className="flex items-center justify-between">
                                                <Table2 className="size-4 text-slate-500" />
                                            </div>
                                            <p className="mt-3 text-sm font-bold text-slate-900 dark:text-white">
                                                {table.table_number}
                                            </p>
                                            <p className="mt-1 text-[10px] font-medium text-slate-500">
                                                {table.status}
                                            </p>
                                            {table.amount > 0 && (
                                                <p className="mt-2 text-xs font-semibold text-blue-600">
                                                    {money(table.amount)}
                                                </p>
                                            )}
                                        </button>
                                    ))}
                                </div>
                                {selectedTable && (
                                    <div className="mt-4 flex items-center justify-between rounded-xl bg-blue-50 p-3 text-xs dark:bg-blue-500/10">
                                        <span>
                                            <strong>{selectedTable}</strong>{' '}
                                            selected · QR code active · current
                                            order attached
                                        </span>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() =>
                                                setSelectedTable(null)
                                            }
                                        >
                                            Mark available
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
                            <CardHeader className="flex-row items-center justify-between space-y-0">
                                <div>
                                    <CardTitle className="text-base">Popular food items</CardTitle>
                                    <p className="mt-1 text-xs text-slate-500">
                                        Most ordered this month
                                    </p>
                                </div>
                                <Flame className="size-4 text-orange-500" />
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {popularItems.length === 0 && (
                                    <p className="text-center text-xs text-slate-400 py-4">
                                        No orders recorded yet this month.
                                    </p>
                                )}

                                {(() => {
                                    const maxOrders = Math.max(...popularItems.map((i) => i.orders), 1);

                                    return popularItems.map((item, index) => (
                                        <div key={item.name}>
                                            <div className="mb-1.5 flex items-center justify-between text-xs">
                                                <span className="font-medium text-slate-700 dark:text-slate-200">
                                                    {index + 1}. {item.name}
                                                </span>
                                                <span className="text-slate-400">
                                                    {item.orders} {item.orders === 1 ? 'order' : 'orders'}
                                                </span>
                                            </div>
                                            <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                                                <div
                                                    className={cn(
                                                        'h-full rounded-full transition-all duration-500',
                                                        progressColors[index % progressColors.length],
                                                    )}
                                                    style={{
                                                        width: `${(item.orders / maxOrders) * 100}%`,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    ));
                                })()}
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.6fr)]">
                        <Card className="border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
                            <CardHeader className="flex-row items-center justify-between space-y-0">
                                <div>
                                    <CardTitle className="text-base">
                                        Recent orders
                                    </CardTitle>
                                    <p className="mt-1 text-xs text-slate-500">
                                        Latest customer activity
                                    </p>
                                </div>
                                <Link href={index().url}>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-xs text-blue-600"
                                    >
                                        View all
                                    </Button>
                                </Link>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {recentOrders.length === 0 && (
                                        <p className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-xs text-slate-500 dark:border-slate-700">
                                            No orders yet.
                                        </p>
                                    )}
                                    {recentOrders.map((order) => (
                                        <div
                                            key={order.id}
                                            className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 dark:border-slate-800"
                                        >
                                            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300">
                                                <ShoppingBag className="size-4" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center justify-between gap-2">
                                                    <p className="text-xs font-semibold text-slate-900 dark:text-white">
                                                        {order.order_number ||
                                                            `#ORD-${order.id}`}
                                                    </p>
                                                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                                                        {money(order.total)}
                                                    </p>
                                                </div>
                                                <p className="mt-1 truncate text-[11px] text-slate-500">
                                                    {order.customer?.name ??
                                                        'Walk-in guest'}
                                                    {order.table?.table_number
                                                        ? ` · ${order.table.table_number}`
                                                        : ''}
                                                </p>
                                            </div>
                                            <StatusBadge status={order.status} />
                                            {(order.payment_status === 'paid' || order.status === 'Served') && (
                                                <AdminBillPrintButton order={order} />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1">
                            <Card className="border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base">
                                        Customer activity
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="grid grid-cols-2 gap-3">
                                    {[
                                        ['Today', '72'],
                                        ['New', '18'],
                                        ['Returning', '41'],
                                        ['Guest', '13'],
                                    ].map(([label, value]) => (
                                        <div
                                            key={label}
                                            className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800/60"
                                        >
                                            <p className="text-[11px] text-slate-500">
                                                {label}
                                            </p>
                                            <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
                                                {value}
                                            </p>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                            <Card className="border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
                                <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
                                    <CardTitle className="text-base">
                                        Notifications
                                    </CardTitle>
                                    <Badge className="rounded-full bg-blue-600">
                                        4 new
                                    </Badge>
                                </CardHeader>
                                <CardContent className="space-y-3 text-xs">
                                    {[
                                        [
                                            'New order #1048',
                                            '2 min ago',
                                            'bg-blue-500',
                                        ],
                                        [
                                            'Payment pending at T-08',
                                            '5 min ago',
                                            'bg-amber-500',
                                        ],
                                        [
                                            'Low stock: Mozzarella',
                                            '18 min ago',
                                            'bg-red-500',
                                        ],
                                        [
                                            'Order #1045 completed',
                                            '26 min ago',
                                            'bg-emerald-500',
                                        ],
                                    ].map(([title, time, color]) => (
                                        <div
                                            key={title}
                                            className="flex gap-2.5"
                                        >
                                            <span
                                                className={cn(
                                                    'mt-1.5 size-2 shrink-0 rounded-full',
                                                    color,
                                                )}
                                            />
                                            <div>
                                                <p className="font-medium text-slate-700 dark:text-slate-200">
                                                    {title}
                                                </p>
                                                <p className="mt-0.5 text-[10px] text-slate-400">
                                                    {time}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        </div>
                    </div>


                </main>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};
