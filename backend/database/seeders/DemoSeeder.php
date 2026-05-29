<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class DemoSeeder extends Seeder
{
    public function run(): void
    {
        $roles = DB::table('roles')->pluck('id', 'nombre');

        // Usuarios demo
        $users = [
            ['nombre' => 'Carlos',   'apellido' => 'Rodríguez', 'email' => 'jefe@taller.com',         'rol' => 'Jefe de Taller'],
            ['nombre' => 'María',    'apellido' => 'Jiménez',   'email' => 'recepcion@taller.com',     'rol' => 'Recepcionista'],
            ['nombre' => 'Luis',     'apellido' => 'Vargas',    'email' => 'tecnico1@taller.com',      'rol' => 'Técnico'],
            ['nombre' => 'Andrés',   'apellido' => 'Mora',      'email' => 'tecnico2@taller.com',      'rol' => 'Técnico'],
            ['nombre' => 'Roberto',  'apellido' => 'Solano',    'email' => 'gerente@taller.com',       'rol' => 'Gerente'],
        ];

        $userIds = [];
        foreach ($users as $u) {
            $id = DB::table('users')->insertGetId([
                'rol_id'   => $roles[$u['rol']],
                'nombre'   => $u['nombre'],
                'apellido' => $u['apellido'],
                'email'    => $u['email'],
                'password' => Hash::make('Demo1234!'),
                'telefono' => '8' . rand(100, 999) . '-' . rand(1000, 9999),
                'activo'   => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            $userIds[$u['email']] = $id;
        }

        // Técnicos
        foreach (['tecnico1@taller.com', 'tecnico2@taller.com'] as $email) {
            DB::table('tecnicos')->insert([
                'user_id'                   => $userIds[$email],
                'especialidades'            => json_encode(['Motor', 'Frenos', 'Electrica']),
                'horas_diarias_disponibles' => 8.0,
                'activo'                    => true,
                'created_at'                => now(),
                'updated_at'                => now(),
            ]);
        }

        // Clientes
        $clientesData = [
            ['nombre' => 'Juan',    'apellido' => 'Pérez',    'cedula' => '101110111', 'telefono' => '8888-1111', 'email' => 'juan@demo.com'],
            ['nombre' => 'Ana',     'apellido' => 'González', 'cedula' => '202220222', 'telefono' => '8888-2222', 'email' => 'ana@demo.com'],
            ['nombre' => 'Miguel',  'apellido' => 'Castro',   'cedula' => '303330333', 'telefono' => '8888-3333', 'email' => 'miguel@demo.com'],
            ['nombre' => 'Sofía',   'apellido' => 'Ramírez',  'cedula' => '404440444', 'telefono' => '8888-4444', 'email' => 'sofia@demo.com'],
        ];

        $clienteIds = [];
        foreach ($clientesData as $c) {
            $clienteIds[] = DB::table('clientes')->insertGetId(array_merge($c, ['activo' => true, 'created_at' => now(), 'updated_at' => now()]));
        }

        // Motocicletas
        $motos = [
            ['cliente_id' => $clienteIds[0], 'marca' => 'Honda',    'modelo' => 'CB500F',   'anio' => 2021, 'placa' => 'ABC-123', 'color' => 'Rojo',    'kilometraje_actual' => 18500],
            ['cliente_id' => $clienteIds[0], 'marca' => 'Yamaha',   'modelo' => 'MT-07',    'anio' => 2022, 'placa' => 'ABC-456', 'color' => 'Negro',   'kilometraje_actual' => 9200],
            ['cliente_id' => $clienteIds[1], 'marca' => 'Kawasaki', 'modelo' => 'Ninja 400','anio' => 2020, 'placa' => 'DEF-789', 'color' => 'Verde',   'kilometraje_actual' => 32000],
            ['cliente_id' => $clienteIds[2], 'marca' => 'Suzuki',   'modelo' => 'GSX-R600', 'anio' => 2019, 'placa' => 'GHI-321', 'color' => 'Azul',    'kilometraje_actual' => 45000],
            ['cliente_id' => $clienteIds[3], 'marca' => 'BMW',      'modelo' => 'G310R',    'anio' => 2023, 'placa' => 'JKL-654', 'color' => 'Blanco',  'kilometraje_actual' => 5100],
        ];

        $motoIds = [];
        foreach ($motos as $m) {
            $motoIds[] = DB::table('motocicletas')->insertGetId(array_merge($m, ['activo' => true, 'created_at' => now(), 'updated_at' => now()]));
        }

        // Repuestos
        $repuestosData = [
            ['codigo' => 'REP-001', 'nombre' => 'Filtro de aceite Honda',     'categoria' => 'Filtros',  'precio_costo' => 3500,  'precio_venta' => 6500,  'stock_actual' => 12, 'stock_minimo' => 5],
            ['codigo' => 'REP-002', 'nombre' => 'Pastillas de freno delanteras','categoria' => 'Frenos',  'precio_costo' => 8000,  'precio_venta' => 15000, 'stock_actual' => 3,  'stock_minimo' => 5],
            ['codigo' => 'REP-003', 'nombre' => 'Aceite 10W40 sintético 1L',  'categoria' => 'Aceites',  'precio_costo' => 4500,  'precio_venta' => 8000,  'stock_actual' => 25, 'stock_minimo' => 10],
            ['codigo' => 'REP-004', 'nombre' => 'Bujía NGK iridium',          'categoria' => 'Motor',    'precio_costo' => 5000,  'precio_venta' => 9500,  'stock_actual' => 8,  'stock_minimo' => 5],
            ['codigo' => 'REP-005', 'nombre' => 'Cadena de transmisión 520',  'categoria' => 'Transmision','precio_costo' => 22000, 'precio_venta' => 38000, 'stock_actual' => 2,  'stock_minimo' => 3],
            ['codigo' => 'REP-006', 'nombre' => 'Llanta trasera 150/70-17',   'categoria' => 'Llantas',  'precio_costo' => 35000, 'precio_venta' => 58000, 'stock_actual' => 4,  'stock_minimo' => 2],
        ];

        foreach ($repuestosData as $r) {
            DB::table('repuestos')->insert(array_merge($r, ['unidad' => 'unidad', 'activo' => true, 'created_at' => now(), 'updated_at' => now()]));
        }

        // Órdenes de trabajo en diferentes estados
        $recepcionistaId = $userIds['recepcion@taller.com'];
        $tecnico1Id      = $userIds['tecnico1@taller.com'];
        $tecnico2Id      = $userIds['tecnico2@taller.com'];
        $jefeTallerId    = $userIds['jefe@taller.com'];

        $otData = [
            ['cliente_id' => $clienteIds[0], 'moto_idx' => 0, 'estado' => 'reparacion', 'prioridad' => 'mayor',      'tecnico' => $tecnico1Id, 'problema' => 'Motor con ruido extraño al acelerar, posible problema en árbol de levas.',     'num' => 'OT-2026-00001', 'dias' => -5],
            ['cliente_id' => $clienteIds[1], 'moto_idx' => 2, 'estado' => 'diagnostico','prioridad' => 'preventivo',  'tecnico' => $tecnico2Id, 'problema' => 'Servicio de mantenimiento preventivo: cambio aceite, filtros y revisión general.','num' => 'OT-2026-00002', 'dias' => -2],
            ['cliente_id' => $clienteIds[2], 'moto_idx' => 3, 'estado' => 'lista',       'prioridad' => 'rapido',      'tecnico' => $tecnico1Id, 'problema' => 'Cambio de pastillas de freno delanteras y calibración.',                        'num' => 'OT-2026-00003', 'dias' => -7],
            ['cliente_id' => $clienteIds[3], 'moto_idx' => 4, 'estado' => 'recepcion',   'prioridad' => 'emergencia',  'tecnico' => null,         'problema' => 'Moto no enciende, posible problema eléctrico o en el sistema de arranque.',   'num' => 'OT-2026-00004', 'dias' => 0],
            ['cliente_id' => $clienteIds[0], 'moto_idx' => 1, 'estado' => 'entregada',   'prioridad' => 'preventivo',  'tecnico' => $tecnico2Id, 'problema' => 'Cambio de aceite y revisión de cadena de transmisión.',                        'num' => 'OT-2026-00005', 'dias' => -10],
        ];

        foreach ($otData as $ot) {
            $ingreso = now()->addDays($ot['dias']);
            DB::table('ordenes_trabajo')->insert([
                'numero_ot'          => $ot['num'],
                'cliente_id'         => $ot['cliente_id'],
                'motocicleta_id'     => $motoIds[$ot['moto_idx']],
                'recepcionista_id'   => $recepcionistaId,
                'tecnico_id'         => $ot['tecnico'],
                'jefe_taller_id'     => $jefeTallerId,
                'estado'             => $ot['estado'],
                'prioridad'          => $ot['prioridad'],
                'fecha_ingreso'      => $ingreso,
                'fecha_estimada_entrega' => $ingreso->copy()->addDays(3),
                'fecha_entrega_real' => $ot['estado'] === 'entregada' ? $ingreso->copy()->addDays(2) : null,
                'kilometraje_ingreso'=> rand(5000, 50000),
                'nivel_combustible'  => 'medio',
                'estado_fisico'      => 'Sin daños visibles en la carrocería. Leve desgaste en manubrios.',
                'problema_reportado' => $ot['problema'],
                'created_at'         => $ingreso,
                'updated_at'         => $ingreso,
            ]);
        }
    }
}
