export type Dish = { id: number; name: string; description: string; price: number; category: string; emoji: string; image?: string; badge?: string };
const photo = (id: number) => `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=800`;
// Names, prices, categories and descriptions match the repository's MOCK_FOOD_ITEMS.
// Photography is illustrative; these are not live Laravel foodItems.
export const dishes: Dish[] = [
  { id: 1, name: 'Momo (Steam)', description: 'Hand-folded dumplings stuffed with spiced minced chicken, ginger & garlic, served with tomato achar.', price: 180, category: 'Nepali', emoji: '🥟', image: '/images/momo-hero.png', badge: 'Today’s favourite' },
  { id: 2, name: 'Dal Bhat Set', description: 'Traditional set — steamed rice, lentil soup, seasonal vegetable curry, pickles & papad.', price: 250, category: 'Nepali', emoji: '🍛', image: photo(29148133), badge: 'Nepali classic' },
  { id: 3, name: 'Chowmein', description: 'Stir-fried egg noodles with crunchy vegetables and house soy-chilli sauce.', price: 160, category: 'Chinese', emoji: '🍜', image: photo(24738507), badge: 'Wok-tossed' },
  { id: 5, name: 'Margherita Pizza', description: 'San Marzano tomato base, fresh mozzarella, basil leaves baked in a stone oven.', price: 420, category: 'Italian', emoji: '🍕', image: photo(6605219), badge: 'Stone-baked' },
  { id: 4, name: 'Fried Rice', description: 'Wok-tossed jasmine rice with egg, spring onions, sweet corn & sesame oil.', price: 170, category: 'Chinese', emoji: '🍚' },
  { id: 6, name: 'Pasta Arrabiata', description: 'Penne pasta in fiery tomato-chilli sauce with garlic and fresh parsley.', price: 350, category: 'Italian', emoji: '🍝' },
  { id: 7, name: 'Chicken Burger', description: 'Crispy fried chicken thigh, pickled jalapeños, sriracha mayo on a toasted brioche bun.', price: 290, category: 'Fast Food', emoji: '🍔', image: photo(16892373) },
  { id: 8, name: 'Loaded Fries', description: 'Thick-cut fries, melted cheddar, crispy bacon bits, sour cream & chives.', price: 220, category: 'Fast Food', emoji: '🍟' },
  { id: 9, name: 'Masala Chai', description: 'Spiced milk tea brewed with cardamom, ginger, cinnamon & Assam tea leaves.', price: 60, category: 'Drinks', emoji: '🍵' },
  { id: 10, name: 'Fresh Juice', description: 'Cold-pressed seasonal fruit juice — orange, mango or mixed berry.', price: 120, category: 'Drinks', emoji: '🥤' },
  { id: 11, name: 'Thukpa', description: 'Tibetan noodle soup with bone broth, tender vegetables and hand-rolled noodles.', price: 200, category: 'Nepali', emoji: '🍲' },
  { id: 12, name: 'Chocolate Lava Cake', description: 'Warm dark-chocolate cake with a molten centre, served with a scoop of vanilla ice cream.', price: 280, category: 'Desserts', emoji: '🍫' },
];
export const categories = ['All', 'Nepali', 'Chinese', 'Italian', 'Fast Food', 'Drinks', 'Desserts'];
export const categoryIcons: Record<string, string> = { All: '✦', Nepali: '🥟', Chinese: '🍜', Italian: '🍕', 'Fast Food': '🍔', Drinks: '🍵', Desserts: '🍰' };
export const money = (price: number) => new Intl.NumberFormat('en-NP', { style: 'currency', currency: 'NPR', maximumFractionDigits: 0 }).format(price);
export type DemoOrder = { id: string; table: number; date: string; total: number; note: string; items: { name: string; quantity: number; price: number }[] };
export function readStorage<T>(key: string, fallback: T): T { try { const value = localStorage.getItem(key); return value ? JSON.parse(value) as T : fallback; } catch { return fallback; } }
export function saveStorage(key: string, value: unknown) { try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* The app still works when browser storage is unavailable. */ } }
