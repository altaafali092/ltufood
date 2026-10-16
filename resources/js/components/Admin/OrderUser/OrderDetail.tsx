import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { Money } from '@/Utils/Money';
import { OrderUser } from '@/types/admin/Order';


interface OrderDetailProps {
    selectedOrder: OrderUser | null;
    setSelectedOrderId: (id: number | null) => void;
    statusStyles: Record<string, string>;
    orderTypeLabel: (type: OrderUser['order_type']) => string;
}

export default function OrderDetail({
    selectedOrder,
    setSelectedOrderId,
    statusStyles,
    orderTypeLabel,
}: OrderDetailProps) {
    return (
        <Dialog
            open={selectedOrder !== null}
            onOpenChange={(open) => {
                if (!open) {
                    setSelectedOrderId(null);
                }
            }}
        >
            {selectedOrder && (
                <DialogContent className="max-h-[90vh] lg:max-w-xl overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-3">
                            <span>
                                Order{' '}
                                {selectedOrder.order_number ||
                                    `#${selectedOrder.id}`}
                            </span>
                            <Badge
                                variant="outline"
                                className={cn(
                                    'rounded-full',
                                    statusStyles[selectedOrder.status] ?? 'border-border bg-muted',
                                )}
                            >
                                {selectedOrder.status}
                            </Badge>
                        </DialogTitle>
                        <DialogDescription>
                            {selectedOrder.created_at
                                ? new Date(
                                    selectedOrder.created_at,
                                ).toLocaleString()
                                : 'Order details'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-5">
                        <div className="grid gap-4 rounded-lg border p-4 sm:grid-cols-2">
                            <DetailRow
                                label="Customer"
                                value={
                                    selectedOrder.customer?.name ??
                                    'Walk-in customer'
                                }
                            />
                            <DetailRow
                                label="Phone"
                                value={
                                    selectedOrder.customer?.phone ??
                                    'Not provided'
                                }
                            />
                            <DetailRow
                                label="Order type"
                                value={orderTypeLabel(
                                    selectedOrder.order_type,
                                )}
                            />
                            <DetailRow
                                label="Table"
                                value={
                                    selectedOrder.table?.table_number
                                        ? `${selectedOrder.table.table_number}`
                                        : 'Not assigned'
                                }
                            />
                            <DetailRow
                                label="Payment method"
                                value={
                                    selectedOrder.payment_method
                                        ?.replace(/_/g, ' ')
                                        .replace(
                                            /\b\w/g,
                                            (letter: string) =>
                                                letter.toUpperCase(),
                                        ) ?? 'Not provided'
                                }
                            />
                            <DetailRow 
                            
                                label="Payment status"
                                value={selectedOrder.payment_status}
                            />
                        </div>

                        <div>
                            <h3 className="mb-3 text-sm font-semibold">
                                Items
                            </h3>
                            <div className="divide-y rounded-lg border">
                                {selectedOrder.items?.length ? (
                                    selectedOrder.items.map((item) => (
                                        <div
                                            key={item.id}
                                            className="flex items-center justify-between gap-4 p-3 text-sm"
                                        >
                                            <div className="min-w-0">
                                                <p className="truncate font-medium">
                                                    {item.food_item
                                                        ?.title ??
                                                        'Food item'}
                                                </p>
                                                <p className="text-muted-foreground">
                                                    {item.quantity} ×{' '}
                                                    {Money(
                                                        item.price_at_time,
                                                    )}
                                                </p>

                                            </div>
                                            <span className="font-medium">
                                                {Money(item.total_price)}
                                            </span>

                                        </div>

                                    ))
                                ) : (
                                    <p className="p-4 text-sm text-muted-foreground">
                                        No item details available.
                                    </p>
                                )}
                            </div>

                        </div>
                        {selectedOrder.notes !== null && (
                            <div>
                                <h3 className="mb-3 text-sm font-semibold">
                                    Note
                                </h3>
                                <div className="divide-y rounded-lg border border-rose-500">
                                    <p className='m-2 text-sm italic'> {selectedOrder.notes}</p>
                                </div>

                            </div>
                        )}

                        <div className="space-y-2 rounded-lg border p-4 text-sm">
                            <OrderTotal
                                label="Subtotal"
                                value={selectedOrder.subtotal}
                            />
                            <OrderTotal
                                label="Discount"
                                value={-selectedOrder.discount_amount}
                            />
                            <OrderTotal
                                label="Tax"
                                value={selectedOrder.tax_amount}
                            />
                            <div className="border-t pt-2">
                                <OrderTotal
                                    label="Total"
                                    value={selectedOrder.total}
                                    emphasized
                                />
                            </div>
                        </div>
                    </div>
                </DialogContent>
            )}
        </Dialog>
    );
}

function DetailRow({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <span className="text-xs text-muted-foreground">{label}</span>
            <p className="font-medium capitalize">{value}</p>
        </div>
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