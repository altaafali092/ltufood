import { Head, router } from '@inertiajs/react';
import {
    BadgeDollarSign,
    CheckCircle2,
    Clock3,
    LayoutList,
    Search,
    X,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

import AdminBillPrintButton from '@/components/AdminBillPrintButton';
import AdminOrderComposer from '@/components/AdminOrderComposer';
import AdminOrderKitchenTicketButton from '@/components/AdminOrderKitchenTicketButton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { useOfflineAdminOrders } from '@/hooks/use-offline-admin-orders';
import { cn } from '@/lib/utils';
import { orderStatus } from '@/routes/admin';
import userOrders from '@/routes/admin/userOrders';
import type { OrderUser } from '@/types/admin/Order';
import { DataTable } from '@/components/data-table';
import { columns } from './columns';
import { PaginatedData } from '@/types';
import { Money } from '@/Utils/Money';
import Pagination from '@/components/Pagination';
import OrderDetail from '@/components/Admin/OrderUser/OrderDetail';
import AdminBillReceipt from '@/components/Admin/OrderUser/AdminBillReceipt';
import { OfficeSetting } from '@/types/admin/OfficeSetting';

interface StatsProps {
    totalOrders: number;
    pendingOrders: number;
    completedOrders: number;
    totalRevenue: number;
}

interface OrderProps {
    orderUsers: PaginatedData<OrderUser>;
    orderStatuses: Record<string, string>;
    filters: {
        search: string;
        status: string;
        date: string;
    };
    stats: StatsProps;
    orderTables: Array<{ id: number; table_number: string }>;
    orderFoodItems: Array<{ id: number; title: string; price: number }>;
    orderCustomers: Array<{
        id: number;
        name: string;
        phone?: string | null;
        email: string;
    }>;
    officeSetting: OfficeSetting
}

type DateFilter = 'all' | 'today' | 'yesterday' | 'week';

const DATE_FILTERS: Array<{ value: DateFilter; label: string }> = [
    { value: 'all', label: 'All time' },
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'week', label: 'This Week' },
];

const STATUS_STYLES: Record<string, string> = {
    Pending: 'border-amber-200 bg-amber-50 text-amber-700',
    Preparing: 'border-indigo-200 bg-indigo-50 text-indigo-700',
    Ready: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    Served: 'border-slate-200 bg-slate-100 text-slate-600',
    Cancelled: 'border-rose-200 bg-rose-50 text-rose-700',
};

const PAYMENT_STYLES: Record<string, string> = {
    paid: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    unpaid: 'border-amber-200 bg-amber-50 text-amber-700',
    failed: 'border-rose-200 bg-rose-50 text-rose-700',
    refunded: 'border-slate-200 bg-slate-100 text-slate-600',
};

const orderTypeLabel = (type: OrderUser['order_type']): string =>
    (type ?? 'dine_in')
        .replace('_', ' ')
        .replace(/\b\w/g, (letter) => letter.toUpperCase());

const shortOrderId = (order: OrderUser): string => {
    if (!order.order_number) {
        return `#${String(order.id).padStart(4, '0')}`;
    }

    const segment = order.order_number.split('-').pop() ?? order.order_number;

    return `#${segment.toUpperCase()}`;
};

