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
        Schema::create('active_calls', function (Blueprint $table) {
            $table->id();
            $table->string('uniqueid')->unique();
            $table->string('channel');
            $table->string('src');
            $table->string('dst');
            $table->string('context');
            $table->string('accountcode')->index();
            $table->string('state')->default('RINGING'); // RINGING, ANSWERED, HANGUP
            $table->timestamp('start_time');
            $table->timestamp('answer_time')->nullable();
            $table->timestamp('end_time')->nullable();
            $table->integer('duration')->default(0);
            $table->foreignId('tenant_id')->nullable()->constrained()->onDelete('set null');
            $table->timestamps();
            
            $table->index(['accountcode', 'state']);
            $table->index('start_time');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('active_calls');
    }
};
