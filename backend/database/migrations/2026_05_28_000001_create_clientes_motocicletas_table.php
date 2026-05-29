<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('clientes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('nombre', 100);
            $table->string('apellido', 100);
            $table->string('cedula', 20)->unique();
            $table->string('telefono', 20);
            $table->string('telefono_alt', 20)->nullable();
            $table->string('email')->nullable();
            $table->string('direccion')->nullable();
            $table->text('notas')->nullable();
            $table->boolean('activo')->default(true);
            $table->timestamps();
        });

        Schema::create('motocicletas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cliente_id')->constrained('clientes')->cascadeOnDelete();
            $table->string('marca', 50);
            $table->string('modelo', 100);
            $table->year('anio');
            $table->string('placa', 20)->unique();
            $table->string('color', 50);
            $table->string('numero_chasis', 50)->nullable();
            $table->string('numero_motor', 50)->nullable();
            $table->integer('kilometraje_actual')->default(0);
            $table->string('foto_url')->nullable();
            $table->text('notas')->nullable();
            $table->boolean('activo')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('motocicletas');
        Schema::dropIfExists('clientes');
    }
};
