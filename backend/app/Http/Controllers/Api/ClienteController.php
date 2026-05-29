<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cliente;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ClienteController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $clientes = Cliente::with(['motocicletas:id,cliente_id,marca,modelo,placa'])
            ->when($request->search, fn($q, $s) => $q->where('nombre', 'like', "%$s%")
                ->orWhere('apellido', 'like', "%$s%")
                ->orWhere('cedula', 'like', "%$s%")
                ->orWhere('telefono', 'like', "%$s%"))
            ->where('activo', true)
            ->select(['id', 'nombre', 'apellido', 'cedula', 'telefono', 'telefono_alt', 'email', 'activo'])
            ->orderBy('nombre')
            ->paginate(20);

        return response()->json($clientes);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'nombre'       => 'required|string|max:100',
            'apellido'     => 'required|string|max:100',
            'cedula'       => 'required|string|max:20|unique:clientes',
            'telefono'     => 'required|string|max:20',
            'telefono_alt' => 'nullable|string|max:20',
            'email'        => 'nullable|email',
            'direccion'    => 'nullable|string',
            'notas'        => 'nullable|string',
        ]);

        $cliente = Cliente::create($data);

        return response()->json($cliente->load('motocicletas'), 201);
    }

    public function show(Cliente $cliente): JsonResponse
    {
        return response()->json(
            $cliente->load(['motocicletas', 'ordenesTrabajo.diagnostico', 'ordenesTrabajo.factura'])
        );
    }

    public function update(Request $request, Cliente $cliente): JsonResponse
    {
        $data = $request->validate([
            'nombre'       => 'sometimes|string|max:100',
            'apellido'     => 'sometimes|string|max:100',
            'cedula'       => 'sometimes|string|max:20|unique:clientes,cedula,' . $cliente->id,
            'telefono'     => 'sometimes|string|max:20',
            'telefono_alt' => 'nullable|string|max:20',
            'email'        => 'nullable|email',
            'direccion'    => 'nullable|string',
            'notas'        => 'nullable|string',
        ]);

        $cliente->update($data);

        return response()->json($cliente->load('motocicletas'));
    }

    public function destroy(Cliente $cliente): JsonResponse
    {
        $cliente->update(['activo' => false]);

        return response()->json(['message' => 'Cliente desactivado correctamente.']);
    }
}