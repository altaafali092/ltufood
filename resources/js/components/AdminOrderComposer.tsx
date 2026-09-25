import { useMemo, useState } from 'react';
import { router } from '@inertiajs/react';
import { CheckCircle2, CloudOff, LoaderCircle, Plus, RefreshCw, Wifi } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    type AdminOrderPayload,
    type QueuedAdminOrder,
    useOfflineAdminOrders,
} from '@/hooks/use-offline-admin-orders';

type TableOption = { id: number; table_number: string };
type FoodOption = { id: number; title: string; price: number };
type CustomerOption = { id: number; name: string; phone?: string | null; email: string };

type Props = {
    tables: TableOption[];
    foodItems: FoodOption[];
    customers: CustomerOption[];
};

type DraftItem = { food_item_id: number; quantity: number };

const makeUuid = () => crypto.randomUUID();

export default function AdminOrderComposer({ tables, foodItems, customers }: Props) {
    const [open, setOpen] = useState(false);
    const [tableId, setTableId] = useState('');
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [customerId, setCustomerId] = useState('');
    const [items, setItems] = useState<DraftItem[]>([]);
    const [error, setError] = useState<string | null>(null);
    const { orders, online, syncing, syncProgress, syncNow, queueOrder } = useOfflineAdminOrders();

    const total = useMemo(() => items.reduce((sum, item) => {
        const food = foodItems.find((option) => option.id === item.food_item_id);
        return sum + (food ? Number(food.price) * item.quantity : 0);
    }, 0), [foodItems, items]);
    const tableName = (tableId: number) => tables.find((table) => table.id === tableId)?.table_number ?? `#${tableId}`;

    const reset = () => {
        setTableId('');
        setCustomerName('');
        setCustomerPhone('');
        setCustomerId('');
        setItems([]);
        setError(null);
    };

    const addItem = () => {
        const firstAvailable = foodItems.find((food) => !items.some((item) => item.food_item_id === food.id));
        if (firstAvailable) setItems([...items, { food_item_id: firstAvailable.id, quantity: 1 }]);
    };

    const updateItem = (index: number, patch: Partial<DraftItem>) => {
        setItems(items.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item));
    };

    const submit = async () => {
        if (!tableId || items.length === 0 || total <= 0) {
            setError('Select a table and at least one food item.');
            return;
        }

        const payload: AdminOrderPayload = {
            client_uuid: makeUuid(),
            table_id: Number(tableId),
            customer_id: customerId ? Number(customerId) : null,
            customer_name: customerName || undefined,
            customer_phone: customerPhone || undefined,
            order_type: 'dine_in',
            payment_method: 'cash_at_reception',
            subtotal: Number(total.toFixed(2)),
            total: Number(total.toFixed(2)),
            items: items.map((item) => ({
                ...item,
                price: Number(foodItems.find((food) => food.id === item.food_item_id)?.price ?? 0),
            })),
        };

        await queueOrder(payload);
        setOpen(false);
        reset();
        if (navigator.onLine) await syncNow();
        router.reload({ only: ['orderUsers', 'stats', 'orderTables'] });
    };

    return (
        <>
            <div className="flex flex-wrap items-center gap-2">
                <div className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
                    online ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                }`}>
                    {online ? <Wifi className="size-3.5" /> : <CloudOff className="size-3.5" />}
                    {online ? 'Online' : 'Offline'}
                </div>
                {orders.length > 0 && (
                    <button
                        type="button"
                        onClick={() => void syncNow()}
                        disabled={!online || syncing}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 disabled:opacity-50"
                    >
                        {syncing ? <LoaderCircle className="size-3.5 animate-spin" /> : <RefreshCw className="size-3.5" />}
                        {syncing ? `Syncing ${syncProgress.current}/${syncProgress.total}` : orders.some((order) => order.status === 'failed') ? 'Retry failed' : `Sync ${orders.length}`}
                    </button>
                )}
                <Button onClick={() => setOpen(true)} className="gap-2 bg-emerald-600 text-white hover:bg-emerald-700">
                    <Plus className="size-4" />
                    New Manual Order
                </Button>
            </div>

            {orders.length > 0 && (
                <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                    <div className="flex items-center justify-between">
                        <strong>{orders.length} order{orders.length === 1 ? '' : 's'} waiting to sync</strong>
                        <span>{orders.filter((order) => order.status === 'failed').length} failed</span>
                    </div>
                    <div className="mt-2 space-y-1 text-xs">
                        {orders.slice(0, 3).map((order: QueuedAdminOrder) => (
                            <div key={order.id} className="flex justify-between gap-4">
                                <span>{order.payload.customer_name || 'Walk-in customer'} · Table {tableName(order.payload.table_id)}</span>
                                <span className={order.status === 'failed' ? 'text-rose-700' : ''}>{order.error || order.status}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <Dialog open={open} onOpenChange={(value) => { if (!value) reset(); setOpen(value); }}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Create manual order</DialogTitle>
                        <DialogDescription>
                            This order uses the same tables, menu prices, Order, and OrderItem rules as QR orders.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-2">
                        {!online && (
                            <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
                                You are offline. The order will be saved securely in this browser and synced automatically when connection returns.
                            </div>
                        )}
                        {error && <div className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</div>}
                        <label className="grid gap-1 text-sm font-medium">
                            Table
                            <select value={tableId} onChange={(event) => setTableId(event.target.value)} className="rounded-lg border p-2">
                                <option value="">Select table</option>
                                {tables.map((table) => <option key={table.id} value={table.id}>Table {table.table_number}</option>)}
                            </select>
                        </label>
                        <div className="grid gap-3 sm:grid-cols-3">
                            <label className="grid gap-1 text-sm font-medium">
                                Existing customer
                                <select value={customerId} onChange={(event) => {
                                    const selected = customers.find((customer) => customer.id === Number(event.target.value));
                                    setCustomerId(event.target.value);
                                    if (selected) {
                                        setCustomerName(selected.name);
                                        setCustomerPhone(selected.phone ?? '');
                                    }
                                }} className="rounded-lg border p-2">
                                    <option value="">Walk-in customer</option>
                                    {customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.name}</option>)}
                                </select>
                            </label>
                            <label className="grid gap-1 text-sm font-medium">
                                Customer name
                                <input value={customerName} onChange={(event) => setCustomerName(event.target.value)} className="rounded-lg border p-2" placeholder="Walk-in customer" />
                            </label>
                            <label className="grid gap-1 text-sm font-medium">
                                Phone
                                <input value={customerPhone} onChange={(event) => setCustomerPhone(event.target.value)} className="rounded-lg border p-2" placeholder="Optional" />
                            </label>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-semibold">Food items</span>
                                <button type="button" onClick={addItem} className="text-xs font-semibold text-emerald-700">+ Add item</button>
                            </div>
                            {items.map((item, index) => (
                                <div key={`${item.food_item_id}-${index}`} className="grid grid-cols-[1fr_90px_auto] items-center gap-2">
                                    <select value={item.food_item_id} onChange={(event) => updateItem(index, { food_item_id: Number(event.target.value) })} className="rounded-lg border p-2 text-sm">
                                        {foodItems.map((food) => <option key={food.id} value={food.id}>{food.title} · NPR {Number(food.price).toFixed(2)}</option>)}
                                    </select>
                                    <input type="number" min={1} value={item.quantity} onChange={(event) => updateItem(index, { quantity: Math.max(1, Number(event.target.value)) })} className="rounded-lg border p-2 text-sm" />
                                    <button type="button" onClick={() => setItems(items.filter((_, itemIndex) => itemIndex !== index))} className="text-xs text-rose-600">Remove</button>
                                </div>
                            ))}
                            {items.length === 0 && <p className="rounded-lg bg-slate-50 p-4 text-center text-sm text-slate-500">Add food items to build the order.</p>}
                        </div>
                        <div className="flex justify-between border-t pt-3 text-lg font-bold">
                            <span>Total</span>
                            <span>NPR {total.toFixed(2)}</span>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                        <Button type="button" onClick={() => void submit()} className="bg-emerald-600 text-white hover:bg-emerald-700">
                            {online ? <CheckCircle2 className="size-4" /> : <CloudOff className="size-4" />}
                            {online ? 'Save order' : 'Save offline'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
