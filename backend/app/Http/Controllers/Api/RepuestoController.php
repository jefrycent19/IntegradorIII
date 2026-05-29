<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MovimientoInventario;
use App\Models\Repuesto;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RepuestoController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $repuestos = Repuesto::when($request->search, fn($q, $s) =>
                $q->where('nombre', 'like', "%$s%")->orWhere('codigo', 'like', "%$s%"))
            ->when($request->categoria, fn($q, $c) => $q->where('categoria', $c))
            ->when($request->stock_bajo, fn($q) => $q->whereColumn('stock_actual', '<=', 'stock_minimo'))
            ->where('activo', true)
            ->orderBy('nombre')
            ->paginate(20);

        return response()->json($repuestos);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'codigo'       => 'required|string|max:50|unique:repuestos',
            'nombre'       => 'required|string|max:150',
            'descripcion'  => 'nullable|string',
            'categoria'    => 'required|string|max:80',
            'precio_costo' => 'required|numeric|min:0',
            'precio_venta' => 'required|numeric|min:0',
            'stock_actual' => 'required|integer|min:0',
            'stock_minimo' => 'nullable|integer|min:0',
            'unidad'       => 'required|in:unidad,par,litro,kit,metro,juego',
            'proveedor'    => 'nullable|string',
        ]);

        $repuesto = Repuesto::create($data);

        if ($data['stock_actual'] > 0) {
            MovimientoInventario::create([
                'repuesto_id'   => $repuesto->id,
                'tipo'          => 'entrada',
                'cantidad'      => $data['stock_actual'],
                'stock_anterior'=> 0,
                'stock_nuevo'   => $data['stock_actual'],
                'usuario_id'    => $request->user()->id,
                'notas'         => 'Stock inicial',
            ]);
        }

        return response()->json($repuesto, 201);
    }

    public function show(Repuesto $repuesto): JsonResponse
    {
        return response()->json($repuesto->load('movimientos'));
    }

    public function update(Request $request, Repuesto $repuesto): JsonResponse
    {
        $data = $request->validate([
            'nombre'       => 'sometimes|string|max:150',
            'descripcion'  => 'nullable|string',
            'categoria'    => 'sometimes|string|max:80',
            'precio_costo' => 'sometimes|numeric|min:0',
            'precio_venta' => 'sometimes|numeric|min:0',
            'stock_minimo' => 'nullable|integer|min:0',
            'unidad'       => 'sometimes|in:unidad,par,litro,kit,metro,juego',
            'proveedor'    => 'nullable|string',
        ]);

        $repuesto->update($data);

        return response()->json($repuesto);
    }

    public function ajustarStock(Request $request, Repuesto $repuesto): JsonResponse
    {
        $data = $request->validate([
            'tipo'     => 'required|in:entrada,salida,ajuste',
            'cantidad' => 'required|numeric|min:0.01',
            'notas'    => 'nullable|string',
        ]);

        $stockAnterior = $repuesto->stock_actual;
        $stockNuevo = $data['tipo'] === 'salida'
            ? $stockAnterior - $data['cantidad']
            : $stockAnterior + $data['cantidad'];

        if ($stockNuevo < 0) {
            return response()->json(['message' => 'Stock insuficiente.'], 422);
        }

        $repuesto->update(['stock_actual' => $stockNuevo]);

        $movimiento = MovimientoInventario::create([
            'repuesto_id'    => $repuesto->id,
            'tipo'           => $data['tipo'],
            'cantidad'       => $data['cantidad'],
            'stock_anterior' => $stockAnterior,
            'stock_nuevo'    => $stockNuevo,
            'usuario_id'     => $request->user()->id,
            'notas'          => $data['notas'] ?? null,
        ]);

        return response()->json([
            'repuesto'   => $repuesto->fresh(),
            'movimiento' => $movimiento,
            'alerta_stock_bajo' => $repuesto->stockBajo(),
        ]);
    }

    public function destroy(Repuesto $repuesto): JsonResponse
    {
        $repuesto->update(['activo' => false]);

        return response()->json(['message' => 'Repuesto desactivado correctamente.']);
    }
}