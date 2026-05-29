<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ordenes_trabajo', function (Blueprint $table) {
            $table->id();
            $table->string('numero_ot', 20)->unique();
            $table->foreignId('cita_id')->nullable()->constrained('citas')->nullOnDelete();
            $table->foreignId('cliente_id')->constrained('clientes');
            $table->foreignId('motocicleta_id')->constrained('motocicletas');
            $table->foreignId('recepcionista_id')->constrained('users');
            $table->foreignId('tecnico_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('jefe_taller_id')->nullable()->constrained('users')->nullOnDelete();
            $table->enum('estado', ['recepcion', 'diagnostico', 'reparacion', 'lista', 'entregada'])->default('recepcion');
            $table->enum('prioridad', ['rapido', 'garantia', 'emergencia', 'preventivo', 'mayor'])->default('preventivo');
            $table->dateTime('fecha_ingreso');
            $table->dateTime('fecha_estimada_entrega')->nullable();
            $table->dateTime('fecha_entrega_real')->nullable();
            $table->integer('kilometraje_ingreso');
            $table->enum('nivel_combustible', ['vacio', 'reserva', 'cuarto', 'medio', 'tres_cuartos', 'lleno'])->default('medio');
            $table->text('estado_fisico');
            $table->text('accesorios_entregados')->nullable();
            $table->text('problema_reportado');
            $table->text('observaciones_generales')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ordenes_trabajo');
    }
};
