<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('repuestos', function (Blueprint $table) {
            $table->id();
            $table->string('codigo', 50)->unique();
            $table->string('nombre', 150);
            $table->text('descripcion')->nullable();
            $table->string('categoria', 80);
            $table->decimal('precio_costo', 10, 2)->default(0);
            $table->decimal('precio_venta', 10, 2)->default(0);
            $table->integer('stock_actual')->default(0);
            $table->integer('stock_minimo')->default(5);
            $table->enum('unidad', ['unidad', 'par', 'litro', 'kit', 'metro', 'juego'])->default('unidad');
            $table->string('proveedor')->nullable();
            $table->boolean('activo')->default(true);
            $table->timestamps();
        });

        Schema::create('ot_repuestos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('orden_trabajo_id')->constrained('ordenes_trabajo')->cascadeOnDelete();
            $table->foreignId('repuesto_id')->constrained('repuestos');
            $table->decimal('cantidad', 8, 2);
            $table->decimal('precio_unitario', 10, 2);
            $table->enum('estado', ['disponible', 'pendiente', 'pedido_especial'])->default('disponible');
            $table->text('notas')->nullable();
            $table->timestamps();
        });

        Schema::create('movimientos_inventario', function (Blueprint $table) {
            $table->id();
            $table->foreignId('repuesto_id')->constrained('repuestos');
            $table->enum('tipo', ['entrada', 'salida', 'ajuste']);
            $table->decimal('cantidad', 8, 2);
            $table->integer('stock_anterior');
            $table->integer('stock_nuevo');
            $table->foreignId('orden_trabajo_id')->nullable()->constrained('ordenes_trabajo')->nullOnDelete();
            $table->foreignId('usuario_id')->constrained('users');
            $table->text('notas')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('movimientos_inventario');
        Schema::dropIfExists('ot_repuestos');
        Schema::dropIfExists('repuestos');
    }
};
