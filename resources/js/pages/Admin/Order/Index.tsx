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

import AdminOrderComposer from '@/components/AdminOrderComposer';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { DataTable } from '@/components/data-table';
import { columns } from './columns';
import Pagination from '@/components/Pagination';
import OrderDetail from '@/components/Admin/OrderUser/OrderDetail';
import AdminBillReceipt from '@/components/Admin/OrderUser/AdminBillReceipt';

import { updateStatus } from '@/actions/App/Http/Controllers/OrderController';
import userOrders from '@/routes/admin/userOrders';
import { orderBillStatus } from '@/routes/admin';

import type { OrderUser } from '@/types/admin/Order';
import type { PaginatedData } from '@/types';
import type { OfficeSetting } from '@/types/admin/OfficeSetting';

import { cn } from '@/lib/utils';
import { Money } from '@/Utils/Money';

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
    officeSetting: OfficeSetting;
}



const STATUS_STYLES: Record<string, string> = {
    Pending: 'border-amber-200 bg-amber-50 text-amber-700',
    Preparing: 'border-indigo-200 bg-indigo-50 text-indigo-700',
    Ready: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    Served: 'border-slate-200 bg-slate-100 text-slate-600',
    Cancelled: 'border-rose-200 bg-rose-50 text-rose-700',
};

const orderTypeLabel = (type: OrderUser['order_type']): string =>
    (type ?? 'dine_in')
        .replace('_', ' ')
        .replace(/\b\w/g, (letter) => letter.toUpperCase());

export default function Index({
    orderUsers,
    orderStatuses,
    filters,
    stats,
    orderTables,
    orderFoodItems,
    orderCustomers,
    officeSetting,
}: OrderProps) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedStatus, setSelectedStatus] = useState<string>(
        filters.status || 'all',
    );
  

    const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
    const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);
    const [selectedBillOrderId, setSelectedBillOrderId] = useState<number | null>(null);

    const [paymentStatus, setPaymentStatus] = useState<string>('paid');
    const [paymentMethod, setPaymentMethod] = useState<string>('cash_at_reception');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isFirstRender = useRef(true);

    const selectedOrder = useMemo(
        () => orderUsers.data.find((order) => order.id === selectedOrderId) ?? null,
        [orderUsers, selectedOrderId],
    );

    const selectedBillOrder = useMemo(
        () => orderUsers.data.find((order) => order.id === selectedBillOrderId) ?? null,
        [orderUsers, selectedBillOrderId],
    );

    // Triggered when user clicks "Print Bill"
    const handleInitiatePrintBill = (order: OrderUser) => {
        if (order.payment_status === 'paid' && order.updated_by !== null) {
            setSelectedBillOrderId(order.id);
            return;
        }
        setUpdatingOrderId(order.id);
        setPaymentStatus(order.payment_status || 'paid');
        setPaymentMethod(order.payment_method || 'cash_at_reception');
    };

    // Submits payment updates and then triggers the bill receipt
    const handleSaveAndPrintBill = () => {
        if (!updatingOrderId) return;
        setIsSubmitting(true);

        router.patch(
            orderBillStatus(updatingOrderId),
            {
                payment_status: paymentStatus,
                payment_method: paymentMethod,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setIsSubmitting(false);
                    const currentId = updatingOrderId;
                    setUpdatingOrderId(null);
                    setSelectedBillOrderId(currentId);
                },
                onError: () => {
                    setIsSubmitting(false);
                },
            },
        );
    };

    const orderColumns = useMemo(
        () =>
            columns(
                (order) => setSelectedOrderId(order.id),
                handleInitiatePrintBill,
            ),
        [],
    );

    // Filter and search query handler using Wayfinder route builder
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        const timer = setTimeout(() => {
            router.get(
                userOrders.index({
                    query: {
                        search: searchTerm,
                        status: selectedStatus,
                       
                    },
                }).url,
                {},
                { preserveState: true, replace: true },
            );
        }, 300);

        return () => clearTimeout(timer);
    }, [searchTerm, selectedStatus]);

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
                {/* Header Section */}
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
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

                {/* KPI Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {kpis.map((kpi) => {
                        const IconComponent = kpi.icon;
                        return (
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
                                    <IconComponent className="size-5" />
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
                        );
                    })}
                </div>

                {/* Search & Filters */}
                <div className="space-y-4 rounded-xl border bg-card p-4 shadow-sm">
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 xl:pb-0">
                            <StatusFilterButton
                                active={selectedStatus === 'all'}
                                onClick={() => setSelectedStatus('all')}
                            >
                                All
                            </StatusFilterButton>
                            {Object.entries(orderStatuses).map(([value, label]) => (
                                <StatusFilterButton
                                    key={value}
                                    active={selectedStatus === value}
                                    onClick={() => setSelectedStatus(value)}
                                    dot={STATUS_STYLES[value]
                                        ?.split(' ')
                                        .find((token) => token.startsWith('text-'))}
                                >
                                    {label}
                                </StatusFilterButton>
                            ))}
                        </div>

                        <div className="relative w-full xl:w-80">
                            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search order ID or customer..."
                                value={searchTerm}
                                onChange={(event) => setSearchTerm(event.target.value)}
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

                            
                </div>

                {/* Table Data Section */}
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

            {/* Order Details Drawer / Modal */}
            <OrderDetail
                selectedOrder={selectedOrder}
                setSelectedOrderId={setSelectedOrderId}
                statusStyles={STATUS_STYLES}
                orderTypeLabel={orderTypeLabel}
            />

            {/* STEP 1: Update Payment Modal */}
            <Dialog
                open={updatingOrderId !== null}
                onOpenChange={(open) => !open && setUpdatingOrderId(null)}
            >
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Update Payment Information</DialogTitle>
                        <DialogDescription>
                            Select the payment status and method before generating the receipt bill.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-2">
                        <div className="grid gap-2">
                            <Label htmlFor="payment_status">Payment Status</Label>
                            <Select
                                value={paymentStatus}
                                onValueChange={setPaymentStatus}
                            >
                                <SelectTrigger id="payment_status">
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="paid">Paid</SelectItem>
                                    <SelectItem value="unpaid">Unpaid</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="payment_method">Payment Method</Label>
                            <Select
                                value={paymentMethod}
                                onValueChange={setPaymentMethod}
                            >
                                <SelectTrigger id="payment_method">
                                    <SelectValue placeholder="Select method" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="cash_at_reception">Cash</SelectItem>
                                    <SelectItem value="card">Card / POS</SelectItem>
                                    <SelectItem value="esewa">eSewa</SelectItem>
                                    <SelectItem value="khalti">Khalti</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setUpdatingOrderId(null)}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSaveAndPrintBill}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Saving...' : 'Save & Print Bill'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* STEP 2: Bill Receipt Modal */}
            <Dialog
                open={selectedBillOrderId !== null}
                onOpenChange={(open) => !open && setSelectedBillOrderId(null)}
            >
                <DialogContent className="flex max-h-[90vh] max-w-sm flex-col items-center overflow-y-auto">
                    <AdminBillReceipt
                        order={selectedBillOrder}
                        officeSetting={officeSetting}
                    />
                </DialogContent>
            </Dialog>
        </>
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