export default function Index({
    orderUsers,
    orderStatuses,
    filters,
    stats,
    orderTables,
    orderFoodItems,
    orderCustomers,
    officeSetting
}: OrderProps) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedStatus, setSelectedStatus] = useState<string>(
        filters.status || 'all',
    );
    const [selectedDate, setSelectedDate] = useState<DateFilter>(
        (filters.date as DateFilter) || 'all',
    );
    const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
    const [selectedBillOrderId, setSelectedBillOrderId] = useState<number | null>(null);



    const { online, orders: queuedOrders } = useOfflineAdminOrders();

    const isFirstRender = useRef(true);

    const selectedOrder = useMemo(
        () =>
            orderUsers.data.find((order) => order.id === selectedOrderId) ??
            null,
        [orderUsers, selectedOrderId],
    );

    const selectedBillOrder = useMemo(
        () => orderUsers.data.find((order) => order.id === selectedBillOrderId) ?? null,
        [orderUsers, selectedBillOrderId],
    );

    const orderColumns = useMemo(
        () =>
            columns(
                (order) => setSelectedOrderId(order.id),
                (order) => setSelectedBillOrderId(order.id)
            ),
        [],
    );



    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;

            return;
        }

        const timer = setTimeout(() => {
            router.get(
                userOrders.index().url,
                {
                    search: searchTerm,
                    status: selectedStatus,
                    date: selectedDate,
                },
                { preserveState: true, replace: true },
            );
        }, 300);

        return () => clearTimeout(timer);
    }, [searchTerm, selectedStatus, selectedDate]);

    const handleStatusChange = (orderId: number, newStatus: string) => {
        router.patch(orderStatus(orderId), { status: newStatus });
    };

    const kpis = useMemo(
        () => [
            {
                label: 'Total Orders',
                value: stats.totalOrders.toLocaleString(),
                icon: LayoutList,
                tone: 'bg-slate-900 text-white',
                sub: 'All time',
            },
            {
                label: 'Pending',
                value: stats.pendingOrders.toLocaleString(),
                icon: Clock3,
                tone: 'bg-amber-100 text-amber-700',
                sub: 'Being prepared',
            },
            {
                label: 'Completed',
                value: stats.completedOrders.toLocaleString(),
                icon: CheckCircle2,
                tone: 'bg-emerald-100 text-emerald-700',
                sub: 'Served orders',
            },
            {
                label: 'Total Revenue',
                value: Money(stats.totalRevenue),
                icon: BadgeDollarSign,
                tone: 'bg-indigo-100 text-indigo-700',
                sub: 'Paid orders',
            },
        ],
        [stats],
    );

    return (
        <>
            <Head title="Orders" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 sm:p-6">
                {/* Top bar */}
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Orders
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Live restaurant orders, payments and kitchen status.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-end gap-3">
                        <AdminOrderComposer
                            tables={orderTables}
                            foodItems={orderFoodItems}
                            customers={orderCustomers}
                        />
                    </div>
                </div>

                {/* KPI cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {kpis.map((kpi) => (
                        <div
                            key={kpi.label}
                            className="flex items-center gap-4 rounded-xl border bg-card p-5 shadow-sm"
                        >
                            <span
                                className={cn(
                                    'flex size-11 shrink-0 items-center justify-center rounded-lg',
                                    kpi.tone,
                                )}
                            >
                                <kpi.icon className="size-5" />
                            </span>
                            <div className="min-w-0">
                                <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                    {kpi.label}
                                </p>
                                <p className="truncate text-2xl font-extrabold tracking-tight">
                                    {kpi.value}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {kpi.sub}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Filters */}
                <div className="space-y-4 rounded-xl border bg-card p-4 shadow-sm">
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 xl:pb-0">
                            <StatusFilterButton
                                active={selectedStatus === 'all'}
                                onClick={() => setSelectedStatus('all')}
                            >
                                All
                            </StatusFilterButton>
                            {Object.entries(orderStatuses).map(
                                ([value, label]) => (
                                    <StatusFilterButton
                                        key={value}
                                        active={selectedStatus === value}
                                        onClick={() => setSelectedStatus(value)}
                                        dot={STATUS_STYLES[value]
                                            ?.split(' ')
                                            .find((token) =>
                                                token.startsWith('text-'),
                                            )}
                                    >
                                        {label}
                                    </StatusFilterButton>
                                ),
                            )}
                        </div>

                        <div className="relative w-full xl:w-80">
                            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search order ID or customer..."
                                value={searchTerm}
                                onChange={(event) =>
                                    setSearchTerm(event.target.value)
                                }
                                className="h-9 w-full rounded-md border border-input bg-background pr-9 pl-9 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                            />
                            {searchTerm && (
                                <button
                                    type="button"
                                    onClick={() => setSearchTerm('')}
                                    aria-label="Clear search"
                                    className="absolute top-1/2 right-2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:text-foreground"
                                >
                                    <X className="size-3.5" />
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 border-t border-border/60 pt-3">
                        <span className="mr-1 text-xs font-medium text-muted-foreground">
                            Date
                        </span>
                        {DATE_FILTERS.map((filter) => (
                            <button
                                key={filter.value}
                                type="button"
                                onClick={() => setSelectedDate(filter.value)}
                                className={cn(
                                    'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                                    selectedDate === filter.value
                                        ? 'border-slate-900 bg-slate-900 text-white'
                                        : 'border-border bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                                )}
                            >
                                {filter.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex-1">
                    <div className="flex-1">
                        <div className="container mx-auto py-6">
                            <DataTable
                                columns={orderColumns}
                                data={orderUsers.data || []}
                            />
                            <Pagination links={orderUsers.links} />
                        </div>
                    </div>
                </div>
            </div>

            <OrderDetail
                selectedOrder={selectedOrder}
                setSelectedOrderId={setSelectedOrderId}
                statusStyles={STATUS_STYLES}
                orderTypeLabel={orderTypeLabel}
            />

            <Dialog
                open={selectedBillOrderId !== null}
                onOpenChange={(open) => !open && setSelectedBillOrderId(null)}
            >
                <DialogContent className="flex flex-col items-center max-w-sm overflow-y-auto max-h-[90vh]">
                    <AdminBillReceipt
                        order={selectedBillOrder}
                       officeSetting={officeSetting}
                    />
                </DialogContent>
            </Dialog>

        </>
    );
}



function OrderTotal({
    label,
    value,
    emphasized = false,
}: {
    label: string;
    value: number;
    emphasized?: boolean;
}) {
    return (
        <div
            className={cn(
                'flex justify-between',
                emphasized && 'text-base font-bold',
            )}
        >
            <span>{label}</span>
            <span>{Money(value)}</span>
        </div>
    );
}

function StatusFilterButton({
    active,
    onClick,
    children,
    dot,
}: {
    active: boolean;
    onClick: () => void;
    children: React.ReactNode;
    dot?: string;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                'inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-medium whitespace-nowrap transition-colors',
                active
                    ? 'border-slate-900 bg-slate-900 text-white'
                    : 'border-border bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground',
            )}
        >
            {dot && <span className={cn('size-2 rounded-full', dot)} />}
            {children}
        </button>
    );
}
