<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Cliente;
use App\Models\OrdenTrabajo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ClienteWebController extends Controller
{
    public function inicio()
    {
        return view('cliente.inicio');
    }

    public function consultarForm()
    {
        return view('cliente.consultar');
    }

    public function consultarBuscar(Request $request)
    {
        $request->validate(['busqueda' => 'required|string|min:3']);

        $busqueda = trim($request->busqueda);

        $ot = OrdenTrabajo::with(['motocicleta', 'tecnico', 'diagnostico', 'avances'])
            ->where('numero_ot', $busqueda)
            ->orWhereHas('motocicleta', fn($q) => $q->where('placa', $busqueda))
            ->orderByDesc('fecha_ingreso')
            ->first();

        if (! $ot) {
            return back()->withInput()->with('error', 'No se encontro ninguna OT con ese numero o placa.');
        }

        return redirect()->route('cliente.consultar.resultado', $ot->numero_ot);
    }

    public function consultarResultado(string $numeroOt)
    {
        $ot = OrdenTrabajo::with(['motocicleta', 'tecnico', 'diagnostico', 'avances'])
            ->where('numero_ot', $numeroOt)
            ->firstOrFail();

        return view('cliente.estado', compact('ot'));
    }

    public function citaForm()
    {
        return view('cliente.cita');
    }

    public function citaGuardar(Request $request)
    {
        $data = $request->validate([
            'nombre'          => 'required|string|max:100',
            'apellido'        => 'required|string|max:100',
            'telefono'        => 'required|string|max:20',
            'email'           => 'nullable|email',
            'marca_moto'      => 'required|string|max:50',
            'placa_moto'      => 'required|string|max:20',
            'tipo_servicio'   => 'required|in:preventivo,reparacion,diagnostico,garantia,emergencia',
            'fecha_preferida' => 'required|date|after:today',
            'descripcion'     => 'required|string',
        ]);

        // Guarda la solicitud en la tabla de notificaciones internas (sin crear cita formal)
        // En produccion esto puede enviar un email o WhatsApp al taller
        DB::table('solicitudes_cita_web')->insertOrIgnore([
            'nombre'          => $data['nombre'] . ' ' . $data['apellido'],
            'telefono'        => $data['telefono'],
            'email'           => $data['email'] ?? null,
            'marca_moto'      => $data['marca_moto'],
            'placa_moto'      => $data['placa_moto'],
            'tipo_servicio'   => $data['tipo_servicio'],
            'fecha_preferida' => $data['fecha_preferida'],
            'descripcion'     => $data['descripcion'],
            'created_at'      => now(),
        ]);

        return redirect()->route('cliente.inicio')
            ->with('success', 'Solicitud de cita enviada. Le contactaremos para confirmar.');
    }

    public function login()
    {
        if (session('cliente_id')) {
            return redirect()->route('cliente.dashboard');
        }
        return view('cliente.login');
    }

    public function loginPost(Request $request)
    {
        $data = $request->validate([
            'email'  => 'required|email',
            'cedula' => 'required|string',
        ]);

        $cliente = Cliente::where('email', $data['email'])
            ->where('cedula', $data['cedula'])
            ->where('activo', true)
            ->first();

        if (! $cliente) {
            return back()->withInput()->with('error', 'Datos incorrectos. Verifique su correo y cedula.');
        }

        session(['cliente_id' => $cliente->id]);

        return redirect()->route('cliente.dashboard');
    }

    public function logout()
    {
        session()->forget('cliente_id');
        return redirect()->route('cliente.inicio')->with('success', 'Sesion cerrada.');
    }

    public function dashboard()
    {
        $clienteId = session('cliente_id');
        if (! $clienteId) {
            return redirect()->route('cliente.login');
        }

        $cliente = Cliente::with(['motocicletas'])->findOrFail($clienteId);

        $ordenes = OrdenTrabajo::with('motocicleta')
            ->where('cliente_id', $clienteId)
            ->orderByDesc('fecha_ingreso')
            ->get();

        return view('cliente.dashboard', compact('cliente', 'ordenes'));
    }
}