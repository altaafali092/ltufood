<?php

use App\Models\FoodItem;
use App\Models\Table;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('scanning table QR code sets table session and redirects to home', function () {
    $table = Table::create([
        'table_number' => 'T-99',
        'qr_uuid' => 'test-qr-uuid-1234',
        'radius_meters' => 50,
    ]);

    $response = $this->get("/table/{$table->qr_uuid}");

    $response->assertRedirect(route('home'));
    $response->assertSessionHas('table_id', $table->id);
    $response->assertSessionHas('table_number', 'T-99');
});

test('scanning invalid QR code returns 404', function () {
    $this->get('/table/non-existent-uuid')->assertNotFound();
});

test('placing an order automatically uses table_id from session', function () {
    $user = User::factory()->create();

    $table = Table::create([
        'table_number' => 'T-100',
        'qr_uuid' => 'test-qr-uuid-5678',
        'radius_meters' => 50,
    ]);

    $foodItem = FoodItem::create([
        'title' => 'Test Food',
        'slug' => 'test-food',
        'price' => 15.00,
        'status' => true,
        'popularity_score' => 10,
    ]);

    // Simulate scanning QR code
    $this->get("/table/{$table->qr_uuid}");

    // Add item to cart and place order as user
    $this->actingAs($user)
        ->post(route('cartStore', $foodItem->id), [
            'quantity' => 2,
        ]);

    $response = $this->actingAs($user)
        ->post(route('ordersStore'), [
            'payment_method' => 'cash_at_reception',
        ]);

    $response->assertSessionHasNoErrors();

    $this->assertDatabaseHas('orders', [
        'table_id' => $table->id,
        'order_type' => 'dine_in',
        'subtotal' => 30.00,
    ]);

    $table->refresh();
    expect($table->is_occupied)->toBeTrue();
});
