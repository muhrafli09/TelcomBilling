<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('rate_cards', function (Blueprint $table) {
            $table->id();
            $table->string('destination_prefix', 20)->index();
            $table->string('destination_name');
            $table->decimal('rate_per_minute', 8, 4);
            $table->integer('minimum_duration')->default(1);
            $table->integer('billing_increment')->default(1);
            $table->decimal('connection_fee', 8, 4)->default(0);
            $table->boolean('active')->default(true);
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('rate_cards');
    }
};