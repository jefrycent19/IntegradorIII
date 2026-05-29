<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CitaController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\SolicitudCitaWebController;
use App\Http\Controllers\Api\ChecklistEntregaController;
use App\Http\Controllers\Api\ClienteController;
use App\Http\Controllers\Api\DiagnosticoController;
use App\Http\Controllers\Api\EvidenciaController;
use App\Http\Controllers\Api\FacturaController;
use App\Http\Controllers\Api\GarantiaController;
use App\Http\Controllers\Api\MotocicletaController;
use App\Http\Controllers\Api\NotificacionController;
use App\Http\Controllers\Api\OrdenTrabajoController;
use App\Http\Controllers\Api\OtAvanceController;
use App\Http\Controllers\Api\OtRepuestoController;
use App\Http\Controllers\Api\RepuestoController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {

    // Públicas
    Route::post('/login',           [AuthController::class, 'login']);
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('/reset-password',  [AuthController::class, 'resetPassword']);

    // Protegidas con Sanctum
    Route::middleware('auth:sanctum')->group(function () {

        // Auth
        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/logout', [AuthController::class, 'logout']);

        // Dashboard — todos los roles internos
        Route::get('/dashboard', [DashboardController::class, 'index']);

        // Usuarios — solo Administrador
        Route::middleware('rol:Administrador')->group(function () {
            Route::apiResource('usuarios', UserController::class)->except(['show']);
        });

        // Clientes, Motos y Citas — TODOS los roles internos pueden leer
        // Solo Recepcionista, Jefe y Admin pueden escribir/modificar
        Route::middleware('rol:Administrador,Gerente,Jefe de Taller,Recepcionista,Técnico')->group(function () {
            Route::get('clientes', [ClienteController::class, 'index']);
            Route::get('clientes/{cliente}', [ClienteController::class, 'show']);
            Route::get('motocicletas', [MotocicletaController::class, 'index']);
            Route::get('motocicletas/{motocicleta}', [MotocicletaController::class, 'show']);
            Route::get('citas', [CitaController::class, 'index']);
            Route::get('citas/{cita}', [CitaController::class, 'show']);
        });

        Route::middleware('rol:Administrador,Jefe de Taller,Recepcionista')->group(function () {
            Route::post('clientes', [ClienteController::class, 'store']);
            Route::put('clientes/{cliente}', [ClienteController::class, 'update']);
            Route::patch('clientes/{cliente}', [ClienteController::class, 'update']);
            Route::delete('clientes/{cliente}', [ClienteController::class, 'destroy']);
            Route::post('motocicletas', [MotocicletaController::class, 'store']);
            Route::put('motocicletas/{motocicleta}', [MotocicletaController::class, 'update']);
            Route::patch('motocicletas/{motocicleta}', [MotocicletaController::class, 'update']);
            Route::delete('motocicletas/{motocicleta}', [MotocicletaController::class, 'destroy']);
            Route::post('citas', [CitaController::class, 'store']);
            Route::put('citas/{cita}', [CitaController::class, 'update']);
            Route::patch('citas/{cita}', [CitaController::class, 'update']);
            Route::delete('citas/{cita}', [CitaController::class, 'destroy']);
        });

        // Órdenes de Trabajo — todos los roles internos
        Route::middleware('rol:Administrador,Gerente,Jefe de Taller,Técnico,Recepcionista')->group(function () {
            Route::apiResource('ordenes-trabajo', OrdenTrabajoController::class)->except(['destroy']);

            // Sub-recursos de OT
            Route::prefix('ordenes-trabajo/{ordenTrabajo}')->group(function () {
                Route::post('/diagnostico', [DiagnosticoController::class, 'store']);
                Route::post('/avances', [OtAvanceController::class, 'store']);
                Route::get('/avances', [OtAvanceController::class, 'index']);
                Route::post('/checklist', [ChecklistEntregaController::class, 'store']);
                Route::get('/repuestos', [OtRepuestoController::class, 'index']);
                Route::post('/repuestos', [OtRepuestoController::class, 'store']);
                Route::patch('/repuestos/{otRepuesto}', [OtRepuestoController::class, 'update']);
                Route::get('/evidencias', [EvidenciaController::class, 'index']);
                Route::post('/evidencias', [EvidenciaController::class, 'store']);
                Route::post('/notificaciones', [NotificacionController::class, 'store']);
                Route::post('/factura', [FacturaController::class, 'store']);
                Route::post('/garantia', [GarantiaController::class, 'store']);
            });

            // Aprobar diagnóstico — Jefe de Taller y Administrador
            Route::patch('/diagnosticos/{diagnostico}/aprobar', [DiagnosticoController::class, 'aprobar'])
                ->middleware('rol:Administrador,Jefe de Taller');

            // Evidencias
            Route::delete('/evidencias/{evidencia}', [EvidenciaController::class, 'destroy']);
        });

        // Inventario — Técnico, Jefe de Taller, Administrador
        Route::middleware('rol:Administrador,Jefe de Taller,Técnico')->group(function () {
            Route::apiResource('repuestos', RepuestoController::class)->except(['destroy']);
            Route::post('/repuestos/{repuesto}/ajustar-stock', [RepuestoController::class, 'ajustarStock']);
            Route::delete('/repuestos/{repuesto}', [RepuestoController::class, 'destroy'])
                ->middleware('rol:Administrador');
        });

        // Facturación — Administrador, Gerente
        Route::middleware('rol:Administrador,Gerente')->group(function () {
            Route::get('/facturas', [FacturaController::class, 'index']);
            Route::get('/facturas/{factura}', [FacturaController::class, 'show']);
            Route::get('/solicitudes-cita-web', [SolicitudCitaWebController::class, 'index']);
            Route::patch('/solicitudes-cita-web/{id}', [SolicitudCitaWebController::class, 'update']);
        });

        // Garantías
        Route::middleware('rol:Administrador,Jefe de Taller,Técnico')->group(function () {
            Route::post('/garantias/{garantia}/reclamar', [GarantiaController::class, 'reclamar']);
            Route::patch('/reclamos/{reclamoGarantia}/resolver', [GarantiaController::class, 'resolverReclamo']);
        });
    });
});
