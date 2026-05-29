<?php

use App\Http\Controllers\Web\ClienteWebController;
use Illuminate\Support\Facades\Route;

// Web cliente — página pública
Route::get('/', [ClienteWebController::class, 'inicio'])->name('cliente.inicio');

// Consultar estado de OT (sin login)
Route::get('/consultar', [ClienteWebController::class, 'consultarForm'])->name('cliente.consultar');
Route::post('/consultar', [ClienteWebController::class, 'consultarBuscar'])->name('cliente.consultar.buscar');
Route::get('/consultar/{numeroOt}', [ClienteWebController::class, 'consultarResultado'])->name('cliente.consultar.resultado');

// Solicitar cita (sin login)
Route::get('/cita', [ClienteWebController::class, 'citaForm'])->name('cliente.cita.form');
Route::post('/cita', [ClienteWebController::class, 'citaGuardar'])->name('cliente.cita.guardar');

// Autenticación de clientes
Route::get('/login', [ClienteWebController::class, 'login'])->name('cliente.login');
Route::post('/login', [ClienteWebController::class, 'loginPost'])->name('cliente.login.post');
Route::post('/logout', [ClienteWebController::class, 'logout'])->name('cliente.logout');

// Cuenta del cliente (requiere sesión)
Route::get('/mi-cuenta', [ClienteWebController::class, 'dashboard'])->name('cliente.dashboard');
