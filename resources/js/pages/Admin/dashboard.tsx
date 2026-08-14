import { useEffect, useState } from 'react';
import { Head } from '@inertiajs/react';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import { dashboard } from '@/routes/admin';
import { useEcho } from '@laravel/echo-react';
import { Order } from '@/types/frontend/Order';

// Define explicit internal state interfaces


interface GeofenceAlert {
    id: number;
    message: string;
    tableNumber?: string;
    orderId?: number;
    timestamp?: string;
}

interface DashboardProps {
    order?: Order;
}

export default function Dashboard({ order: initialOrder }: DashboardProps) {
    const [alerts, setAlerts] = useState<GeofenceAlert[]>([]);
    const [order, setOrder] = useState<Order | undefined>(initialOrder);

    // 1. Maintain a single instance of the target audio track across renders
    const [audioTrack] = useState(() => new Audio('/audio/alert.mp3'));

    // 2. Invisible Document Interaction Audio Context Unlocker Hook
    useEffect(() => {
        const unlockAudio = () => {
            audioTrack.muted = true;
            audioTrack.play()
                .then(() => {
                    audioTrack.pause();
                    audioTrack.muted = false; // Arm system to normal audible volume
                    console.log("🔊 Admin Audio context primed and allowed to bypass autoplay rules!");

                    // Cleanup event bindings immediately
                    document.removeEventListener('click', unlockAudio);
                    document.removeEventListener('touchstart', unlockAudio);
                })
                .catch(err => console.log("Admin alert audio unlock delayed:", err));
        };

        document.addEventListener('click', unlockAudio);
        document.addEventListener('touchstart', unlockAudio);

        return () => {
            document.removeEventListener('click', unlockAudio);
            document.removeEventListener('touchstart', unlockAudio);
        };
    }, [audioTrack]);

    // 3. Setup reactive tracking hook for single-order status (if order is passed)
    if (initialOrder?.id) {

        useEcho(
            `orders.${initialOrder.id}`,
            '.OrderStatusUpdated',
            (event: { order: { id: number; Payment_status: Order['payment_status'] } }) => {
                if (event?.order?.Payment_status) {
                    setOrder((prevOrder) => prevOrder ? ({
                        ...prevOrder,
                        status: event.order.Payment_status,
                    }) : undefined);
                }
            }
        );
    }

    // 4. Setup manual event listener for real-time unpaid table geofence alerts
    useEffect(() => {
        if (typeof window.Echo === 'undefined') {

            return;
        }

        // Subscribe to private restaurant-alerts channel
        const channel = window.Echo.private('restaurant-alerts');

        const handleUnpaidAlert = (e: { message: string; table_number?: string; order_id?: number; timestamp?: string }) => {
            console.log("🚨 Inbound Realtime Unpaid Geofence Event Detected:", e);

            // Play the audio track
            audioTrack.currentTime = 0;
            audioTrack.play().catch(err => {
                console.error("Autoplay Restriction: Interaction missing prior to background event.", err.message);
            });

            setAlerts((prevAlerts) => [
                {
                    id: Date.now(),
                    message: e.message || `Alert: Table ${e.table_number || 'Unknown'} left without paying!`,
                    tableNumber: e.table_number,
                    orderId: e.order_id,
                    timestamp: e.timestamp ? new Date(e.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                },
                ...prevAlerts
            ]);
        };

        // Listen for broadcastAs name and fallback class name
        channel.listen('.UnpaidTableAlert', handleUnpaidAlert);
        channel.listen('.App\\Events\\UnpaidTableAlert', handleUnpaidAlert);

        return () => {
            channel.stopListening('.UnpaidTableAlert');
            channel.stopListening('.App\\Events\\UnpaidTableAlert');
            window.Echo.leave('restaurant-alerts');
            window.Echo.leave('private-restaurant-alerts');
        };
    }, [audioTrack]);

    const dismissAlert = (id: number) => {
        setAlerts(alerts.filter(alert => alert.id !== id));
    };

    const clearAllAlerts = () => {
        setAlerts([]);
    };

    return (
        <>
            <Head title="Dashboard" />

            {/* FLOATING REAL-TIME GEOFENCE NOTIFICATION BANNERS */}
            <div className="fixed top-6 right-6 z-[9999] flex w-full max-w-md flex-col gap-3">
                {alerts.length > 1 && (
                    <div className="flex justify-end">
                        <button
                            onClick={clearAllAlerts}
                            className="text-xs bg-slate-900/80 hover:bg-slate-900 text-white font-semibold px-3 py-1 rounded-full shadow-sm backdrop-blur-sm transition-all"
                        >
                            Clear All ({alerts.length})
                        </button>
                    </div>
                )}
                {alerts.map((alert) => (
                    <div
                        key={alert.id}
                        className="flex items-start justify-between rounded-xl bg-red-600 dark:bg-rose-700 p-4 text-white shadow-2xl ring-2 ring-red-400 dark:ring-rose-500 animate-in fade-in slide-in-from-top-4 duration-300"
                    >
                        <div className="flex items-start gap-3">
                            <span className="relative flex h-3 w-3 mt-1 shrink-0">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-300"></span>
                            </span>
                            <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2">
                                    <span className="font-extrabold text-sm uppercase tracking-wide">Unpaid Table Breach</span>
                                    {alert.timestamp && (
                                        <span className="text-[10px] bg-red-800/60 dark:bg-rose-900/60 px-2 py-0.5 rounded-full font-mono">
                                            {alert.timestamp}
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs font-medium opacity-95">{alert.message}</p>
                                {alert.orderId && (
                                    <span className="text-[11px] font-semibold underline underline-offset-2 mt-0.5 opacity-90">
                                        Order #{alert.orderId}
                                    </span>
                                )}
                            </div>
                        </div>
                        <button
                            onClick={() => dismissAlert(alert.id)}
                            className="ml-3 rounded-md p-1 hover:bg-red-700 dark:hover:bg-rose-800 transition-colors focus:outline-none"
                            aria-label="Dismiss"
                        >
                            ✕
                        </button>
                    </div>
                ))}
            </div>

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                    </div>
                    <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                    </div>
                    <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                    </div>
                </div>
                <div className="relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
                    <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                </div>
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
