<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {

            $table->id();

            // Unique Human-Readable Order Reference Number (e.g. ORD-2026-0001)
            $table->string('order_number')->unique();
            $table->foreignId('table_id')->nullable()->constrained()->onDelete('cascade');
            $table->foreignId('customer_id')->nullable()->constrained('users')->onDelete('set null');

            $table->string('order_type')->default('dine_in');
            // status: 'pending', 'processing', 'completed', 'cancelled'
            $table->string('status')->default('pending');

            // Payment Details (eSewa & Cash at Reception)
            // payment_method: 'esewa', 'cash_at_reception', 'card', 'khalti'
            $table->string('payment_method')->nullable();
            // payment_status: 'unpaid', 'paid', 'failed', 'refunded'
            $table->string('payment_status')->default('unpaid');

            // eSewa Specific Tracking Fields
            $table->string('esewa_transaction_id')->nullable()->comment('eSewa ref_id / transaction_code');
            $table->string('transaction_uuid')->nullable()->unique()->comment('Unique ID passed to eSewa payload');

            // Financials
            $table->decimal('subtotal', 10, 2);
            $table->decimal('discount_amount', 10, 2)->default(0);
            $table->decimal('tax_amount', 10, 2)->default(0); // Optional VAT/Service charges
            $table->decimal('total', 10, 2);

            // Reception / POS Cash Handling
            $table->decimal('cash_received', 10, 2)->nullable();
            $table->decimal('change_given', 10, 2)->nullable();

            // AI Features & Location
            $table->string('mood')->nullable(); // for AI (happy, sad, etc.)
            $table->decimal('customer_lat', 10, 8)->nullable();
            $table->decimal('customer_lng', 10, 8)->nullable();
            $table->text('notes')->nullable(); // Kitchen / Delivery instructions

            // Timestamps
            $table->timestamp('checked_out_at')->nullable();
            $table->timestamp('paid_at')->nullable(); // Timestamp when payment was completed
            $table->softDeletes();
            $table->timestamps();
        });

        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->foreignId('food_item_id')->constrained()->cascadeOnDelete();

            // Item Details
            $table->integer('quantity')->default(1);
            $table->decimal('price_at_time', 10, 2); // Base price per unit at checkout
            $table->decimal('total_price', 10, 2);    // (quantity * price_at_time) - discount
            $table->string('status')->default('pending');
            $table->decimal('discount_amount', 10, 2)->default(0);
            $table->text('special_notes')->nullable(); // e.g., "No onions", "Less salt"
            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
        Schema::dropIfExists('order_items');
    }
};
