<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('evidencias', function (Blueprint $table) {
            $table->id();
            $table->foreignId('orden_trabajo_id')->constrained('ordenes_trabajo')->cascadeOnDelete();
            $table->enum('tipo', ['foto', 'video', 'audio', 'documento']);
            $table->string('url');
            $table->string('descripcion')->nullable();
            $table->enum('etapa', ['recepcion', 'diagnostico', 'reparacion', 'entrega', 'garantia']);
            $table->foreignId('subido_por_id')->constrained('users');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('evidencias');
    }
};
