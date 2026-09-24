import { Head, Link, usePage } from '@inertiajs/react';
import { Bot, Expand, MessageCircle, Send, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import type { CartItem, SharedData } from '@/types';
import type { FoodItem } from '@/types/frontend/Index';
import WelcomeComponent from '../components/Frontend/Welcome';
import { chat } from '@/routes';

interface ChatMessage {
    id: number;
    role: 'user' | 'assistant';
    text: string;
}

interface PageProps {
    foodItems: FoodItem[];
    canRegister: boolean;
    cartItems: CartItem[];
}

const QUICK_REPLIES = [
    'Something spicy',
    'Under NPR 200',
    'Vegetarian options',
    "Today's favourite",
];

const GREETING: ChatMessage = {
    id: 1,
    role: 'assistant',
    text: "Hi! I'm the LTU Food assistant. Tell me what you're craving — spicy, light, or budget-friendly — and I'll help you pick from the menu.",
};

const WelcomePage = ({ foodItems, cartItems }: PageProps) => {
    const pageProps = usePage<SharedData>().props;
    const { totalQuantity, totalPrice } = pageProps;

    const [chatOpen, setChatOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState<ChatMessage[]>([GREETING]);
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const typingTimer = useRef<number | null>(null);

    // Keep the latest message in view
    useEffect(() => {
        scrollRef.current?.scrollTo({
            top: scrollRef.current.scrollHeight,
            behavior: 'smooth',
        });
    }, [messages, isTyping, chatOpen]);

    // Close with Escape
    useEffect(() => {
        if (!chatOpen) return;
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') setChatOpen(false);
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [chatOpen]);

    useEffect(() => {
        return () => {
            if (typingTimer.current) window.clearTimeout(typingTimer.current);
        };
    }, []);

    const pushMessage = (text: string) => {
        const trimmed = text.trim();
        if (!trimmed || isTyping) return;

        setMessages((prev) => [
            ...prev,
            { id: Date.now(), role: 'user', text: trimmed },
        ]);
        setMessage('');
        setIsTyping(true);

        // TODO: replace with a POST to your Laravel AI chat endpoint and render the real reply.
        typingTimer.current = window.setTimeout(() => {
            setMessages((prev) => [
                ...prev,
                {
                    id: Date.now() + 1,
                    role: 'assistant',
                    text: 'Good call! Our Popular Picks below are a safe bet — Shahi Noodles is today\u2019s favourite. Give me a budget or a craving and I\u2019ll narrow it down.',
                },
            ]);
            setIsTyping(false);
        }, 1200);
    };

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        pushMessage(message);
    };

    return (
        <>
            <Head title="LTU Food" />
            <WelcomeComponent
                foodItems={foodItems}
                cartItems={cartItems}
                totalQuantity={totalQuantity}
                totalPrice={totalPrice}
            />

            <style>{`
                @keyframes ltu-chat-pop {
                    from { opacity: 0; transform: translateY(12px) scale(0.98); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                @keyframes ltu-typing {
                    0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
                    30% { transform: translateY(-4px); opacity: 1; }
                }
                .ltu-chat-pop { animation: ltu-chat-pop 0.22s ease-out; }
                .ltu-typing-dot {
                    width: 7px; height: 7px; border-radius: 9999px;
                    background: #94a3b8; animation: ltu-typing 1.2s infinite;
                }
                .ltu-typing-dot:nth-child(2) { animation-delay: 0.15s; }
                .ltu-typing-dot:nth-child(3) { animation-delay: 0.3s; }
            `}</style>

            {chatOpen && (
                <section
                    aria-label="Chat with LTU Food"
                    role="dialog"
                    className="ltu-chat-pop fixed right-6 bottom-24 z-50 flex h-[min(540px,calc(100vh-8rem))] w-[min(384px,calc(100vw-2rem))] flex-col overflow-hidden rounded-3xl border border-black/10 bg-white shadow-2xl max-sm:right-4 dark:border-white/10 dark:bg-[#111820]"
                >
                    <header className="flex items-center justify-between gap-3 bg-[#00a37a] px-4 py-3.5 text-white">
                        <div className="flex min-w-0 items-center gap-3">
                            <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/20">
                                <Bot size={20} />
                                <span
                                    aria-hidden="true"
                                    className="absolute -right-0.5 -bottom-0.5 h-3 w-3 rounded-full border-2 border-[#00a37a] bg-emerald-300"
                                />
                            </span>
                            <div className="min-w-0">
                                <h2 className="truncate text-sm font-bold tracking-tight">
                                    LTU Food Assistant
                                </h2>
                                <p className="truncate text-xs text-white/75">
                                    Ask me about the menu
                                </p>
                            </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-1">
                            <Link
                                href={chat().url}
                                aria-label="Open full-screen chat"
                                className="rounded-full p-2 transition-colors hover:bg-white/20 focus:ring-2 focus:ring-white/70 focus:outline-none"
                            >
                                <Expand size={16} />
                            </Link>
                            <button
                                type="button"
                                onClick={() => setChatOpen(false)}
                                aria-label="Close chat"
                                className="rounded-full p-2 transition-colors hover:bg-white/20 focus:ring-2 focus:ring-white/70 focus:outline-none"
                            >
                                <X size={18} />
                            </button>
                        </div>
                    </header>

                    <div
                        ref={scrollRef}
                        aria-live="polite"
                        className="flex-1 space-y-3 overflow-y-auto bg-[#f7f8f7] p-4 dark:bg-[#080c10]"
                    >
                        {messages.map((chatMessage) => (
                            <div
                                key={chatMessage.id}
                                className={`flex ${
                                    chatMessage.role === 'user'
                                        ? 'justify-end'
                                        : 'justify-start'
                                }`}
                            >
                                <p
                                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                                        chatMessage.role === 'user'
                                            ? 'rounded-br-md bg-[#00a37a] text-white'
                                            : 'rounded-bl-md bg-white text-slate-700 shadow-sm dark:bg-white/10 dark:text-slate-200'
                                    }`}
                                >
                                    {chatMessage.text}
                                </p>
                            </div>
                        ))}
                        {isTyping && (
                            <div className="flex justify-start">
                                <div
                                    aria-label="Assistant is typing"
                                    className="flex items-center gap-1.5 rounded-2xl rounded-bl-md bg-white px-4 py-3.5 shadow-sm dark:bg-white/10"
                                >
                                    <span className="ltu-typing-dot" />
                                    <span className="ltu-typing-dot" />
                                    <span className="ltu-typing-dot" />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-2 overflow-x-auto border-t border-black/10 bg-white px-3 py-2.5 dark:border-white/10 dark:bg-[#111820]">
                        {QUICK_REPLIES.map((reply) => (
                            <button
                                key={reply}
                                type="button"
                                onClick={() => pushMessage(reply)}
                                disabled={isTyping}
                                className="shrink-0 rounded-full border border-[#00a37a]/25 bg-[#00a37a]/5 px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap text-[#00a37a] transition-colors hover:bg-[#00a37a] hover:text-white focus:ring-2 focus:ring-[#00a37a]/40 focus:outline-none disabled:opacity-50 dark:border-[#00a37a]/40"
                            >
                                {reply}
                            </button>
                        ))}
                    </div>

                    <form
                        onSubmit={handleSubmit}
                        className="flex items-center gap-2 border-t border-black/10 bg-white p-3 dark:border-white/10 dark:bg-[#111820]"
                    >
                        <label htmlFor="chat-message" className="sr-only">
                            Message
                        </label>
                        <input
                            id="chat-message"
                            value={message}
                            onChange={(event) => setMessage(event.target.value)}
                            placeholder="Ask about our menu..."
                            autoComplete="off"
                            className="min-w-0 flex-1 rounded-full border border-black/10 bg-[#f7f8f7] px-4 py-2.5 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-[#00a37a] focus:ring-2 focus:ring-[#00a37a]/20 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
                        />
                        <button
                            type="submit"
                            aria-label="Send message"
                            disabled={!message.trim() || isTyping}
                            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#00a37a] text-white transition-all hover:scale-105 hover:bg-[#008f6b] focus:ring-2 focus:ring-[#00a37a]/40 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
                        >
                            <Send size={17} />
                        </button>
                    </form>
                </section>
            )}

            <button
                type="button"
                onClick={() => setChatOpen((open) => !open)}
                aria-label={chatOpen ? 'Close chat' : 'Open chat'}
                aria-expanded={chatOpen}
                className="fixed right-6 bottom-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#00a37a] text-white shadow-xl shadow-[#00a37a]/25 transition-all hover:scale-105 hover:bg-[#008f6b] focus:ring-4 focus:ring-[#00a37a]/30 focus:outline-none max-sm:right-4"
            >
                {chatOpen ? <X size={22} /> : <MessageCircle size={24} />}
            </button>
        </>
    );
};

export default WelcomePage;
