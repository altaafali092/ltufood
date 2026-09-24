import { Head, router } from '@inertiajs/react';
import {
    Bot,
    Flame,
    Leaf,
    MessageCircle,
    MessageSquarePlus,
    PanelLeft,
    PiggyBank,
    Send,
    Star,
    Trash2,
    User,
    X,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { FormEvent, KeyboardEvent } from 'react';

import MenuGrid from '@/components/Frontend/MenuGrid';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import type { CartItem } from '@/types';
import type { FoodItem } from '@/types/frontend/Index';

type Message = {
    id: string;
    role: 'assistant' | 'user';
    content: string;
    createdAt: string;
    recommendation?: FoodItem;
};

type Conversation = {
    id: string;
    title: string;
    updatedAt: string;
    messages: Message[];
};

const STORAGE_KEY = 'ltu-food-chat-history';

const SUGGESTIONS = [
    { icon: Flame, label: 'Something spicy', hint: 'Turn up the heat' },
    { icon: PiggyBank, label: 'Under NPR 200', hint: 'Easy on the wallet' },
    { icon: Leaf, label: 'Vegetarian options', hint: 'Fresh & meat-free' },
    { icon: Star, label: "Today's favourite", hint: 'Most loved dish' },
];

const recommendationImage = (item: FoodItem): string | null =>
    Array.isArray(item.images) && item.images.length > 0
        ? item.images[0]
        : null;

const recommendationEmoji = (item: FoodItem): string =>
    item.tags?.find((tag) => tag) ?? '🍽️';

const createId = (): string =>
    `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

const createConversation = (): Conversation => ({
    id: createId(),
    title: 'New conversation',
    updatedAt: new Date().toISOString(),
    messages: [
        {
            id: createId(),
            role: 'assistant',
            content:
                'Hi! I’m your LTU Food assistant. Ask me about the menu, popular dishes, or what might be a good choice today.',
            createdAt: new Date().toISOString(),
        },
    ],
});

const formatConversationDate = (date: string): string => {
    const conversationDate = new Date(date);
    const today = new Date();

    if (conversationDate.toDateString() === today.toDateString()) {
        return conversationDate.toLocaleTimeString([], {
            hour: 'numeric',
            minute: '2-digit',
        });
    }

    return conversationDate.toLocaleDateString([], {
        month: 'short',
        day: 'numeric',
    });
};

const getInitialConversations = (): Conversation[] => {
    if (typeof window === 'undefined') {
        return [createConversation()];
    }

    const savedConversations = window.localStorage.getItem(STORAGE_KEY);

    if (!savedConversations) {
        return [createConversation()];
    }

    try {
        const parsedConversations = JSON.parse(
            savedConversations,
        ) as Conversation[];

        if (parsedConversations.length > 0) {
            return parsedConversations;
        }
    } catch {
        window.localStorage.removeItem(STORAGE_KEY);
    }

    return [createConversation()];
};

interface ChatProps {
    foodItems: FoodItem[];
}

interface ChatResponse {
    message?: string;
    recommendation?: FoodItem;
}

export default function Chat({ foodItems }: ChatProps) {
    const [conversations, setConversations] = useState<Conversation[]>(
        getInitialConversations,
    );
    const [activeConversationId, setActiveConversationId] = useState('');
    const [message, setMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [selectedFoodId, setSelectedFoodId] = useState<string>();
    const [sidebarOpen, setSidebarOpen] = useState(
        () => typeof window === 'undefined' || window.innerWidth >= 768,
    );
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (conversations.length > 0) {
            window.localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(conversations),
            );
        }
    }, [conversations]);

    const activeConversation = useMemo(
        () =>
            conversations.find(
                (conversation) => conversation.id === activeConversationId,
            ) ?? conversations[0],
        [activeConversationId, conversations],
    );

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'end',
        });
    }, [activeConversation?.messages.length, isTyping, activeConversationId]);

    const closeSidebarOnMobile = () => {
        if (window.innerWidth < 768) {
            setSidebarOpen(false);
        }
    };

    const startConversation = () => {
        const newConversation = createConversation();

        setConversations((currentConversations) => [
            newConversation,
            ...currentConversations,
        ]);
        setActiveConversationId(newConversation.id);
        setMessage('');
        closeSidebarOnMobile();
    };

    const deleteConversation = (id: string) => {
        const remaining = conversations.filter(
            (conversation) => conversation.id !== id,
        );

        if (remaining.length === 0) {
            const fresh = createConversation();
            setConversations([fresh]);
            setActiveConversationId(fresh.id);

            return;
        }

        setConversations(remaining);

        if (id === activeConversationId) {
            setActiveConversationId(remaining[0].id);
        }
    };

    const addRecommendationToCart = (foodItem: FoodItem) => {
        router.post(
            `/cart/add/${foodItem.id}`,
            { quantity: 1 },
            { preserveScroll: true },
        );
    };

    const submitMessage = async (rawText: string) => {
        const trimmedMessage = rawText.trim();
        const conversation = activeConversation;

        if (!trimmedMessage || !conversation || isTyping) {
            return;
        }

        const now = new Date().toISOString();
        const userMessage: Message = {
            id: createId(),
            role: 'user',
            content: trimmedMessage,
            createdAt: now,
        };

        setConversations((currentConversations) =>
            currentConversations.map((item) =>
                item.id === conversation.id
                    ? {
                          ...item,
                          title:
                              item.title === 'New conversation'
                                  ? trimmedMessage.slice(0, 36)
                                  : item.title,
                          updatedAt: now,
                          messages: [...item.messages, userMessage],
                      }
                    : item,
            ),
        );
        setMessage('');
        setIsTyping(true);

        try {
            const response = await fetch('/chat/message', {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN':
                        document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute('content') ?? '',
                },
                body: JSON.stringify({
                    message: trimmedMessage,
                    selected_food_item_id: selectedFoodId
                        ? Number(selectedFoodId)
                        : null,
                    history: conversation.messages
                        .filter(
                            (item) =>
                                item.role === 'user' ||
                                item.role === 'assistant',
                        )
                        .slice(-30)
                        .map(({ role, content }) => ({ role, content })),
                }),
            });

            const responseText = await response.text();
            let data: ChatResponse = {};

            try {
                data = JSON.parse(responseText) as ChatResponse;
            } catch {
                throw new Error(
                    'The assistant returned an invalid response. Please try again.',
                );
            }

            if (!response.ok || !data.message) {
                throw new Error(
                    data.message ??
                        'Unable to get a response from the assistant.',
                );
            }

            const assistantMessage: Message = {
                id: createId(),
                role: 'assistant',
                content: data.message,
                createdAt: new Date().toISOString(),
                recommendation: data.recommendation,
            };

            setConversations((currentConversations) =>
                currentConversations.map((item) =>
                    item.id === conversation.id
                        ? {
                              ...item,
                              updatedAt: new Date().toISOString(),
                              messages: [...item.messages, assistantMessage],
                          }
                        : item,
                ),
            );
        } catch (error) {
            const assistantMessage: Message = {
                id: createId(),
                role: 'assistant',
                content:
                    error instanceof Error
                        ? error.message
                        : 'I could not reach the assistant. Please try again.',
                createdAt: new Date().toISOString(),
            };

            setConversations((currentConversations) =>
                currentConversations.map((item) =>
                    item.id === conversation.id
                        ? {
                              ...item,
                              updatedAt: new Date().toISOString(),
                              messages: [...item.messages, assistantMessage],
                          }
                        : item,
                ),
            );
        } finally {
            setIsTyping(false);
        }
    };

    const sendMessage = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        submitMessage(message);
    };

    const handleMessageKeyDown = (
        event: KeyboardEvent<HTMLTextAreaElement>,
    ) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            event.currentTarget.form?.requestSubmit();
        }
    };

    return (
        <>
            <Head title="Chat assistant" />
            <style>{`
                @keyframes ltu-typing {
                    0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
                    30% { transform: translateY(-4px); opacity: 1; }
                }
                .ltu-typing-dot {
                    width: 7px; height: 7px; border-radius: 9999px;
                    background: #94a3b8; animation: ltu-typing 1.2s infinite;
                }
                .ltu-typing-dot:nth-child(2) { animation-delay: 0.15s; }
                .ltu-typing-dot:nth-child(3) { animation-delay: 0.3s; }
            `}</style>

            <div className="flex min-h-svh">
                <aside
                    className={cn(
                        'inset-y-0 left-0 z-20 flex w-72 shrink-0 flex-col border-r border-black/10 bg-white transition-all duration-200 dark:border-white/10 dark:bg-[#111820]',
                        sidebarOpen
                            ? 'fixed md:static'
                            : 'fixed -translate-x-full md:hidden',
                    )}
                >
                    <div className="flex h-16 items-center justify-between border-b border-black/10 px-4 dark:border-white/10">
                        <div className="flex items-center gap-2.5">
                            <span className="flex size-9 items-center justify-center rounded-xl bg-[#00a37a] text-white">
                                <Bot className="size-4" />
                            </span>
                            <span>
                                <span className="block text-sm leading-none font-bold">
                                    LTU Food
                                </span>
                                <span className="mt-1 block text-[10px] font-semibold tracking-[0.18em] text-muted-foreground">
                                    ASSISTANT
                                </span>
                            </span>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-full md:hidden"
                            onClick={() => setSidebarOpen(false)}
                            aria-label="Close chat history"
                        >
                            <X className="size-4" />
                        </Button>
                    </div>

                    <div className="p-3">
                        <button
                            type="button"
                            onClick={startConversation}
                            className="flex w-full items-center justify-center gap-2 rounded-full bg-[#00a37a] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#008f6b] focus:ring-2 focus:ring-[#00a37a]/40 focus:outline-none"
                        >
                            <MessageSquarePlus className="size-4" />
                            New chat
                        </button>
                    </div>

                    <p className="px-4 pb-2 text-xs font-medium text-muted-foreground">
                        Chat history
                    </p>
                    <nav className="flex-1 space-y-1 overflow-y-auto px-2 pb-4">
                        {conversations.map((conversation) => {
                            const isActive =
                                conversation.id ===
                                (activeConversationId || conversations[0]?.id);

                            return (
                                <div
                                    key={conversation.id}
                                    className={cn(
                                        'group flex w-full items-center gap-1 rounded-xl px-2 py-1 text-left text-sm transition-colors',
                                        isActive
                                            ? 'bg-[#00a37a]/10'
                                            : 'hover:bg-black/5 dark:hover:bg-white/5',
                                    )}
                                >
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setActiveConversationId(
                                                conversation.id,
                                            );
                                            closeSidebarOnMobile();
                                        }}
                                        className="flex min-w-0 flex-1 items-center gap-3 rounded-lg px-2 py-1.5"
                                    >
                                        <MessageCircle
                                            className={cn(
                                                'size-4 shrink-0',
                                                isActive
                                                    ? 'text-[#00a37a]'
                                                    : 'text-muted-foreground',
                                            )}
                                        />
                                        <span className="min-w-0 flex-1 truncate">
                                            {conversation.title}
                                        </span>
                                        <span className="shrink-0 text-[11px] text-muted-foreground">
                                            {formatConversationDate(
                                                conversation.updatedAt,
                                            )}
                                        </span>
                                    </button>
                                    <button
                                        type="button"
                                        aria-label="Delete conversation"
                                        onClick={() =>
                                            deleteConversation(conversation.id)
                                        }
                                        className="rounded-md p-1.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-500/10 hover:text-red-500 focus:opacity-100 focus:outline-none"
                                    >
                                        <Trash2 className="size-3.5" />
                                    </button>
                                </div>
                            );
                        })}
                    </nav>
                </aside>

                {sidebarOpen && (
                    <div
                        className="fixed inset-0 z-10 bg-black/30 backdrop-blur-sm md:hidden"
                        onClick={() => setSidebarOpen(false)}
                        aria-hidden="true"
                    />
                )}

                <main className="flex min-h-svh min-w-0 flex-1 flex-col bg-[#f7f8f7] dark:bg-[#080c10]">
                    <header className="flex h-16 shrink-0 items-center border-b border-black/10 bg-white/80 px-4 backdrop-blur md:px-6 dark:border-white/10 dark:bg-[#111820]/80">
                        <div className="flex items-center gap-3">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setSidebarOpen((open) => !open)}
                                aria-label="Toggle chat history"
                                className="rounded-full"
                            >
                                {sidebarOpen ? (
                                    <X className="size-4" />
                                ) : (
                                    <PanelLeft className="size-4" />
                                )}
                            </Button>
                            <div>
                                <h1 className="text-sm font-bold">
                                    LTU Food Assistant
                                </h1>
                                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                    <span className="size-1.5 rounded-full bg-emerald-500" />
                                    Online · replies instantly
                                </p>
                            </div>
                        </div>
                    </header>

                    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-6 md:px-6">
                        <div className="flex-1 space-y-5 overflow-y-auto pb-4">
                            {activeConversation?.messages.map((chatMessage) => (
                                <div
                                    key={chatMessage.id}
                                    className={cn(
                                        'flex gap-3',
                                        chatMessage.role === 'user' &&
                                            'flex-row-reverse',
                                    )}
                                >
                                    {chatMessage.role === 'assistant' ? (
                                        <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl bg-[#00a37a] text-white">
                                            <Bot className="size-4" />
                                        </span>
                                    ) : (
                                        <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-black/5 text-slate-500 dark:bg-white/10 dark:text-slate-300">
                                            <User className="size-4" />
                                        </span>
                                    )}
                                    <div
                                        className={cn(
                                            'max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed',
                                            chatMessage.role === 'user'
                                                ? 'rounded-tr-md bg-[#00a37a] text-white'
                                                : 'rounded-tl-md border border-black/5 bg-white shadow-sm dark:border-white/10 dark:bg-[#111820] dark:text-slate-200',
                                        )}
                                    >
                                        {chatMessage.content}
                                    </div>
                                    {chatMessage.role === 'assistant' &&
                                        chatMessage.recommendation && (
                                            <div className="mt-2 max-w-sm">
                                                <MenuGrid
                                                    filtered={[
                                                        chatMessage.recommendation,
                                                    ]}
                                                    cartItems={[] as CartItem[]}
                                                    addToCart={
                                                        addRecommendationToCart
                                                    }
                                                    removeFromCart={() => {}}
                                                    itemImage={
                                                        recommendationImage
                                                    }
                                                    itemEmoji={
                                                        recommendationEmoji
                                                    }
                                                />
                                            </div>
                                        )}
                                </div>
                            ))}
                            {isTyping && (
                                <div className="flex gap-3">
                                    <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl bg-[#00a37a] text-white">
                                        <Bot className="size-4" />
                                    </span>
                                    <div
                                        aria-label="Assistant is typing"
                                        className="flex items-center gap-1.5 rounded-2xl rounded-tl-md border border-black/5 bg-white px-4 py-3.5 shadow-sm dark:border-white/10 dark:bg-[#111820]"
                                    >
                                        <span className="ltu-typing-dot" />
                                        <span className="ltu-typing-dot" />
                                        <span className="ltu-typing-dot" />
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        <div className="mb-4 flex items-center gap-3 rounded-2xl border border-black/10 bg-white px-4 py-3 dark:border-white/10 dark:bg-[#111820]">
                            <span className="text-xs font-semibold text-muted-foreground">
                                Ask about
                            </span>
                            <Select
                                value={selectedFoodId ?? 'all'}
                                onValueChange={(value) =>
                                    setSelectedFoodId(
                                        value === 'all' ? undefined : value,
                                    )
                                }
                            >
                                <SelectTrigger
                                    size="sm"
                                    className="min-w-0 flex-1 border-0 bg-transparent shadow-none focus:ring-0"
                                    aria-label="Select a food item"
                                >
                                    <SelectValue placeholder="The whole menu" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        The whole menu
                                    </SelectItem>
                                    {foodItems.map((foodItem) => (
                                        <SelectItem
                                            key={foodItem.id}
                                            value={String(foodItem.id)}
                                        >
                                            {foodItem.title} · NPR{' '}
                                            {foodItem.price}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {activeConversation &&
                            activeConversation.messages.length <= 1 &&
                            !isTyping && (
                                <div className="grid grid-cols-2 gap-3 pb-5 lg:grid-cols-4">
                                    {SUGGESTIONS.map(
                                        ({ icon: Icon, label, hint }) => (
                                            <button
                                                key={label}
                                                type="button"
                                                onClick={() =>
                                                    submitMessage(label)
                                                }
                                                className="rounded-2xl border border-black/10 bg-white p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#00a37a]/40 hover:shadow-md focus:ring-2 focus:ring-[#00a37a]/40 focus:outline-none dark:border-white/10 dark:bg-[#111820]"
                                            >
                                                <span className="mb-2.5 flex size-9 items-center justify-center rounded-xl bg-[#00a37a]/10 text-[#00a37a]">
                                                    <Icon className="size-4" />
                                                </span>
                                                <span className="block text-sm font-semibold">
                                                    {label}
                                                </span>
                                                <span className="block text-xs text-muted-foreground">
                                                    {hint}
                                                </span>
                                            </button>
                                        ),
                                    )}
                                </div>
                            )}

                        <div className="rounded-[1.75rem] border border-black/10 bg-white p-2 pl-4 shadow-sm dark:border-white/10 dark:bg-[#111820]">
                            <form onSubmit={sendMessage}>
                                <Textarea
                                    value={message}
                                    onChange={(event) =>
                                        setMessage(event.target.value)
                                    }
                                    onKeyDown={handleMessageKeyDown}
                                    placeholder="Ask about the menu..."
                                    aria-label="Message"
                                    rows={1}
                                    className="max-h-40 min-h-11 resize-none border-0 bg-transparent px-0 py-2.5 shadow-none focus-visible:ring-0"
                                />
                                <div className="flex items-center justify-between pb-1">
                                    <p className="hidden text-xs text-muted-foreground sm:block">
                                        Press Enter to send · Shift + Enter for
                                        a new line
                                    </p>
                                    <span className="sm:hidden" />
                                    <button
                                        type="submit"
                                        disabled={!message.trim() || isTyping}
                                        aria-label="Send message"
                                        className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#00a37a] text-white transition-all hover:scale-105 hover:bg-[#008f6b] focus:ring-2 focus:ring-[#00a37a]/40 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
                                    >
                                        <Send className="size-4" />
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}
