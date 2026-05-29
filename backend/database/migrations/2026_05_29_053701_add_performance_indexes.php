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
        // ordenes_trabajo — columnas más consultadas
        Schema::table('ordenes_trabajo', function (Blueprint $table) {
            $table->index('estado',              'idx_ot_estado');
            $table->index('prioridad',           'idx_ot_prioridad');
            $table->index('fecha_ingreso',       'idx_ot_fecha_ingreso');
            $table->index('fecha_entrega_real',  'idx_ot_fecha_entrega');
            $table->index(['estado', 'tecnico_id'], 'idx_ot_estado_tecnico');
        });

        // clientes — búsqueda por nombre y cédula
        Schema::table('clientes', function (Blueprint $table) {
            $table->index('activo',   'idx_clientes_activo');
            $table->index(['nombre', 'apellido'], 'idx_clientes_nombre');
        });

        // motocicletas — búsqueda frecuente
        Schema::table('motocicletas', function (Blueprint $table) {
            $table->index('activo', 'idx_motos_activo');
        });

        // repuestos — stock y búsqueda
        Schema::table('repuestos', function (Blueprint $table) {
            $table->index('activo',       'idx_repuestos_activo');
            $table->index('stock_actual', 'idx_repuestos_stock');
            $table->index('categoria',    'idx_repuestos_categoria');
        });

        // facturas — filtros por estado y fecha
        Schema::table('facturas', function (Blueprint $table) {
            $table->index('estado', 'idx_facturas_estado');
            $table->index('fecha',  'idx_facturas_fecha');
        });

        // citas — filtros por estado y fecha
        Schema::table('citas', function (Blueprint $table) {
            $table->index('estado',     'idx_citas_estado');
            $table->index('fecha_hora', 'idx_citas_fecha');
        });

        // ot_tiempos_etapa — consultas del semáforo
        Schema::table('ot_tiempos_etapa', function (Blueprint $table) {
            $table->index('semaforo', 'idx_semaforo');
            $table->index('fin',      'idx_tiempos_fin');
        });

        // notificaciones
        Schema::table('notificaciones', function (Blueprint $table) {
            $table->index('estado', 'idx_notif_estado');
        });
    }

    public function down(): void
    {
        Schema::table('ordenes_trabajo',  fn($t) => $t->dropIndex(['idx_ot_estado', 'idx_ot_prioridad', 'idx_ot_fecha_ingreso', 'idx_ot_fecha_entrega', 'idx_ot_estado_tecnico']));
        Schema::table('clientes',         fn($t) => $t->dropIndex(['idx_clientes_activo', 'idx_clientes_nombre']));
        Schema::table('motocicletas',     fn($t) => $t->dropIndex('idx_motos_activo'));
        Schema::table('repuestos',        fn($t) => $t->dropIndex(['idx_repuestos_activo', 'idx_repuestos_stock', 'idx_repuestos_categoria']));
        Schema::table('facturas',         fn($t) => $t->dropIndex(['idx_facturas_estado', 'idx_facturas_fecha']));
        Schema::table('citas',            fn($t) => $t->dropIndex(['idx_citas_estado', 'idx_citas_fecha']));
        Schema::table('ot_tiempos_etapa', fn($t) => $t->dropIndex(['idx_semaforo', 'idx_tiempos_fin']));
        Schema::table('notificaciones',   fn($t) => $t->dropIndex('idx_notif_estado'));
    }
};
