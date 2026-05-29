<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MovimientoInventario;
use App\Models\OrdenTrabajo;
use App\Models\OtRepuesto;
use App\Models\Repuesto;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OtRepuestoController extends Controller
{
    public function index(OrdenTrabajo $ordenTrabajo): JsonResponse
    {
        return response()->json($ordenTrabajo->repuestos()->with('repuesto')->get());
    }

    public function store(Request $request, OrdenTrabajo $ordenTrabajo): JsonResponse
    {
        $data = $request->validate([
            'repuesto_id' => 'required|exists:repuestos,id',
            'cantidad'    => 'required|numeric|min:0.01',
            'estado'      => 'required|in:disponible,pendiente,pedido_especial',
            'notas'       => 'nullable|string',
        ]);

        $repuesto = Repuesto::findOrFail($data['repuesto_id']);
        $data['precio_unitario'] = $repuesto->precio_venta;

        DB::transaction(function () use ($repuesto, $data, $ordenTrabajo, $request) {
            if ($data['estado'] === 'disponible') {
                if ($repuesto->stock_actual < $data['cantidad']) {
                    abort(422, 'Stock insuficiente para este repuesto.');
                }

                $stockAnterior = $repuesto->stock_actual;
                $repuesto->decrement('stock_actual', $data['cantidad']);

                MovimientoInventario::create([
                    'repuesto_id'    => $repuesto->id,
                    'tipo'           => 'salida',
                    'cantidad'       => $data['cantidad'],
                    'stock_anterior' => $stockAnterior,
                    'stock_nuevo'    => $repuesto->stock_actual,
                    'orden_trabajo_id' => $ordenTrabajo->id,
                    'usuario_id'     => $request->user()->id,
                    'notas'          => 'Uso en ' . $ordenTrabajo->numero_ot,
                ]);
            }

            $ordenTrabajo->repuestos()->create($data);
        });

        return response()->json($ordenTrabajo->repuestos()->with('repuesto')->get(), 201);
    }

    public function update(Request $request, OrdenTrabajo $ordenTrabajo, OtRepuesto $otRepuesto): JsonResponse
    {
        $data = $request->validate([
            'estado' => 'sometimes|in:disponible,pendiente,pedido_especial',
            'notas'  => 'nullable|string',
        ]);

        $otRepuesto->update($data);

        return response()->json($otRepuesto->load('repuesto'));
    }
}