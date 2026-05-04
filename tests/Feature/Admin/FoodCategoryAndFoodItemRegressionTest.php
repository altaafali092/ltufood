<?php

use App\Models\FoodCategory;
use App\Models\FoodItem;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

uses(RefreshDatabase::class);

test('food category store completes without dumping the request payload', function () {
    Storage::fake('public');

    $user = User::factory()->create();

    $response = $this->actingAs($user)->post(route('admin.food-categories.store'), [
        'title' => 'Desserts',
        'slug' => 'desserts',
        'description' => 'Sweet menu items.',
        'image' => UploadedFile::fake()->image('desserts.jpg'),
    ]);

    $response->assertRedirect(route('admin.food-categories.index'));

    $this->assertDatabaseHas('food_categories', [
        'title' => 'Desserts',
        'slug' => 'desserts',
    ]);
});

test('food item exposes formatted_images separately from raw images', function () {
    Storage::fake('public');
    Storage::disk('public')->put('food_items/sample.jpg', 'sample-image');

    $foodCategory = FoodCategory::create([
        'title' => 'Main Course',
        'slug' => 'main-course',
    ]);

    $foodItem = FoodItem::create([
        'food_category_id' => $foodCategory->id,
        'title' => 'Burger',
        'slug' => 'burger',
        'description' => 'A test item',
        'price' => 10,
        'images' => ['food_items/sample.jpg'],
        'status' => true,
        'tags' => ['featured'],
        'popularity_score' => 1,
    ])->fresh();

    expect($foodItem->images)->toBe(['food_items/sample.jpg'])
        ->and($foodItem->formatted_images)->toBe([
            Storage::disk('public')->url('food_items/sample.jpg'),
        ])
        ->and($foodItem->toArray())->toHaveKey('formatted_images');
});
