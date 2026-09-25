import { useCallback, useEffect, useState } from 'react';
import userOrders from '@/routes/admin/userOrders';

export type AdminOrderPayload = {
    client_uuid: string;
    table_id: number;
    customer_id?: number | null;
    customer_name?: string;
    customer_phone?: string;
    order_type: 'dine_in' | 'takeaway' | 'delivery';
    payment_method?: 'cash_at_reception' | 'esewa' | 'card' | 'khalti';
    notes?: string;
    subtotal: number;
    total: number;
    items: Array<{ food_item_id: number; quantity: number; price: number }>;
};

export type QueuedAdminOrder = {
    id: string;
    payload: AdminOrderPayload;
    status: 'pending' | 'syncing' | 'failed';
    error?: string;
    createdAt: number;
};

const DB_NAME = 'ltufood-admin-orders';
const STORE_NAME = 'orders';
const DB_VERSION = 1;

const openDatabase = (): Promise<IDBDatabase> => new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE_NAME, { keyPath: 'id' });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
});

const allQueuedOrders = async (): Promise<QueuedAdminOrder[]> => {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
        const request = db.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME).getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
};

const saveQueuedOrder = async (order: QueuedAdminOrder): Promise<void> => {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
        const request = db.transaction(STORE_NAME, 'readwrite').objectStore(STORE_NAME).put(order);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
};

const deleteQueuedOrder = async (id: string): Promise<void> => {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
        const request = db.transaction(STORE_NAME, 'readwrite').objectStore(STORE_NAME).delete(id);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
};

const csrfToken = (): string => {
    const value = document.cookie.split('; ').find((cookie) => cookie.startsWith('XSRF-TOKEN='));
    return value ? decodeURIComponent(value.split('=').slice(1).join('=')) : '';
};

const syncOrder = async (order: QueuedAdminOrder): Promise<void> => {
    await saveQueuedOrder({ ...order, status: 'syncing', error: undefined });

    try {
        const response = await fetch(userOrders.sync().url, {
            method: 'POST',
            credentials: 'same-origin',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                'X-XSRF-TOKEN': csrfToken(),
            },
            body: JSON.stringify(order.payload),
        });

        if (!response.ok) {
            const body = await response.json().catch(() => ({}));
            const firstError = Object.values(body.errors ?? {})[0];
            const message = Array.isArray(firstError) ? firstError[0] : firstError;
            throw new Error(
                message
                ?? body.message
                ?? `The order could not be synchronized (HTTP ${response.status}).`,
            );
        }

        await deleteQueuedOrder(order.id);
    } catch (error) {
        await saveQueuedOrder({
            ...order,
            status: 'failed',
            error: error instanceof Error ? error.message : 'The order could not be synchronized.',
        });
        throw error;
    }
};

export function useOfflineAdminOrders() {
    const [orders, setOrders] = useState<QueuedAdminOrder[]>([]);
    const [online, setOnline] = useState(() => navigator.onLine);
    const [syncing, setSyncing] = useState(false);
    const [syncProgress, setSyncProgress] = useState({ current: 0, total: 0 });

    const refresh = useCallback(async () => {
        setOrders(await allQueuedOrders());
    }, []);

    const syncNow = useCallback(async () => {
        if (!navigator.onLine) return;
        setSyncing(true);
        try {
            const queued = await allQueuedOrders();
            setSyncProgress({ current: 0, total: queued.length });

            for (const [index, order] of queued.entries()) {
                try {
                    await syncOrder(order);
                } catch {
                    // Keep failed orders in IndexedDB for retry and display.
                }
                setSyncProgress({ current: index + 1, total: queued.length });
            }

            await refresh();
        } finally {
            setSyncing(false);
        }
    }, [refresh]);

    const queueOrder = useCallback(async (payload: AdminOrderPayload) => {
        await saveQueuedOrder({
            id: payload.client_uuid,
            payload,
            status: 'pending',
            createdAt: Date.now(),
        });
        await refresh();
    }, [refresh]);

    useEffect(() => {
        void refresh();
        if (navigator.onLine) void syncNow();
        const handleOnline = () => {
            setOnline(true);
            void syncNow();
        };
        const handleOffline = () => setOnline(false);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [refresh, syncNow]);

    return { orders, online, syncing, syncProgress, refresh, syncNow, queueOrder };
}
