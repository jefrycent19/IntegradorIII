<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\OrdenTrabajo;
use App\Models\OtTiempoEtapa;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrdenTrabajoController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $ots = OrdenTrabajo::with([
                // Solo los campos necesarios para la lista — evita cargar columnas pesadas
                'cliente:id,nombre,apellido,telefono',
                'motocicleta:id,marca,modelo,placa,anio',
                'tecnico:id,nombre,apellido',
            ])
            ->when($request->estado, fn($q, $e) => $q->where('estado', $e))
            ->when($request->tecnico_id, fn($q, $id) => $q->where('tecnico_id', $id))
            ->when($request->search, fn($q, $s) => $q->where('numero_ot', 'like', "%$s%"))
            ->select([
                'id', 'numero_ot', 'estado', 'prioridad',
                'cliente_id', 'motocicleta_id', 'tecnico_id',
                'fecha_ingreso', 'fecha_estimada_entrega', 'fecha_entrega_real',
            ])
            ->orderBy('fecha_ingreso', 'desc')
            ->paginate(20);

        return response()->json($ots);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'cita_id'               => 'nullable|exists:citas,id',
            'cliente_id'            => 'required|exists:clientes,id',
            'motocicleta_id'        => 'required|exists:motocicletas,id',
            'prioridad'             => 'required|in:rapido,garantia,emergencia,preventivo,mayor',
            'fecha_estimada_entrega'=> 'nullable|date',
            'kilometraje_ingreso'   => 'required|integer|min:0',
            'nivel_combustible'     => 'required|in:vacio,reserva,cuarto,medio,tres_cuartos,lleno',
            'estado_fisico'         => 'required|string',
            'accesorios_entregados' => 'nullable|string',
            'problema_reportado'    => 'required|string',
            'observaciones_generales' => 'nullable|string',
        ]);

        $data['recepcionista_id'] = $request->user()->id;
        $data['fecha_ingreso']    = now();
        $data['estado']           = 'recepcion';

        $data['numero_ot'] = DB::transaction(function () use ($data) {
            $ultimo = OrdenTrabajo::lockForUpdate()->max('id') ?? 0;
            return 'OT-' . date('Y') . '-' . str_pad($ultimo + 1, 5, '0', STR_PAD_LEFT);
        });

        $ot = OrdenTrabajo::create($data);

        // Inicia el temporizador de la etapa recepcion
        OtTiempoEtapa::create([
            'orden_trabajo_id'   => $ot->id,
            'etapa'              => 'recepcion',
            'inicio'             => now(),
            'tiempo_limite_horas'=> 1,
            'semaforo'           => 'verde',
        ]);

        return response()->json($ot->load(['cliente', 'motocicleta', 'recepcionista']), 201);
    }

    public function show(OrdenTrabajo $ordenTrabajo): JsonResponse
    {
        return response()->json($ordenTrabajo->load([
            'cliente', 'motocicleta', 'recepcionista', 'tecnico', 'jefeTaller',
            'diagnostico', 'checklist', 'factura.items',
            'avances.tecnico', 'tiemposEtapa',
            'repuestos.repuesto', 'evidencias',
            'garantia.reclamos', 'encuesta',
        ]));
    }

    public function update(Request $request, OrdenTrabajo $ordenTrabajo): JsonResponse
    {
        $data = $request->validate([
            'estado'                => 'sometimes|in:recepcion,diagnostico,reparacion,lista,entregada',
            'tecnico_id'            => 'nullable|exists:users,id',
            'jefe_taller_id'        => 'nullable|exists:users,id',
            'prioridad'             => 'sometimes|in:rapido,garantia,emergencia,preventivo,mayor',
            'fecha_estimada_entrega'=> 'nullable|date',
            'fecha_entrega_real'    => 'nullable|date',
            'observaciones_generales' => 'nullable|string',
        ]);

        // Cierra el temporizador de la etapa anterior y abre el de la nueva
        if (isset($data['estado']) && $data['estado'] !== $ordenTrabajo->estado) {
            $ordenTrabajo->tiemposEtapa()
                ->whereNull('fin')
                ->update(['fin' => now()]);

            $limites = [
                'diagnostico' => 4,
                'reparacion'  => 24,
                'lista'       => 2,
                'entregada'   => 1,
            ];

            if (isset($limites[$data['estado']])) {
                OtTiempoEtapa::create([
                    'orden_trabajo_id'    => $ordenTrabajo->id,
                    'etapa'               => $data['estado'],
                    'inicio'              => now(),
                    'tiempo_limite_horas' => $limites[$data['estado']],
                    'semaforo'            => 'verde',
                ]);
            }
        }

        $ordenTrabajo->update($data);

        return response()->json($ordenTrabajo->load(['cliente', 'motocicleta', 'tecnico', 'tiemposEtapa']));
    }
}