@extends('layouts.cliente')
@section('title', 'Mi Cuenta')
@section('content')
<div class="max-w-3xl mx-auto px-4 py-10">
    <h1 class="text-2xl font-bold text-gray-800 mb-1">Bienvenido, {{ $cliente->nombre }}</h1>
    <p class="text-gray-500 text-sm mb-8">Aqui puede consultar sus motos y el historial de servicios.</p>

    {{-- Mis motos --}}
    <div class="mb-8">
        <h2 class="text-lg font-semibold text-gray-700 mb-4">Mis motocicletas</h2>
        @if($cliente->motocicletas->isEmpty())
            <p class="text-gray-500 text-sm">No tiene motocicletas registradas.</p>
        @else
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            @foreach($cliente->motocicletas as $moto)
            <div class="bg-white rounded-xl shadow p-5 flex items-center gap-4">
                <div class="text-3xl">🏍️</div>
                <div>
                    <p class="font-semibold text-gray-800">{{ $moto->marca }} {{ $moto->modelo }} {{ $moto->anio }}</p>
                    <p class="text-sm text-gray-500">Placa: {{ $moto->placa }}</p>
                    <p class="text-sm text-gray-500">{{ number_format($moto->kilometraje_actual) }} km</p>
                </div>
            </div>
            @endforeach
        </div>
        @endif
    </div>

    {{-- Historial de OT --}}
    <div>
        <h2 class="text-lg font-semibold text-gray-700 mb-4">Historial de servicios</h2>
        @if($ordenes->isEmpty())
            <div class="bg-white rounded-xl shadow p-6 text-center text-gray-500">
                No tiene servicios registrados aun.
            </div>
        @else
        <div class="space-y-3">
            @foreach($ordenes as $ot)
            @php
                $colores = ['recepcion'=>'gray','diagnostico'=>'yellow','reparacion'=>'blue','lista'=>'green','entregada'=>'gray'];
                $c = $colores[$ot->estado] ?? 'gray';
            @endphp
            <div class="bg-white rounded-xl shadow p-5">
                <div class="flex items-start justify-between">
                    <div>
                        <p class="font-semibold text-gray-800">{{ $ot->numero_ot }}</p>
                        <p class="text-sm text-gray-500">{{ $ot->motocicleta->marca }} {{ $ot->motocicleta->modelo }} — {{ $ot->motocicleta->placa }}</p>
                        <p class="text-sm text-gray-500">{{ \Carbon\Carbon::parse($ot->fecha_ingreso)->format('d/m/Y') }}</p>
                    </div>
                    <div class="text-right">
                        <span class="inline-block px-3 py-1 rounded-full text-xs font-semibold
                            @if($ot->estado === 'entregada') bg-gray-100 text-gray-700
                            @elseif($ot->estado === 'lista') bg-green-100 text-green-700
                            @elseif($ot->estado === 'reparacion') bg-blue-100 text-blue-700
                            @elseif($ot->estado === 'diagnostico') bg-yellow-100 text-yellow-700
                            @else bg-gray-100 text-gray-600
                            @endif">
                            {{ ucfirst($ot->estado) }}
                        </span>
                        @if($ot->estado !== 'entregada')
                        <br>
                        <a href="{{ route('cliente.consultar.resultado', $ot->numero_ot) }}"
                            class="text-blue-600 text-xs hover:underline mt-1 inline-block">Ver detalle</a>
                        @endif
                    </div>
                </div>
            </div>
            @endforeach
        </div>
        @endif
    </div>
</div>
@endsection