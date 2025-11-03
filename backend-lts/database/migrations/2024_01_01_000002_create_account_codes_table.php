<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('account_codes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('account_code');
            $table->decimal('rate_per_second', 8, 2)->default(7.50);
            $table->timestamps();
            
            $table->unique(['user_id', 'account_code']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('account_codes');
    }
};