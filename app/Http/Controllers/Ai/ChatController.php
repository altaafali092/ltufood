<?php

namespace App\Http\Controllers\Ai;

use App\Ai\Agents\ChatAgent;
use App\Http\Controllers\Controller;
use App\Models\FoodItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Throwable;

class ChatController extends Controller
{
    public function chat()
    {
        return Inertia::render('Ai/Chat', [
            'foodItems' => FoodItem::query()
                ->where('status', true)
                ->with('subCategory:id,title')
                ->orderByDesc('popularity_score')
                ->get([
                    'id',
                    'title',
                    'slug',
                    'description',
                    'price',
                    'images',
                    'status',
                    'tags',
                    'popularity_score',
                    'sub_category_id',
                ]),
        ]);
    }

    public function sendMessage(Request $request)
    {
        $validated = $request->validate([
            'message' => ['required', 'string', 'max:2000'],
            'selected_food_item_id' => ['nullable', 'integer', 'exists:food_items,id'],
            'history' => ['array', 'max:30'],
            'history.*.role' => ['required', 'string', 'in:user,assistant'],
            'history.*.content' => ['required', 'string', 'max:2000'],
        ]);

        $foodItems = FoodItem::query()
            ->where('status', true)
            ->with('subCategory:id,title')
            ->orderByDesc('popularity_score')
            ->get();

        $selectedFoodItem = $foodItems->firstWhere(
            'id',
            $validated['selected_food_item_id'] ?? null,
        );

        $context = collect($foodItems)->map(fn (FoodItem $foodItem): array => [
            'title' => $foodItem->title,
            'price' => $foodItem->price,
            'description' => $foodItem->description,
            'tags' => $foodItem->tags ?? [],
            'sub_category' => [
                'title' => $foodItem->subCategory?->title,
            ],
        ])->all();

        $prompt = $selectedFoodItem
            ? sprintf(
                "The customer is currently viewing '%s' (NPR %s). Their question is: %s",
                $selectedFoodItem->title,
                $selectedFoodItem->price,
                $validated['message'],
            )
            : $validated['message'];

        try {
            $response = retry(
                2,
                fn () => (new ChatAgent($context, $validated['history'] ?? []))->prompt($prompt),
                500,
            );
        } catch (Throwable $exception) {
            Log::error('Food assistant request failed.', [
                'exception' => $exception,
                'selected_food_item_id' => $validated['selected_food_item_id'] ?? null,
            ]);

            return response()->json([
                'message' => 'The food assistant is temporarily unavailable. Please try again in a moment.',
            ], 503);
        }
        $recommendation = $selectedFoodItem;

        if (! $recommendation) {
            $recommendation = $foodItems->first(
                fn (FoodItem $foodItem): bool => str_contains(
                    strtolower($response->text),
                    strtolower($foodItem->title),
                ),
            ) ?? $foodItems->first();
        }

        return response()->json([
            'message' => $response->text,
            'recommendation' => $recommendation?->toArray(),
        ]);
    }
}
