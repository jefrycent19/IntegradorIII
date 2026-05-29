<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cita;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CitaController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $citas = Cita::with(['cliente', 'motocicleta', 'recepcionista'])
            ->when($request->estado, fn($q, $e) => $q->where('estado', $e))
            ->when($request->fecha, fn($q, $f) => $q->whereDate('fecha_hora', $f))
            ->when($request->cliente_id, fn($q, $id) => $q->where('cliente_id', $id))
            ->orderBy('fecha_hora')
            ->paginate(20);

        return response()->json($citas);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'cliente_id'          => 'required|exists:clientes,id',
            'motocicleta_id'      => 'required|exists:motocicletas,id',
            'fecha_hora'          => 'required|date|after:now',
            'duracion_estimada_min' => 'nullable|integer|min:15',
            'tipo_servicio'       => 'required|in:preventivo,reparacion,diagnostico,garantia,emergencia',
            'descripcion_problema'=> 'required|string',
            'notas'               => 'nullable|string',
        ]);

        $data['recepcionista_id'] = $request->user()->id;

        $cita = Cita::create($data);

        return response()->json($cita->load(['cliente', 'motocicleta', 'recepcionista']), 201);
    }

    public function show(Cita $cita): JsonResponse
    {
        return response()->json($cita->load(['cliente', 'motocicleta', 'recepcionista', 'ordenTrabajo']));
    }

    public function update(Request $request, Cita $cita): JsonResponse
    {
        $data = $request->validate([
            'fecha_hora'           => 'sometimes|date',
            'duracion_estimada_min'=> 'nullable|integer|min:15',
            'tipo_servicio'        => 'sometimes|in:preventivo,reparacion,diagnostico,garantia,emergencia',
            'descripcion_problema' => 'sometimes|string',
            'estado'               => 'sometimes|in:pendiente,confirmada,cancelada,completada',
            'notas'                => 'nullable|string',
        ]);

        $cita->update($data);

        return response()->json($cita->load(['cliente', 'motocicleta', 'recepcionista']));
    }

    public function destroy(Cita $cita): JsonResponse
    {
        $cita->update(['estado' => 'cancelada']);

        return response()->json(['message' => 'Cita cancelada correctamente.']);
    }
}