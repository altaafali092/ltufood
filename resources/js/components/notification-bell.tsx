import { Bell, BellRing, PackageOpen, TriangleAlert, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useUnpaidAlerts, type UnpaidAlert } from '@/hooks/use-unpaid-alerts';
import { cn } from '@/lib/utils';

// ─── individual alert row ────────────────────────────────────────────────────

function AlertRow({ alert, onDismiss }: { alert: UnpaidAlert; onDismiss: (id: number) => void }) {
    return (
        <div
            className={cn(
                'group relative flex gap-3 rounded-lg border p-3 transition-colors',
                alert.readAt === null
                    ? 'border-red-200 bg-red-50 dark:border-red-900/60 dark:bg-red-950/30'
                    : 'border-border bg-background',
            )}
        >
            {/* pulsing dot for unread */}
            {alert.readAt === null && (
                <span className="absolute top-3 right-3 flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
                </span>
            )}

            {/* icon */}
            <span className="mt-0.5 shrink-0 rounded-md bg-red-100 p-1.5 text-red-600 dark:bg-red-900/40 dark:text-red-400">
                <TriangleAlert className="h-3.5 w-3.5" />
            </span>

            {/* body */}
            <div className="min-w-0 flex-1 pr-4">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-red-700 dark:text-red-400">
                    Unpaid Table Breach
                </p>
                <p className="mt-0.5 text-xs text-foreground/80 leading-snug">{alert.message}</p>
                <div className="mt-1.5 flex items-center gap-2 text-[10px] text-muted-foreground">
                    {alert.orderId && <span className="font-medium">Order #{alert.orderId}</span>}
                    {alert.orderId && alert.timestamp && <span>·</span>}
                    {alert.timestamp && <span>{alert.timestamp}</span>}
                </div>
            </div>

            {/* dismiss */}
            <button
                type="button"
                onClick={() => onDismiss(alert.id)}
                className="absolute top-2 right-2 rounded p-0.5 text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100 focus:opacity-100"
                aria-label="Dismiss alert"
            >
                <X className="h-3 w-3" />
            </button>
        </div>
    );
}

// ─── empty state ─────────────────────────────────────────────────────────────

function EmptyAlerts() {
    return (
        <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
            <PackageOpen className="h-8 w-8 text-muted-foreground/40" />
            <p className="text-sm font-medium text-muted-foreground">No alerts</p>
            <p className="text-xs text-muted-foreground/60">You'll be notified when a table leaves without paying.</p>
        </div>
    );
}

// ─── main component ───────────────────────────────────────────────────────────

export function NotificationBell() {
    const { alerts, loading, unreadCount, dismissAlert, markAllRead, clearAll } = useUnpaidAlerts();
    const [open, setOpen] = useState(false);
    const panelRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);

    // Mark all as read when the panel opens
    useEffect(() => {
        if (open && unreadCount > 0) {
            markAllRead();
        }
    }, [open, unreadCount, markAllRead]);

    // Close on outside click
    useEffect(() => {
        if (!open) {
            return;
        }

        const handlePointerDown = (e: PointerEvent) => {
            if (
                panelRef.current &&
                !panelRef.current.contains(e.target as Node) &&
                triggerRef.current &&
                !triggerRef.current.contains(e.target as Node)
            ) {
                setOpen(false);
            }
        };

        document.addEventListener('pointerdown', handlePointerDown);

        return () => document.removeEventListener('pointerdown', handlePointerDown);
    }, [open]);

    // Close on Escape
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setOpen(false);
                triggerRef.current?.focus();
            }
        };

        document.addEventListener('keydown', handleKey);

        return () => document.removeEventListener('keydown', handleKey);
    }, []);

    const hasAlerts = !loading && alerts.length > 0;

    return (
        <div className="relative">
            {/* ── Bell trigger ── */}
            <button
                ref={triggerRef}
                type="button"
                aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
                aria-expanded={open}
                aria-haspopup="dialog"
                onClick={() => setOpen((v) => !v)}
                className={cn(
                    'relative flex h-8 w-8 items-center justify-center rounded-md transition-colors',
                    'text-muted-foreground hover:bg-accent hover:text-foreground',
                    open && 'bg-accent text-foreground',
                )}
            >
                {hasAlerts ? (
                    <BellRing className="h-4 w-4" />
                ) : (
                    <Bell className="h-4 w-4" />
                )}

                {/* unread badge */}
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-0.5 text-[9px] font-bold leading-none text-white ring-2 ring-background">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {/* ── Dropdown panel ── */}
            {open && (
                <div
                    ref={panelRef}
                    role="dialog"
                    aria-label="Notifications panel"
                    className={cn(
                        'absolute right-0 top-full z-50 mt-2',
                        'w-80 sm:w-96',
                        'rounded-xl border border-border bg-popover shadow-xl',
                        'animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-150',
                    )}
                >
                    {/* header */}
                    <div className="flex items-center justify-between border-b border-border px-4 py-3">
                        <div className="flex items-center gap-2">
                            <BellRing className="h-4 w-4 text-red-500" />
                            <span className="text-sm font-semibold text-foreground">Alerts</span>
                            {hasAlerts && (
                                <span className="rounded-full bg-red-100 px-1.5 py-0.5 text-[10px] font-bold text-red-700 dark:bg-red-900/40 dark:text-red-400">
                                    {alerts.length}
                                </span>
                            )}
                        </div>
                        {hasAlerts && (
                            <button
                                type="button"
                                onClick={clearAll}
                                className="text-[11px] font-medium text-muted-foreground transition-colors hover:text-destructive"
                            >
                                Clear all
                            </button>
                        )}
                    </div>

                    {/* alert list */}
                    <div className="max-h-[26rem] overflow-y-auto overscroll-contain">
                        {loading ? (
                            <div className="flex flex-col gap-2 p-3">
                                {[1, 2].map((n) => (
                                    <div key={n} className="h-16 animate-pulse rounded-lg bg-muted" />
                                ))}
                            </div>
                        ) : hasAlerts ? (
                            <div className="flex flex-col gap-2 p-3">
                                {alerts.map((alert) => (
                                    <AlertRow key={alert.id} alert={alert} onDismiss={dismissAlert} />
                                ))}
                            </div>
                        ) : (
                            <EmptyAlerts />
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
