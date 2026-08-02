<?php

namespace App\Services;

use App\Models\CartItem;
use App\Models\FoodItem;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cookie;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Str;

class CartService
{
    private const SessionKey = 'cart.items';

    private ?array $cachedCartItems = null;

    private bool $hasMovedCookieCartToDatabase = false;

    protected const COOKIE_NAME = 'cartItems';

    protected const COOKIE_LIFETIME = 60 * 24 * 365;   // 1 year

    /**
     * @return array<int, array{food_item_id: int, title: string, slug: string|null, price: float, quantity: int}>
     */
    public function all(): array
    {
        return $this->getCartItems();
    }

    public function addItemToCart(FoodItem $foodItem, int $quantity = 1)
    {

        $price = $foodItem->price;
        if (Auth::check()) {
            $this->saveItemToDatabase($foodItem->id, $quantity, $price);
        } else {
            $this->saveItemToCookies($foodItem->id, $quantity, $price);
        }
    }

    public function updateItemQuantity(FoodItem $foodItem, int $quantity)
    {
        if (Auth::check()) {
            $this->updateItemQuantityInDatabase($foodItem->id, $quantity);
        } else {
            $this->updateItemQuantityInCookies($foodItem->id, $quantity);
        }
    }

    public function clearCart()
    {
        if (Auth::check()) {
            $userId = Auth::id();
            CartItem::where('user_id', $userId)->delete();
            $this->cachedCartItems = null;
        } else {
            Cookie::queue(Cookie::forget(self::COOKIE_NAME));
            $this->cachedCartItems = null;
        }
    }

    public function removeItemFromCart(int $foodItemId)
    {
        if (Auth::check()) {
            $this->removeCartItemFromDatabase($foodItemId);
        } else {
            $this->removeCartItemsFromCookies($foodItemId);
        }
    }

    // public function getCartItems(): array
    // {
    //     try {
    //         if ($this->cachedCartItems === null) {
    //             if (Auth::check()) {
    //                 $cartItems = $this->getCartItemsFromDatabase();
    //             } else {
    //                 $cartItems = $this->getCartItemsFromCookies();
    //             }

    //             $foodItemIds = collect($cartItems)
    //                 ->pluck('food_item_id')
    //                 ->unique();
    //             $foodItems = FoodItem::whereIn('id', $foodItemIds)
    //                 ->get()
    //                 ->keyBy('id');

    //             $cartItemData = [];

    //             foreach ($cartItems as $cartItem) {
    //                 $foodItem = $foodItems->get($cartItem['food_item_id']);
    //                 if (!$foodItem) {
    //                     continue;
    //                 }

    //                 $cartItemData[] = [
    //                     'id' => $cartItem['id'],
    //                     'food_item_id' => $foodItem->id,
    //                     'title' => $foodItem->title,
    //                     'slug' => $foodItem->slug,
    //                     'price' => $cartItem['price'],
    //                     'quantity' => $cartItem['quantity'],
    //                 ];
    //             }

    //             // ✅ Set to cached property
    //             $this->cachedCartItems = $cartItemData;
    //         }

    //         return $this->cachedCartItems;
    //     } catch (\Exception $e) {
    //         Log::error($e->getMessage() . PHP_EOL . $e->getTraceAsString());
    //         return []; // Fallback empty array to satisfy the return type
    //     }
    // }
    public function getCartItems(): array
    {
        try {
            if ($this->cachedCartItems === null) {
                if (Auth::check()) {
                    $cartItems = $this->getCartItemsFromDatabase();
                } else {
                    $cartItems = $this->getCartItemsFromCookies();
                }

                $foodItemIds = collect($cartItems)->pluck('food_item_id')->unique();
                $foodItems = FoodItem::whereIn('id', $foodItemIds)
                    ->get()
                    ->keyBy('id');

                $cartItemData = [];

                foreach ($cartItems as $cartItem) {
                    $foodItem = $foodItems->get($cartItem['food_item_id']);
                    if (! $foodItem) {
                        continue;
                    }

                    $cartItemData[] = [
                        'id' => $cartItem['id'],
                        'food_item_id' => $foodItem->id,
                        'title' => $foodItem->title,
                        'slug' => $foodItem->slug,
                        'price' => $cartItem['price'],
                        'quantity' => $cartItem['quantity'],
                        'user' => [
                            'name' => $foodItem->name,
                        ],
                    ];
                }

                // ✅ Set to cached property
                $this->cachedCartItems = $cartItemData;
            }

            return $this->cachedCartItems;
        } catch (\Exception $e) {
            Log::error($e->getMessage().PHP_EOL.$e->getTraceAsString());

            return [];
        }
    }

    public function getTotalQuantity(): int
    {
        $totalQuantity = 0;
        foreach ($this->getCartItems() as $item) {
            $totalQuantity += $item['quantity'];
        }

        return $totalQuantity;
    }

    public function getTotalPrice(): float
    {
        $total = 0;
        foreach ($this->getCartItems() as $item) {
            $total += $item['quantity'] * $item['price'];
        }

        return $total;
    }

    public function count(): int
    {
        return $this->getTotalQuantity();
    }

    public function subtotal(): float
    {
        return $this->getTotalPrice();
    }

