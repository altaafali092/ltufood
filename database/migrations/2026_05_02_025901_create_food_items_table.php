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
        Schema::create('food_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('food_category_id')->constrained()->cascadeOnDelete()->nullable();
            $table->string('title');
            $table->longText('description')->nullable();
            $table->decimal('price', 8, 2);
            $table->string('images')->nullable();
            $table->boolean('status')->default(true);
            $table->integer('popularity_score')->default(0); // updated by AI cron
            $table->json('tags')->nullable();
            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('food_items');
    }
};
