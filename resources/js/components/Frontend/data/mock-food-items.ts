import type { MenuItem } from '@/types/frontend/menu';

export const MOCK_FOOD_ITEMS: MenuItem[] = [
    { id: 1, title: 'Momo (Steam)', description: 'Hand-folded dumplings stuffed with spiced minced chicken, ginger & garlic, served with tomato achar.', price: 180, popularity_score: 98, foodCategory: { id: 1, title: 'Nepali' }, emoji: '🥟' },
    { id: 2, title: 'Dal Bhat Set', description: 'Traditional set — steamed rice, lentil soup, seasonal vegetable curry, pickles & papad.', price: 250, popularity_score: 95, foodCategory: { id: 1, title: 'Nepali' }, emoji: '🍛' },
    { id: 3, title: 'Chowmein', description: 'Stir-fried egg noodles with crunchy vegetables and house soy-chilli sauce.', price: 160, popularity_score: 88, foodCategory: { id: 2, title: 'Chinese' }, emoji: '🍜' },
    { id: 4, title: 'Fried Rice', description: 'Wok-tossed jasmine rice with egg, spring onions, sweet corn & sesame oil.', price: 170, popularity_score: 82, foodCategory: { id: 2, title: 'Chinese' }, emoji: '🍚' },
    { id: 5, title: 'Margherita Pizza', description: 'San Marzano tomato base, fresh mozzarella, basil leaves baked in a stone oven.', price: 420, popularity_score: 76, foodCategory: { id: 3, title: 'Italian' }, emoji: '🍕' },
    { id: 6, title: 'Pasta Arrabiata', description: 'Penne pasta in fiery tomato-chilli sauce with garlic and fresh parsley.', price: 350, popularity_score: 71, foodCategory: { id: 3, title: 'Italian' }, emoji: '🍝' },
    { id: 7, title: 'Chicken Burger', description: 'Crispy fried chicken thigh, pickled jalapeños, sriracha mayo on a toasted brioche bun.', price: 290, popularity_score: 85, foodCategory: { id: 4, title: 'Fast Food' }, emoji: '🍔' },
    { id: 8, title: 'Loaded Fries', description: 'Thick-cut fries, melted cheddar, crispy bacon bits, sour cream & chives.', price: 220, popularity_score: 79, foodCategory: { id: 4, title: 'Fast Food' }, emoji: '🍟' },
    { id: 9, title: 'Masala Chai', description: 'Spiced milk tea brewed with cardamom, ginger, cinnamon & Assam tea leaves.', price: 60, popularity_score: 91, foodCategory: { id: 5, title: 'Drinks' }, emoji: '🍵' },
    { id: 10, title: 'Fresh Juice', description: 'Cold-pressed seasonal fruit juice — orange, mango or mixed berry.', price: 120, popularity_score: 74, foodCategory: { id: 5, title: 'Drinks' }, emoji: '🥤' },
    { id: 11, title: 'Thukpa', description: 'Tibetan noodle soup with bone broth, tender vegetables and hand-rolled noodles.', price: 200, popularity_score: 87, foodCategory: { id: 1, title: 'Nepali' }, emoji: '🍲' },
    { id: 12, title: 'Chocolate Lava Cake', description: 'Warm dark-chocolate cake with a molten centre, served with a scoop of vanilla ice cream.', price: 280, popularity_score: 90, foodCategory: { id: 6, title: 'Desserts' }, emoji: '🍫' },
];
