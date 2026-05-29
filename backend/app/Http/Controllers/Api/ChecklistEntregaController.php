<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\OrdenTrabajo;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ChecklistEntregaController extends Controller
{
    public function store(Request $request, OrdenTrabajo $ordenTrabajo): JsonResponse
    {
        $data = $request->validate([
            'prueba_realizada'   => 'required|boolean',
            'lavado'             => 'required|boolean',
            'calidad_revisada'   => 'required|boolean',
            'facturacion_lista'  => 'required|boolean',
            'cliente_notificado' => 'required|boolean',
            'notas'              => 'nullable|string',
        ]);

        $data['revisado_por_id'] = $request->user()->id;
        $data['fecha']           = now();

        $checklist = $ordenTrabajo->checklist()->updateOrCreate(
            ['orden_trabajo_id' => $ordenTrabajo->id],
            $data
        );

        $todoListo = $data['prueba_realizada'] && $data['lavado'] &&
                     $data['calidad_revisada'] && $data['facturacion_lista'] &&
                     $data['cliente_notificado'];

        if ($todoListo) {
            $ordenTrabajo->update(['estado' => 'lista']);
        }

        return response()->json($checklist->load('revisadoPor'));
    }
}