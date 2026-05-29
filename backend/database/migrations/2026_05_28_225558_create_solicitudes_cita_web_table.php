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
        Schema::create('solicitudes_cita_web', function (Blueprint $table) {
            $table->id();
            $table->string('nombre');
            $table->string('telefono', 20);
            $table->string('email')->nullable();
            $table->string('marca_moto', 50);
            $table->string('placa_moto', 20);
            $table->string('tipo_servicio', 30);
            $table->date('fecha_preferida');
            $table->text('descripcion');
            $table->enum('estado', ['pendiente', 'contactado', 'confirmado', 'descartado'])->default('pendiente');
            $table->timestamp('created_at')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('solicitudes_cita_web');
    }
};
