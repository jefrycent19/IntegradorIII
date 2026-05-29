<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SolicitudCitaWebController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = DB::table('solicitudes_cita_web')
            ->when($request->estado, fn($q, $e) => $q->where('estado', $e))
            ->orderByDesc('created_at');

        $total = $query->count();
        $solicitudes = $query->paginate(20);

        return response()->json($solicitudes);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $data = $request->validate([
            'estado' => 'required|in:pendiente,contactado,confirmado,descartado',
        ]);

        DB::table('solicitudes_cita_web')->where('id', $id)->update([
            'estado' => $data['estado'],
        ]);

        return response()->json(['message' => 'Estado actualizado.']);
    }
}
