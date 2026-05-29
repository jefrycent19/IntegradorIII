<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cita;
use App\Models\Factura;
use App\Models\OrdenTrabajo;
use App\Models\Repuesto;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index(): JsonResponse
    {
        // Cache de 60 segundos — evita recalcular en cada clic
        $userId = auth()->id();
        $cacheKey = "dashboard_data_{$userId}";

        return Cache::remember($cacheKey, 60, function () {
            return $this->buildDashboard();
        });
    }

    private function buildDashboard(): JsonResponse
    {
        $hoy      = today();
        $inicioSemana = today()->startOfWeek();
        $inicioMes    = today()->startOfMonth();

        // --- OT por estado ---
        $otPorEstado = OrdenTrabajo::select('estado', DB::raw('count(*) as total'))
            ->groupBy('estado')
            ->pluck('total', 'estado');

        $otActivas   = OrdenTrabajo::whereNotIn('estado', ['entregada'])->count();
        $otAtrasadas = OrdenTrabajo::whereNotIn('estado', ['entregada'])
            ->whereNotNull('fecha_estimada_entrega')
            ->where('fecha_estimada_entrega', '<', now())
            ->count();
        $otListas        = $otPorEstado['lista']      ?? 0;
        $otEntregadasHoy = OrdenTrabajo::where('estado', 'entregada')
            ->whereDate('fecha_entrega_real', $hoy)
            ->count();

        // --- Semáforo: OT con tiempos vencidos ---
        $otRojas     = DB::table('ot_tiempos_etapa')->where('semaforo', 'rojo')->whereNull('fin')->count();
        $otAmarillas = DB::table('ot_tiempos_etapa')->where('semaforo', 'amarillo')->whereNull('fin')->count();

        // --- Inventario ---
        $stockBajo = Repuesto::where('activo', true)
            ->whereColumn('stock_actual', '<=', 'stock_minimo')
            ->count();

        // --- Facturación ---
        $facturacionHoy = Factura::where('estado', 'pagada')
            ->whereDate('fecha', $hoy)
            ->sum('total');

        $facturacionSemana = Factura::where('estado', 'pagada')
            ->whereDate('fecha', '>=', $inicioSemana)
            ->sum('total');

        $facturacionMes = Factura::where('estado', 'pagada')
            ->whereDate('fecha', '>=', $inicioMes)
            ->sum('total');

        $ticketPromedio = Factura::where('estado', 'pagada')->avg('total') ?? 0;

        // --- Citas pendientes hoy ---
        $citasHoy = Cita::whereDate('fecha_hora', $hoy)
            ->whereIn('estado', ['pendiente', 'confirmada'])
            ->count();

        // --- Productividad técnicos ---
        $tecnicosProductivos = DB::table('ordenes_trabajo')
            ->join('users', 'ordenes_trabajo.tecnico_id', '=', 'users.id')
            ->select(
                'users.id',
                DB::raw("CONCAT(users.nombre, ' ', users.apellido) as nombre"),
                DB::raw('count(*) as total_ot'),
                DB::raw('sum(case when ordenes_trabajo.estado = "entregada" then 1 else 0 end) as entregadas')
            )
            ->whereNotNull('ordenes_trabajo.tecnico_id')
            ->whereDate('ordenes_trabajo.created_at', '>=', $inicioMes)
            ->groupBy('users.id', 'users.nombre', 'users.apellido')
            ->orderByDesc('entregadas')
            ->limit(5)
            ->get();

        // --- Tiempo promedio de reparación (días) ---
        $tiempoPromedio = OrdenTrabajo::where('estado', 'entregada')
            ->whereNotNull('fecha_entrega_real')
            ->selectRaw('AVG(TIMESTAMPDIFF(HOUR, fecha_ingreso, fecha_entrega_real)) as promedio_horas')
            ->value('promedio_horas');

        // --- Últimas 5 OT activas ---
        $ultimasOt = OrdenTrabajo::with(['cliente', 'motocicleta', 'tecnico', 'tiemposEtapa'])
            ->whereNotIn('estado', ['entregada'])
            ->orderByDesc('fecha_ingreso')
            ->limit(5)
            ->get()
            ->map(fn($ot) => [
                'id'         => $ot->id,
                'numero_ot'  => $ot->numero_ot,
                'estado'     => $ot->estado,
                'prioridad'  => $ot->prioridad,
                'cliente'    => $ot->cliente?->nombre . ' ' . $ot->cliente?->apellido,
                'moto'       => $ot->motocicleta?->marca . ' ' . $ot->motocicleta?->modelo . ' - ' . $ot->motocicleta?->placa,
                'tecnico'    => $ot->tecnico ? $ot->tecnico->nombre . ' ' . $ot->tecnico->apellido : null,
                'semaforo'   => $ot->tiemposEtapa->whereNull('fin')->last()?->semaforo ?? 'verde',
                'fecha_estimada' => $ot->fecha_estimada_entrega,
            ]);

        // --- Conversión diagnóstico → reparación ---
        $totalDiagnosticos  = DB::table('diagnosticos')->count();
        $diagnosticosAprobados = DB::table('diagnosticos')->where('estado', 'aprobado')->count();
        $tasaConversion = $totalDiagnosticos > 0
            ? round(($diagnosticosAprobados / $totalDiagnosticos) * 100, 1)
            : 0;

        // --- Rentabilidad estimada (facturación - repuestos usados en OT) ---
        $costoRepuestos = DB::table('ot_repuestos')
            ->join('repuestos', 'ot_repuestos.repuesto_id', '=', 'repuestos.id')
            ->whereDate('ot_repuestos.created_at', '>=', $inicioMes)
            ->selectRaw('SUM(ot_repuestos.cantidad * repuestos.precio_costo) as total')
            ->value('total') ?? 0;

        $rentabilidadEstimada = round($facturacionMes - $costoRepuestos, 2);
        $margenEstimado = $facturacionMes > 0
            ? round(($rentabilidadEstimada / $facturacionMes) * 100, 1)
            : 0;

        // --- Facturación últimos 7 días para tendencia ---
        $tendencia = collect(range(6, 0))->map(function ($diasAtras) {
            $fecha = today()->subDays($diasAtras);
            $total = Factura::where('estado', 'pagada')
                ->whereDate('fecha', $fecha)
                ->sum('total');
            return [
                'fecha' => $fecha->format('d/m'),
                'total' => round($total, 2),
            ];
        });

        // --- Carga de técnicos activos ---
        $cargaTecnicos = DB::table('users')
            ->join('roles', 'users.rol_id', '=', 'roles.id')
            ->leftJoin('ordenes_trabajo', function ($join) {
                $join->on('ordenes_trabajo.tecnico_id', '=', 'users.id')
                    ->whereNotIn('ordenes_trabajo.estado', ['entregada']);
            })
            ->where('roles.nombre', 'Técnico')
            ->where('users.activo', true)
            ->select(
                'users.id',
                DB::raw("CONCAT(users.nombre, ' ', users.apellido) as nombre"),
                DB::raw('COUNT(ordenes_trabajo.id) as ot_activas')
            )
            ->groupBy('users.id', 'users.nombre', 'users.apellido')
            ->orderBy('ot_activas', 'desc')
            ->get();

        return response()->json([
            'ot' => [
                'activas'           => $otActivas,
                'atrasadas'         => $otAtrasadas,
                'listas'            => $otListas,
                'entregadas_hoy'    => $otEntregadasHoy,
                'por_estado'        => $otPorEstado,
                'semaforo_rojo'     => $otRojas,
                'semaforo_amarillo' => $otAmarillas,
            ],
            'inventario' => [
                'stock_bajo' => $stockBajo,
            ],
            'facturacion' => [
                'hoy'             => round($facturacionHoy, 2),
                'semana'          => round($facturacionSemana, 2),
                'mes'             => round($facturacionMes, 2),
                'ticket_promedio' => round($ticketPromedio, 2),
            ],
            'rentabilidad' => [
                'estimada_mes'      => $rentabilidadEstimada,
                'margen_porcentaje' => $margenEstimado,
                'costo_repuestos'   => round($costoRepuestos, 2),
            ],
            'conversion' => [
                'tasa_porcentaje'     => $tasaConversion,
                'total_diagnosticos'  => $totalDiagnosticos,
                'aprobados'           => $diagnosticosAprobados,
            ],
            'tendencia_7dias'       => $tendencia,
            'citas_hoy'             => $citasHoy,
            'tiempo_promedio_horas' => round($tiempoPromedio ?? 0, 1),
            'tecnicos_productivos'  => $tecnicosProductivos,
            'carga_tecnicos'        => $cargaTecnicos,
            'ultimas_ot'            => $ultimasOt,
        ]);
    }
}

