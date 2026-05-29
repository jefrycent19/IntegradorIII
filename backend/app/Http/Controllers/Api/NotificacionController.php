<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Jobs\EnviarNotificacionJob;
use App\Models\Notificacion;
use App\Models\OrdenTrabajo;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificacionController extends Controller
{
    private function mensajes(OrdenTrabajo $ot): array
    {
        return [
            'moto_recibida'        => "Su motocicleta fue recibida. OT: {$ot->numero_ot}",
            'diagnostico_listo'    => 'El diagnóstico está listo. Le contactaremos para detalles.',
            'aprobacion_requerida' => 'Requerimos su aprobación para continuar los trabajos.',
            'moto_lista'           => '¡Su motocicleta está lista para retirar!',
            'factura_generada'     => "Factura generada. OT: {$ot->numero_ot}",
            'garantia_aprobada'    => 'Su reclamo de garantía fue aprobado.',
        ];
    }

    public function store(Request $request, OrdenTrabajo $ordenTrabajo): JsonResponse
    {
        $data = $request->validate([
            'tipo'  => 'required|in:moto_recibida,diagnostico_listo,aprobacion_requerida,moto_lista,factura_generada,garantia_aprobada',
            'canal' => 'required|in:email,sms,whatsapp,push',
        ]);

        $mensajes = $this->mensajes($ordenTrabajo);

        // Crear el registro en estado "pendiente"
        $notificacion = Notificacion::create([
            'cliente_id'       => $ordenTrabajo->cliente_id,
            'orden_trabajo_id' => $ordenTrabajo->id,
            'tipo'             => $data['tipo'],
            'mensaje'          => $mensajes[$data['tipo']],
            'canal'            => $data['canal'],
            'estado'           => 'pendiente',
        ]);

        // Despachar el envío real a la cola (asíncrono — no bloquea al usuario)
        $cliente = $ordenTrabajo->cliente;
        EnviarNotificacionJob::dispatch(
            notificacionId: $notificacion->id,
            canal:          $data['canal'],
            mensaje:        $mensajes[$data['tipo']],
            telefono:       $cliente?->telefono ?? '',
            email:          $cliente?->email ?? '',
        );

        // Respuesta inmediata — el envío ocurre en background
        return response()->json([
            'message'       => 'Notificación encolada correctamente.',
            'notificacion'  => $notificacion,
        ], 201);
    }
}