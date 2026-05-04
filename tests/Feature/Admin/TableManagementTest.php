<?php

use App\Models\Table;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

test('admin can view tables page', function () {
    $user = User::factory()->create();
    $table = Table::create([
        'table_number' => 'T-01',
        'qr_uuid' => fake()->uuid(),
        'radius_meters' => 50,
    ]);

    $this->actingAs($user)
        ->get(route('admin.tables.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Table/Index')
            ->has('tables', 1)
            ->where('tables.0.id', $table->id)
        );
});

test('admin can create a table with qr code', function () {
    Storage::fake('public');

    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('admin.tables.store'), [
            'table_number' => 'T-02',
            'lat' => '28.05000000',
            'lng' => '81.61670000',
            'radius_meters' => 60,
        ])
        ->assertRedirect(route('admin.tables.index'));

    $table = Table::where('table_number', 'T-02')->firstOrFail();

    expect($table->qr_uuid)->not->toBeNull()
        ->and($table->qr_code_image)->not->toBeNull()
        ->and($table->radius_meters)->toBe(60);

    Storage::disk('public')->assertExists($table->qr_code_image);
});

test('admin can update a table', function () {
    $user = User::factory()->create();
    $table = Table::create([
        'table_number' => 'T-03',
        'qr_uuid' => fake()->uuid(),
        'radius_meters' => 50,
    ]);

    $this->actingAs($user)
        ->put(route('admin.tables.update', $table), [
            'table_number' => 'T-03A',
            'lat' => null,
            'lng' => null,
            'radius_meters' => 75,
            'is_occupied' => true,
        ])
        ->assertRedirect(route('admin.tables.index'));

    $table->refresh();

    expect($table->table_number)->toBe('T-03A')
        ->and($table->radius_meters)->toBe(75)
        ->and($table->is_occupied)->toBeTrue();
});
