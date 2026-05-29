<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Diagnostico;
use App\Models\OrdenTrabajo;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DiagnosticoController extends Controller
{
    public function store(Request $request, OrdenTrabajo $ordenTrabajo): JsonResponse
    {
        $data = $request->validate([
            'descripcion_fallas'    => 'required|string',
            'mano_obra_estimada'    => 'required|numeric|min:0',
            'tiempo_estimado_horas' => 'required|numeric|min:0.5',
            'prioridad_sugerida'    => 'nullable|in:rapido,garantia,emergencia,preventivo,mayor',
            'observaciones'         => 'nullable|string',
        ]);

        $data['tecnico_id']       = $request->user()->id;
        $data['fecha_diagnostico']= now();
        $data['estado']           = 'esperando_aprobacion';

        $diagnostico = $ordenTrabajo->diagnostico()->updateOrCreate(
            ['orden_trabajo_id' => $ordenTrabajo->id],
            $data
        );

        $ordenTrabajo->update(['estado' => 'diagnostico']);

        return response()->json($diagnostico->load(['tecnico', 'ordenTrabajo']), 201);
    }

    public function aprobar(Request $request, Diagnostico $diagnostico): JsonResponse
    {
        $request->validate([
            'estado' => 'required|in:aprobado,rechazado,esperando_repuestos',
        ]);

        $diagnostico->update([
            'estado'          => $request->estado,
            'fecha_aprobacion'=> now(),
            'aprobado_por_id' => $request->user()->id,
        ]);

        if ($request->estado === 'aprobado') {
            $diagnostico->ordenTrabajo->update(['estado' => 'reparacion']);
        }

        return response()->json($diagnostico->load(['tecnico', 'aprobadoPor']));
    }
}