    protected function updateItemQuantityInDatabase(int $foodItemId, int $quantity): void
    {
        $userId = Auth::id();
        $cartItem = CartItem::where('user_id', $userId)
            ->where('food_item_id', $foodItemId)
            ->first();
        if ($cartItem) {
            $cartItem->update([
                'quantity' => $quantity,
            ]);
        }
    }

    // protected function updateItemQuantityInCookies(int $foodItemId, int $quantity): void
    // {
    //     $cartItems = $this->getCartItemsFromCookies();
    //     // Loop through cart items and update the matching food_item_id's quantity
    //     foreach ($cartItems as &$cartItem) {
    //         if (isset($cartItem['food_item_id']) && $cartItem['food_item_id'] == $foodItemId) {
    //             $cartItem['quantity'] = $quantity;
    //             break;
    //         }
    //     }
    //     unset($cartItem);

    //     Cookie::queue(self::COOKIE_NAME, json_encode($cartItems), self::COOKIE_LIFETIME);
    // }

    protected function updateItemQuantityInCookies(int $foodItemId, int $quantity): void
    {
        $cartItems = $this->getCartItemsFromCookies();
        $itemKey = $foodItemId;
        if (isset($cartItems[$itemKey])) {
            $cartItems[$itemKey]['quantity'] = $quantity;
        }
        Cookie::queue(self::COOKIE_NAME, json_encode($cartItems), self::COOKIE_LIFETIME);
    }

    protected function saveItemToDatabase(int $foodItemId, int $quantity, $price): void
    {
        $userId = Auth::id();
        $cartItem = CartItem::where('user_id', $userId)
            ->where('food_item_id', $foodItemId)
            ->first();
        if ($cartItem) {
            $cartItem->update([
                'quantity' => DB::raw('quantity +'.$quantity),
            ]);
        } else {
            CartItem::create([
                'user_id' => $userId,
                'food_item_id' => $foodItemId,
                'quantity' => $quantity,
                'price' => $price,
            ]);
        }
    }

    protected function saveItemToCookies(int $foodItemId, int $quantity, float $price): void
    {
        $cartItems = $this->getCartItemsFromCookies();

        $itemKey = (string) $foodItemId;

        if (isset($cartItems[$itemKey])) {
            $cartItems[$itemKey]['quantity'] += $quantity;
            $cartItems[$itemKey]['price'] = $price;
        } else {
            $cartItems[$itemKey] = [
                'id' => (string) Str::uuid(),
                'food_item_id' => $foodItemId,
                'quantity' => $quantity,
                'price' => $price,
            ];
        }

        Cookie::queue(
            self::COOKIE_NAME,
            json_encode($cartItems),
            self::COOKIE_LIFETIME
        );
    }

    private function removeCartItemFromDatabase(int $foodItemId)
    {
        $userId = Auth::id();
        CartItem::where('user_id', $userId)
            ->where('food_item_id', $foodItemId)
            ->delete();
    }

    protected function removeCartItemsFromCookies(int $foodItemId): void
    {
        $cartItems = $this->getCartItemsFromCookies();
        unset($cartItems[(string) $foodItemId]);
        Cookie::queue(self::COOKIE_NAME, json_encode($cartItems), self::COOKIE_LIFETIME);
    }

    protected function getCartItemsFromDatabase(): array
    {
        return CartItem::where('user_id', Auth::id())
            ->get()
            ->map(function ($cartItem) {
                return [
                    'id' => $cartItem->id,
                    'food_item_id' => $cartItem->food_item_id,
                    'quantity' => $cartItem->quantity,
                    'price' => $cartItem->price,
                ];
            })
            ->toArray();
    }

    protected function getCartItemsFromCookies(): array
    {
        $cookie = Cookie::get(self::COOKIE_NAME);

        if (is_null($cookie)) {
            return [];
        }

        $decoded = json_decode($cookie, true);

        return is_array($decoded) ? $decoded : [];
    }

    public function getCartItemsGrouped(): array
    {
        $cartItems = $this->getCartItems();

        return collect($cartItems)
            ->groupBy(fn ($item) => $item['user']['id'])
            ->map(fn ($items, $userId) => [
                'user' => $items->first()['user'],
                'items' => $items->toArray(),
                'totalQuantity' => $items->sum('quantity'),
                'totalPrice' => $items->sum(fn ($item) => $item['price'] * $item['quantity']),
            ])->toArray();
    }

    public function moveCartItemsToDatabase($userId): void
    {
        if ($this->hasMovedCookieCartToDatabase) {
            return;
        }

        $this->hasMovedCookieCartToDatabase = true;
        $cartItems = $this->getCartItemsFromCookies();

        if ($cartItems === []) {
            return;
        }

        foreach ($cartItems as $cartItem) {
            $existingItem = CartItem::where('user_id', $userId)
                ->where('food_item_id', $cartItem['food_item_id'])
                ->first();

            if ($existingItem) {
                $existingItem->update([
                    'quantity' => max($existingItem->quantity, $cartItem['quantity']),
                    'price' => $cartItem['price'],
                ]);
            } else {
                CartItem::create([
                    'user_id' => $userId,
                    'food_item_id' => $cartItem['food_item_id'],
                    'quantity' => $cartItem['quantity'],
                    'price' => $cartItem['price'],
                ]);
            }
        }

        Cookie::queue(Cookie::forget(self::COOKIE_NAME));
        $this->cachedCartItems = null;
    }

    private function put(array $items): void
    {
        Session::put(self::SessionKey, $items);
    }
}
