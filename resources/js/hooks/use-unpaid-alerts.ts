import { useCallback, useEffect, useState } from 'react';
import { useEcho } from '@laravel/echo-react';
import { router } from '@inertiajs/react';
import GeofenceAlertController from '@/actions/App/Http/Controllers/Admin/GeofenceAlertController';

export interface UnpaidAlert {
    id: number;
    message: string;
    tableNumber?: string;
    orderId?: number;
    timestamp: string;
    readAt: string | null;
}

interface ApiAlert {
    id: number;
    order_id: number | null;
    table_number: string;
    message: string;
    read_at: string | null;
    created_at: string;
}

interface UnpaidTableAlertPayload {
    alert_id: number;
    message: string;
    table_number?: string;
    order_id?: number;
    timestamp?: string;
}

function apiAlertToUnpaidAlert(a: ApiAlert): UnpaidAlert {
    return {
        id: a.id,
        message: a.message,
        tableNumber: a.table_number,
        orderId: a.order_id ?? undefined,
        timestamp: new Date(a.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        readAt: a.read_at,
    };
}

export function useUnpaidAlerts() {
    const [alerts, setAlerts] = useState<UnpaidAlert[]>([]);
    const [loading, setLoading] = useState(true);
    const [audioTrack] = useState(() => new Audio('/audio/alert.mp3'));

    // ── Unlock browser autoplay gate on first interaction ──────────────────
    useEffect(() => {
        const unlock = () => {
            audioTrack.muted = true;
            audioTrack
                .play()
                .then(() => {
                    audioTrack.pause();
                    audioTrack.muted = false;
                    document.removeEventListener('click', unlock);
                    document.removeEventListener('touchstart', unlock);
                })
                .catch(() => {});
        };

        document.addEventListener('click', unlock);
        document.addEventListener('touchstart', unlock);

        return () => {
            document.removeEventListener('click', unlock);
            document.removeEventListener('touchstart', unlock);
        };
    }, [audioTrack]);

    // ── Load persisted alerts from DB on mount ─────────────────────────────
    useEffect(() => {
        fetch(GeofenceAlertController.index().url, {
            headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
            credentials: 'same-origin',
        })
            .then((res) => res.json())
            .then((data: ApiAlert[]) => {
                setAlerts(data.map(apiAlertToUnpaidAlert));
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    // ── Handle incoming real-time alert ───────────────────────────────────
    const handleAlert = useCallback(
        (e: UnpaidTableAlertPayload) => {
            audioTrack.currentTime = 0;
            audioTrack.play().catch(() => {});

            const newAlert: UnpaidAlert = {
                id: e.alert_id,
                message: e.message || `Alert: Table ${e.table_number ?? 'Unknown'} left without paying!`,
                tableNumber: e.table_number,
                orderId: e.order_id,
                timestamp: e.timestamp
                    ? new Date(e.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                readAt: null,
            };

            setAlerts((prev) => [newAlert, ...prev]);
        },
        [audioTrack],
    );

    useEcho<UnpaidTableAlertPayload>('restaurant-alerts', '.UnpaidTableAlert', handleAlert, [handleAlert]);

    // ── Actions ────────────────────────────────────────────────────────────

    const dismissAlert = useCallback((id: number) => {
        // Optimistic removal
        setAlerts((prev) => prev.filter((a) => a.id !== id));

        const { url, method } = GeofenceAlertController.destroy(id);
        router.visit(url, {
            method,
            preserveScroll: true,
            preserveState: true,
            onError: () => {
                // Silently ignore — alert is cosmetically gone, DB may still have it
            },
        });
    }, []);

    const markAllRead = useCallback(() => {
        setAlerts((prev) => prev.map((a) => ({ ...a, readAt: a.readAt ?? new Date().toISOString() })));

        const { url, method } = GeofenceAlertController.markAllRead();
        router.visit(url, { method, preserveScroll: true, preserveState: true });
    }, []);

    const clearAll = useCallback(() => {
        setAlerts([]);

        const { url, method } = GeofenceAlertController.destroyAll();
        router.visit(url, { method, preserveScroll: true, preserveState: true });
    }, []);

    const unreadCount = alerts.filter((a) => a.readAt === null).length;

    return { alerts, loading, unreadCount, dismissAlert, markAllRead, clearAll };
}
