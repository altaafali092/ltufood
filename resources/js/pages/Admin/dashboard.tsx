import { useEffect, useState } from 'react';
import { Head } from '@inertiajs/react';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import { dashboard } from '@/routes/admin';

export default function Dashboard() {
    // State to hold active geofence alerts
    const [alerts, setAlerts] = useState([]);

    useEffect(() => {
        // Guard clause in case Echo isn't initialized globally yet
        if (typeof window.Echo === 'undefined') {
            console.error('Laravel Echo is not defined on the window object.');
            return;
        }

        // Listen to the public channel broadcasted by Laravel
        window.Echo.channel('restaurant-alerts')
            .listen('UnpaidTableAlert', (e:any) => {
                console.log(e.message)
                // 1. Play alert audio sound
                const audio = new Audio('/sounds/alert.mp3');
                audio.play().catch(err => console.log("Audio play blocked until user interaction."));

                // 2. Append the incoming alert to the component state array
                setAlerts((prevAlerts) => [
                    ...prevAlerts,
                    { id: Date.now(), message: e.message }
                ]);
            });

        // Cleanup function to leave the channel when this component unmounts
        return () => {
            window.Echo.leaveChannel('restaurant-alerts');
        };
    }, []);

    // Dismiss a specific alert from the layout
    const dismissAlert = (id) => {
        setAlerts(alerts.filter(alert => alert.id !== id));
    };

    return (
        <>
            <Head title="Dashboard" />

            {/* FLOATING REAL-TIME GEOFENCE NOTIFICATION BANNER */}
            <div className="fixed top-6 right-6 z-[9999] flex w-full max-w-sm flex-col gap-3">
                {alerts.map((alert) => (
                    <div 
                        key={alert.id} 
                        className="flex items-center justify-between rounded-lg bg-destructive p-4 font-semibold text-destructive-foreground shadow-lg animate-in fade-in slide-in-from-top-4 duration-300"
                    >
                        <span className="text-sm">{alert.message}</span>
                        <button 
                            onClick={() => dismissAlert(alert.id)}
                            className="ml-4 text-lg hover:opacity-80 focus:outline-none"
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