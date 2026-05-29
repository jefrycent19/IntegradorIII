<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Evidencia;
use App\Models\OrdenTrabajo;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EvidenciaController extends Controller
{
    public function index(OrdenTrabajo $ordenTrabajo): JsonResponse
    {
        return response()->json($ordenTrabajo->evidencias()->with('subidoPor')->orderBy('created_at', 'desc')->get());
    }

    public function store(Request $request, OrdenTrabajo $ordenTrabajo): JsonResponse
    {
        $request->validate([
            'archivo'      => 'required|file|max:51200',
            'tipo'         => 'required|in:foto,video,audio,documento',
            'etapa'        => 'required|in:recepcion,diagnostico,reparacion,entrega,garantia',
            'descripcion'  => 'nullable|string',
        ]);

        $path = $request->file('archivo')->store(
            'evidencias/' . $ordenTrabajo->numero_ot, 'public'
        );

        $evidencia = $ordenTrabajo->evidencias()->create([
            'tipo'         => $request->tipo,
            'url'          => $path,
            'descripcion'  => $request->descripcion,
            'etapa'        => $request->etapa,
            'subido_por_id'=> $request->user()->id,
        ]);

        return response()->json($evidencia->load('subidoPor'), 201);
    }

    public function destroy(Evidencia $evidencia): JsonResponse
    {
        $evidencia->delete();

        return response()->json(['message' => 'Evidencia eliminada.']);
    }
}