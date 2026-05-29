<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('citas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cliente_id')->constrained('clientes')->cascadeOnDelete();
            $table->foreignId('motocicleta_id')->constrained('motocicletas')->cascadeOnDelete();
            $table->foreignId('recepcionista_id')->constrained('users');
            $table->dateTime('fecha_hora');
            $table->integer('duracion_estimada_min')->default(60);
            $table->enum('tipo_servicio', ['preventivo', 'reparacion', 'diagnostico', 'garantia', 'emergencia']);
            $table->text('descripcion_problema');
            $table->enum('estado', ['pendiente', 'confirmada', 'cancelada', 'completada'])->default('pendiente');
            $table->text('notas')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('citas');
    }
};
