<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ot_tiempos_etapa', function (Blueprint $table) {
            $table->id();
            $table->foreignId('orden_trabajo_id')->constrained('ordenes_trabajo')->cascadeOnDelete();
            $table->enum('etapa', ['recepcion', 'diagnostico', 'aprobacion', 'repuestos', 'reparacion', 'entrega']);
            $table->dateTime('inicio');
            $table->dateTime('fin')->nullable();
            $table->decimal('tiempo_limite_horas', 5, 2);
            $table->enum('semaforo', ['verde', 'amarillo', 'rojo'])->default('verde');
            $table->timestamps();
        });

        Schema::create('ot_avances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('orden_trabajo_id')->constrained('ordenes_trabajo')->cascadeOnDelete();
            $table->foreignId('tecnico_id')->constrained('users');
            $table->text('descripcion');
            $table->dateTime('fecha_hora');
            $table->timestamps();
        });

        Schema::create('diagnosticos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('orden_trabajo_id')->constrained('ordenes_trabajo')->cascadeOnDelete();
            $table->foreignId('tecnico_id')->constrained('users');
            $table->text('descripcion_fallas');
            $table->decimal('mano_obra_estimada', 10, 2)->default(0);
            $table->decimal('tiempo_estimado_horas', 5, 2)->default(1);
            $table->enum('prioridad_sugerida', ['rapido', 'garantia', 'emergencia', 'preventivo', 'mayor'])->nullable();
            $table->enum('estado', ['esperando_aprobacion', 'esperando_repuestos', 'aprobado', 'rechazado'])->default('esperando_aprobacion');
            $table->text('observaciones')->nullable();
            $table->dateTime('fecha_diagnostico');
            $table->dateTime('fecha_aprobacion')->nullable();
            $table->foreignId('aprobado_por_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('checklist_entrega', function (Blueprint $table) {
            $table->id();
            $table->foreignId('orden_trabajo_id')->constrained('ordenes_trabajo')->cascadeOnDelete();
            $table->boolean('prueba_realizada')->default(false);
            $table->boolean('lavado')->default(false);
            $table->boolean('calidad_revisada')->default(false);
            $table->boolean('facturacion_lista')->default(false);
            $table->boolean('cliente_notificado')->default(false);
            $table->text('notas')->nullable();
            $table->foreignId('revisado_por_id')->constrained('users');
            $table->dateTime('fecha');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('checklist_entrega');
        Schema::dropIfExists('diagnosticos');
        Schema::dropIfExists('ot_avances');
        Schema::dropIfExists('ot_tiempos_etapa');
    }
};
