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
        Schema::create('rates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('rate_group_id')->constrained()->onDelete('cascade');
            $table->string('rate_prefix', 20);
            $table->string('area_prefix', 100);
            $table->enum('rate_type', ['per_minute', 'per_second', 'flat_rate']);
            $table->decimal('billing_rate', 10, 4);
            $table->integer('billing_cycle');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rates');
    }
};
