<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Garantia;
use App\Models\OrdenTrabajo;
use App\Models\ReclamoGarantia;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GarantiaController extends Controller
{
    public function store(Request $request, OrdenTrabajo $ordenTrabajo): JsonResponse
    {
        $data = $request->validate([
            'descripcion'     => 'required|string',
            'fecha_inicio'    => 'required|date',
            'fecha_fin'       => 'required|date|after:fecha_inicio',
            'cubre_repuestos' => 'required|boolean',
            'cubre_mano_obra' => 'required|boolean',
            'notas'           => 'nullable|string',
        ]);

        $garantia = $ordenTrabajo->garantia()->updateOrCreate(
            ['orden_trabajo_id' => $ordenTrabajo->id],
            array_merge($data, ['estado' => 'activa'])
        );

        return response()->json($garantia, 201);
    }

    public function reclamar(Request $request, Garantia $garantia): JsonResponse
    {
        $data = $request->validate([
            'descripcion_problema' => 'required|string',
        ]);

        $reclamo = $garantia->reclamos()->create([
            'fecha_reclamo'       => now(),
            'descripcion_problema'=> $data['descripcion_problema'],
            'estado'              => 'pendiente',
        ]);

        $garantia->update(['estado' => 'reclamada']);

        return response()->json($reclamo, 201);
    }

    public function resolverReclamo(Request $request, ReclamoGarantia $reclamoGarantia): JsonResponse
    {
        $data = $request->validate([
            'estado'     => 'required|in:aprobado,rechazado',
            'resolucion' => 'required|string',
        ]);

        $reclamoGarantia->update([
            'estado'           => $data['estado'],
            'resolucion'       => $data['resolucion'],
            'fecha_resolucion' => now(),
        ]);

        return response()->json($reclamoGarantia);
    }
}