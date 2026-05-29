<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Motocicleta;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MotocicletaController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $motos = Motocicleta::with('cliente')
            ->when($request->cliente_id, fn($q, $id) => $q->where('cliente_id', $id))
            ->when($request->search, fn($q, $s) => $q->where('placa', 'like', "%$s%")
                ->orWhere('marca', 'like', "%$s%")
                ->orWhere('modelo', 'like', "%$s%"))
            ->where('activo', true)
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json($motos);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'cliente_id'      => 'required|exists:clientes,id',
            'marca'           => 'required|string|max:50',
            'modelo'          => 'required|string|max:100',
            'anio'            => 'required|integer|min:1950|max:' . (date('Y') + 1),
            'placa'           => 'required|string|max:20|unique:motocicletas',
            'color'           => 'required|string|max:50',
            'numero_chasis'   => 'nullable|string|max:50',
            'numero_motor'    => 'nullable|string|max:50',
            'kilometraje_actual' => 'nullable|integer|min:0',
            'notas'           => 'nullable|string',
        ]);

        $moto = Motocicleta::create($data);

        return response()->json($moto->load('cliente'), 201);
    }

    public function show(Motocicleta $motocicleta): JsonResponse
    {
        return response()->json(
            $motocicleta->load(['cliente', 'ordenesTrabajo' => fn($q) => $q->orderBy('created_at', 'desc')])
        );
    }

    public function update(Request $request, Motocicleta $motocicleta): JsonResponse
    {
        $data = $request->validate([
            'marca'              => 'sometimes|string|max:50',
            'modelo'             => 'sometimes|string|max:100',
            'anio'               => 'sometimes|integer|min:1950|max:' . (date('Y') + 1),
            'placa'              => 'sometimes|string|max:20|unique:motocicletas,placa,' . $motocicleta->id,
            'color'              => 'sometimes|string|max:50',
            'numero_chasis'      => 'nullable|string|max:50',
            'numero_motor'       => 'nullable|string|max:50',
            'kilometraje_actual' => 'nullable|integer|min:0',
            'notas'              => 'nullable|string',
        ]);

        $motocicleta->update($data);

        return response()->json($motocicleta->load('cliente'));
    }

    public function destroy(Motocicleta $motocicleta): JsonResponse
    {
        $motocicleta->update(['activo' => false]);

        return response()->json(['message' => 'Motocicleta desactivada correctamente.']);
    }
}