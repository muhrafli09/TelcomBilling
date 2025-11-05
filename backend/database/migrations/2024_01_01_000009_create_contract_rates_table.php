<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('contract_rates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('contract_id')->constrained()->onDelete('cascade');
            $table->string('destination_prefix');
            $table->string('destination_name');
            $table->decimal('rate_per_minute', 8, 4);
            $table->integer('minimum_duration')->default(1);
            $table->integer('billing_increment')->default(1);
            $table->decimal('connection_fee', 8, 4)->default(0);
            $table->boolean('active')->default(true);
            $table->timestamps();
            
            $table->index(['contract_id', 'destination_prefix']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('contract_rates');
    }
};