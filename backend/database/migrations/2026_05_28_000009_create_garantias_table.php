<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('garantias', function (Blueprint $table) {
            $table->id();
            $table->foreignId('orden_trabajo_id')->constrained('ordenes_trabajo')->cascadeOnDelete();
            $table->foreignId('factura_id')->nullable()->constrained('facturas')->nullOnDelete();
            $table->text('descripcion');
            $table->date('fecha_inicio');
            $table->date('fecha_fin');
            $table->boolean('cubre_repuestos')->default(true);
            $table->boolean('cubre_mano_obra')->default(true);
            $table->enum('estado', ['activa', 'reclamada', 'vencida', 'rechazada'])->default('activa');
            $table->text('notas')->nullable();
            $table->timestamps();
        });

        Schema::create('reclamos_garantia', function (Blueprint $table) {
            $table->id();
            $table->foreignId('garantia_id')->constrained('garantias')->cascadeOnDelete();
            $table->dateTime('fecha_reclamo');
            $table->text('descripcion_problema');
            $table->enum('estado', ['pendiente', 'en_revision', 'aprobado', 'rechazado'])->default('pendiente');
            $table->text('resolucion')->nullable();
            $table->dateTime('fecha_resolucion')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reclamos_garantia');
        Schema::dropIfExists('garantias');
    }
};
