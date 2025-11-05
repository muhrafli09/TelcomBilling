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
        Schema::create('cdr', function (Blueprint $table) {
            $table->id();
            $table->string('calldate')->index();
            $table->string('clid')->nullable();
            $table->string('src')->index();
            $table->string('dst')->index();
            $table->string('dcontext')->nullable();
            $table->string('channel')->nullable();
            $table->string('dstchannel')->nullable();
            $table->string('lastapp')->nullable();
            $table->string('lastdata')->nullable();
            $table->integer('duration')->default(0);
            $table->integer('billsec')->default(0);
            $table->string('disposition')->nullable();
            $table->integer('amaflags')->default(0);
            $table->string('accountcode')->index(); // Tenant identifier
            $table->string('uniqueid')->unique();
            $table->string('userfield')->nullable();
            $table->decimal('cost', 10, 4)->default(0);
            $table->foreignId('tenant_id')->nullable()->constrained()->onDelete('set null');
            $table->timestamps();
            
            $table->index(['calldate', 'accountcode']);
            $table->index(['src', 'dst']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cdr');
    }
};
