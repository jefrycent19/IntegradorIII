<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\OrdenTrabajo;
use App\Models\OtAvance;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OtAvanceController extends Controller
{
    public function index(OrdenTrabajo $ordenTrabajo): JsonResponse
    {
        $avances = $ordenTrabajo->avances()->with('tecnico')->orderBy('fecha_hora', 'desc')->get();

        return response()->json($avances);
    }

    public function store(Request $request, OrdenTrabajo $ordenTrabajo): JsonResponse
    {
        $data = $request->validate([
            'descripcion' => 'required|string',
        ]);

        $avance = $ordenTrabajo->avances()->create([
            'tecnico_id'  => $request->user()->id,
            'descripcion' => $data['descripcion'],
            'fecha_hora'  => now(),
        ]);

        return response()->json($avance->load('tecnico'), 201);
    }
}