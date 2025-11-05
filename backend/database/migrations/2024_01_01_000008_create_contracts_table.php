<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('contracts', function (Blueprint $table) {
            $table->id();
            $table->string('contract_number')->unique();
            $table->string('company_name');
            $table->string('accountcode')->unique();
            $table->text('company_address');
            $table->string('contact_person');
            $table->string('contact_phone');
            $table->string('contact_email');
            $table->date('start_date');
            $table->date('end_date');
            $table->enum('status', ['active', 'suspended', 'terminated'])->default('active');
            $table->decimal('monthly_fee', 10, 2)->default(0);
            $table->text('notes')->nullable();
            $table->timestamps();
            
            $table->index(['accountcode', 'status']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('contracts');
    }
};