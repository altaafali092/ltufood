import { useEffect, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';

type Props = { title: string; eyebrow?: string; onClose: () => void; children: ReactNode; drawer?: boolean };
export default function Dialog({ title, eyebrow, onClose, children, drawer = false }: Props) {
    const dialog = useRef<HTMLElement>(null);
    const close = useRef<HTMLButtonElement>(null);
    const closeCallback = useRef(onClose);
    closeCallback.current = onClose;
    useEffect(() => {
        const previous = document.activeElement as HTMLElement;
        const overflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        close.current?.focus();
        const handleKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') closeCallback.current();
            if (event.key !== 'Tab') return;
            const items = Array.from(dialog.current?.querySelectorAll<HTMLElement>('button:not(:disabled), input, select, textarea, a[href]') || []);
            const first = items[0], last = items[items.length - 1];
            if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
            else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
        };
        window.addEventListener('keydown', handleKey);
        return () => { document.body.style.overflow = overflow; window.removeEventListener('keydown', handleKey); previous?.focus(); };
    }, []);
    return (
        <div
            className={`fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm ${drawer ? 'justify-end' : ''}`}
            onClick={onClose}
        >
            <section
                ref={dialog}
                className={`max-h-[90vh] w-full overflow-y-auto rounded-2xl bg-white text-slate-900 shadow-2xl dark:bg-slate-900 dark:text-white ${drawer ? 'max-w-md rounded-r-none' : 'max-w-lg'}`}
                role="dialog"
                aria-modal="true"
                aria-label={title}
                onClick={e => e.stopPropagation()}
            >
                <header className="flex items-start justify-between border-b border-slate-100 p-5 dark:border-slate-800">
                    <div>
                        {eyebrow && <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">{eyebrow}</span>}
                        <h2 className="mt-1 text-lg font-bold">{title}</h2>
                    </div>
                    <button ref={close} className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white" aria-label="Close dialog" onClick={onClose}>
                        <X size={21} />
                    </button>
                </header>
                {children}
            </section>
        </div>
    );
}
