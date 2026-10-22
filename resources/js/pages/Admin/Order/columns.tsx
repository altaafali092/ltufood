import { ColumnDef } from '@tanstack/react-table';
import { router, usePage } from '@inertiajs/react';
import {
    Bike,
    CalendarDays,
    Clock,
    Eye,
    MoreHorizontal,
    Pencil,
    Printer,
    ShoppingBag,
    Trash2,
    UtensilsCrossed,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { OrderUser } from '@/types/admin/Order';
import { destroy } from '@/routes/admin/userOrders';
import { updateStatus } from '@/actions/App/Http/Controllers/OrderController';

const STATUS_STYLES: Record<string, string> = {
    pending:
        'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300',
    confirmed:
        'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300',
    processing:
        'border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-900 dark:bg-indigo-950 dark:text-indigo-300',
    completed:
        'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300',
    served: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300',
    cancelled:
        'border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300',
    delivered:
        'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300',
};

const formatStatus = (status: string) =>
    status.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());

const formatOrderType = (type: string) => {
    const labels: Record<string, string> = {
        dine_in: 'Dine In',
        takeaway: 'Takeaway',
        delivery: 'Delivery',
    };

    return labels[type?.toLowerCase()] ?? formatStatus(type || 'Dine In');
};

const getOrderIcon = (type: string) => {
    switch (type?.toLowerCase()) {
        case 'takeaway':
            return ShoppingBag;
        case 'delivery':
            return Bike;
        default:
            return UtensilsCrossed;
    }
};

export const columns = (
    onViewDetails: (order: OrderUser) => void,
    onPrintBills: (order: OrderUser) => void,
): ColumnDef<OrderUser>[] => [
    {
        accessorKey: 'id',
        header: 'Id',
        cell: ({ row }) => row.index + 1,
    },
    {
        accessorKey: 'order_number',
        header: 'Order',
        cell: ({ row }) => {
            const order = row.original;

            return (
                <div className="min-w-30 space-y-1">
                    <div className="font-mono text-sm font-semibold">
                        {order.order_number || `#${order.id}`}
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="size-3" />
                        {order.created_at
                            ? new Date(order.created_at).toLocaleTimeString()
                            : ''}
                    </div>
                </div>
            );
        },
    },

    {
        accessorKey: 'order_type',
        header: 'Table NO./Name',
        cell: ({ row }) => {
            const costumerName = row.original.customer?.name;
            const TableNumber = row.original.table?.table_number;
            const OrderIcon = getOrderIcon(TableNumber ?? '');

            return (
                <div className="flex items-center gap-2.5">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-muted/50 text-muted-foreground">
                        <OrderIcon className="size-4" />
                    </div>

                    <div className="space-y-1">
                        <div className="font-medium">
                            {formatOrderType(TableNumber ?? '')}
                        </div>

                        <div className="text-xs text-muted-foreground">
                            {costumerName}
                        </div>
                    </div>
                </div>
            );
        },
    },
    {
        accessorKey: 'status',
        header: 'Order Status',
        cell: ({ row }) => {
            const { orderStatuses } = usePage<{
                orderStatuses: Record<string, string>;
            }>().props;
            const order = row.original;
            const currentStatus = order.status;

            const handleStatusChange = (newStatus: string) => {
                if (newStatus === currentStatus) return;

                router.patch(
                    updateStatus(order.id),
                    { status: newStatus },
                    { preserveScroll: true },
                );
            };

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto p-0 hover:bg-transparent"
                        >
                            <Badge
                                variant="outline"
                                className="cursor-pointer px-2.5 py-1 font-medium"
                            >
                                {orderStatuses?.[currentStatus] ??
                                    currentStatus ??
                                    'Select Status'}
                            </Badge>
                        </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end">
                        {Object.entries(orderStatuses ?? {}).map(
                            ([value, label]) => (
                                <DropdownMenuItem
                                    key={value}
                                    onClick={() => handleStatusChange(value)}
                                    className={
                                        value === currentStatus
                                            ? 'bg-accent font-semibold'
                                            : ''
                                    }
                                >
                                    {label}
                                </DropdownMenuItem>
                            ),
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
    {
        accessorKey: 'payment_status',
        header: 'Payment Status',
        cell: ({ row }) => {
            const paymentStatus = row.original.payment_status;

            return (
                <Badge
                    className={
                        paymentStatus?.toLowerCase() === 'paid'
                            ? 'rounded-full border border-emerald-500 bg-green-100 text-green-700 hover:bg-green-100'
                            : 'rounded-full border border-red-400 bg-red-100 text-red-700 hover:bg-red-100'
                    }
                >
                    {paymentStatus?.toLowerCase() === 'paid'
                        ? 'Paid'
                        : 'Unpaid'}
                </Badge>
            );
        },
    },
    {
        accessorKey: 'created_at',
        header: 'Date',
        cell: ({ row }) => {
            const date = row.original.created_at;

            if (!date) {
                return <span className="text-muted-foreground">—</span>;
            }

            const parsedDate = new Date(date);

            if (Number.isNaN(parsedDate.getTime())) {
                return <span className="text-muted-foreground">—</span>;
            }

            return (
                <div className="flex items-start gap-2">
                    <CalendarDays className="mt-0.5 size-4 text-muted-foreground" />

                    <div className="space-y-1">
                        <div className="text-sm font-medium">
                            {parsedDate.toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                            })}
                        </div>
                    </div>
                </div>
            );
        },
    },

    {
        id: 'actions',
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => {
            const order = row.original;

            return (
                <div className="flex items-center justify-end gap-1">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="gap-2"
                        title="view Detail"
                        onClick={() => onViewDetails(order)}
                    >
                        <Eye className="size-4" />
                    </Button>
                    {order.status == 'Served' && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="gap-2"
                            title="Print Bill"
                            onClick={() => onPrintBills(order)}
                        >
                            <Printer className="size-4" />
                        </Button>
                    )}

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="size-8"
                                aria-label="Order actions"
                            >
                                <MoreHorizontal className="size-4" />
                            </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end" className="w-44">
                            {/* <DropdownMenuItem
                                    onSelect={() => onViewDetails(order)}
                                >
                                    <Eye className="mr-2 size-4" />
                                    View details
                                </DropdownMenuItem> */}

                            <DropdownMenuSeparator />

                            <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onSelect={() => {
                                    if (
                                        confirm(
                                            'Are you sure you want to delete this order?',
                                        )
                                    ) {
                                        router.delete(destroy(order.id).url, {
                                            preserveScroll: true,
                                        });
                                    }
                                }}
                            >
                                <Trash2 className="mr-2 size-4" />
                                Delete order
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            );
        },
    },
];
