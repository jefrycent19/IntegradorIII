<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Factura;
use App\Models\OrdenTrabajo;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FacturaController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $facturas = Factura::with(['cliente', 'ordenTrabajo'])
            ->when($request->estado, fn($q, $e) => $q->where('estado', $e))
            ->when($request->fecha_desde, fn($q, $f) => $q->whereDate('fecha', '>=', $f))
            ->when($request->fecha_hasta, fn($q, $f) => $q->whereDate('fecha', '<=', $f))
            ->orderBy('fecha', 'desc')
            ->paginate(20);

        return response()->json($facturas);
    }

    public function store(Request $request, OrdenTrabajo $ordenTrabajo): JsonResponse
    {
        $data = $request->validate([
            'metodo_pago' => 'required|in:efectivo,tarjeta,transferencia,mixto',
            'descuento'   => 'nullable|numeric|min:0',
            'notas'       => 'nullable|string',
            'items'       => 'required|array|min:1',
            'items.*.tipo'           => 'required|in:mano_obra,repuesto,servicio',
            'items.*.descripcion'    => 'required|string',
            'items.*.cantidad'       => 'required|numeric|min:0.01',
            'items.*.precio_unitario'=> 'required|numeric|min:0',
        ]);

        $items     = $data['items'];
        $subtotal  = collect($items)->sum(fn($i) => $i['cantidad'] * $i['precio_unitario']);
        $descuento = $data['descuento'] ?? 0;
        $impuesto  = round(($subtotal - $descuento) * 0.13, 2);
        $total     = $subtotal - $descuento + $impuesto;

        $ultimaFactura = Factura::max('id') ?? 0;
        $numeroFactura = 'F-' . date('Y') . '-' . str_pad($ultimaFactura + 1, 5, '0', STR_PAD_LEFT);

        $factura = Factura::create([
            'numero_factura'  => $numeroFactura,
            'orden_trabajo_id'=> $ordenTrabajo->id,
            'cliente_id'      => $ordenTrabajo->cliente_id,
            'fecha'           => now(),
            'subtotal'        => $subtotal,
            'impuesto'        => $impuesto,
            'descuento'       => $descuento,
            'total'           => $total,
            'metodo_pago'     => $data['metodo_pago'],
            'estado'          => 'pagada',
            'notas'           => $data['notas'] ?? null,
        ]);

        foreach ($items as $item) {
            $factura->items()->create([
                'tipo'           => $item['tipo'],
                'descripcion'    => $item['descripcion'],
                'cantidad'       => $item['cantidad'],
                'precio_unitario'=> $item['precio_unitario'],
                'subtotal'       => $item['cantidad'] * $item['precio_unitario'],
            ]);
        }

        $ordenTrabajo->update(['estado' => 'entregada', 'fecha_entrega_real' => now()]);

        return response()->json($factura->load(['items', 'cliente', 'ordenTrabajo']), 201);
    }

    public function show(Factura $factura): JsonResponse
    {
        return response()->json($factura->load(['items', 'cliente', 'ordenTrabajo.motocicleta']));
    }
}