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
            $table->foreignId('table_id')->constrained();
            $table->foreignId('customer_id')->nullable()->constrained('users');
            $table->enum('status', ['pending', 'assigned', 'preparing', 'ready', 'served', 'paid', 'cancelled']);
            $table->decimal('subtotal', 10, 2);
            $table->decimal('discount_amount', 10, 2)->default(0);
            $table->decimal('total', 10, 2);
            $table->string('mood')->nullable();              // for AI (happy, sad, etc.)
            $table->decimal('customer_lat', 10, 8)->nullable();
            $table->decimal('customer_lng', 10, 8)->nullable();
            $table->timestamp('checked_out_at')->nullable();
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
    }
};
