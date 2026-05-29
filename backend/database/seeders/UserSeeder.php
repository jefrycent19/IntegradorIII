<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $adminRolId = DB::table('roles')->where('nombre', 'Administrador')->value('id');

        DB::table('users')->insertOrIgnore([
            [
                'rol_id'     => $adminRolId,
                'nombre'     => 'Admin',
                'apellido'   => 'Taller',
                'email'      => 'admin@taller.com',
                'password'   => Hash::make('Admin1234!'),
                'telefono'   => '8888-0000',
                'activo'     => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
