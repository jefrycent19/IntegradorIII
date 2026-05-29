<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        $roles = [
            [
                'nombre'      => 'Administrador',
                'descripcion' => 'Acceso total al sistema. Gestión de usuarios, reportes financieros y configuración.',
                'created_at'  => now(),
                'updated_at'  => now(),
            ],
            [
                'nombre'      => 'Gerente',
                'descripcion' => 'Dashboard gerencial completo. Reportes de rentabilidad y productividad.',
                'created_at'  => now(),
                'updated_at'  => now(),
            ],
            [
                'nombre'      => 'Jefe de Taller',
                'descripcion' => 'Asigna órdenes de trabajo, aprueba diagnósticos y monitorea tiempos.',
                'created_at'  => now(),
                'updated_at'  => now(),
            ],
            [
                'nombre'      => 'Técnico',
                'descripcion' => 'Actualiza avances de OT, registra repuestos y observaciones técnicas.',
                'created_at'  => now(),
                'updated_at'  => now(),
            ],
            [
                'nombre'      => 'Recepcionista',
                'descripcion' => 'Registra ingresos de motos, agenda citas y emite documentos de recepción.',
                'created_at'  => now(),
                'updated_at'  => now(),
            ],
        ];

        DB::table('roles')->insertOrIgnore($roles);
    }
}
