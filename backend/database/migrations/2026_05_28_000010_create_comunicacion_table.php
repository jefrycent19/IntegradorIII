<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notificaciones', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cliente_id')->constrained('clientes')->cascadeOnDelete();
            $table->foreignId('orden_trabajo_id')->nullable()->constrained('ordenes_trabajo')->nullOnDelete();
            $table->enum('tipo', ['moto_recibida', 'diagnostico_listo', 'aprobacion_requerida', 'moto_lista', 'factura_generada', 'garantia_aprobada']);
            $table->text('mensaje');
            $table->enum('canal', ['email', 'sms', 'whatsapp', 'push'])->default('email');
            $table->enum('estado', ['pendiente', 'enviada', 'fallida'])->default('pendiente');
            $table->dateTime('fecha_envio')->nullable();
            $table->timestamps();
        });

        Schema::create('encuestas_satisfaccion', function (Blueprint $table) {
            $table->id();
            $table->foreignId('orden_trabajo_id')->constrained('ordenes_trabajo')->cascadeOnDelete();
            $table->foreignId('cliente_id')->constrained('clientes');
            $table->tinyInteger('puntuacion');
            $table->text('comentario')->nullable();
            $table->dateTime('fecha');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('encuestas_satisfaccion');
        Schema::dropIfExists('notificaciones');
    }
};
