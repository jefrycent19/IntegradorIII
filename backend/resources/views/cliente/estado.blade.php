@extends('layouts.cliente')
@section('title', 'Estado de OT')
@section('content')
<div class="max-w-2xl mx-auto px-4 py-10">
    <a href="{{ route('cliente.consultar') }}" class="text-blue-600 text-sm hover:underline mb-4 block">Hacer otra consulta</a>

    <div class="bg-white rounded-xl shadow overflow-hidden">
        @php
            $colores = ['recepcion'=>'bg-gray-500','diagnostico'=>'bg-yellow-500','reparacion'=>'bg-blue-600','lista'=>'bg-green-600','entregada'=>'bg-gray-800'];
            $etiquetas = ['recepcion'=>'En Recepcion','diagnostico'=>'En Diagnostico','reparacion'=>'En Reparacion','lista'=>'Lista para Entregar','entregada'=>'Entregada'];
            $color = $colores[$ot->estado] ?? 'bg-gray-500';
            $etiqueta = $etiquetas[$ot->estado] ?? $ot->estado;
            $estadosList = ['recepcion','diagnostico','reparacion','lista','entregada'];
            $indiceActual = array_search($ot->estado, $estadosList);
        @endphp

        <div class="{{ $color }} text-white px-6 py-5">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-sm opacity-80">Orden de Trabajo</p>
                    <h1 class="text-2xl font-bold">{{ $ot->numero_ot }}</h1>
                </div>
                <span class="bg-white bg-opacity-20 px-4 py-2 rounded-full text-sm font-semibold">{{ $etiqueta }}</span>
            </div>
        </div>

        <div class="px-6 py-5 border-b">
            <p class="text-xs text-gray-500 mb-3 font-medium uppercase tracking-wide">Progreso del servicio</p>
            <div class="flex items-center gap-1 mb-1">
                @foreach($estadosList as $i => $etapa)
                    <div class="flex-1 h-2 rounded-full {{ $i <= $indiceActual ? $color : 'bg-gray-200' }}"></div>
                @endforeach
            </div>
            <div class="flex justify-between text-xs text-gray-400">
                <span>Recepcion</span><span>Diagnostico</span><span>Reparacion</span><span>Lista</span><span>Entregada</span>
            </div>
        </div>

        <div class="px-6 py-5 grid grid-cols-2 gap-4 border-b">
            <div>
                <p class="text-xs text-gray-500 uppercase tracking-wide">Motocicleta</p>
                <p class="font-semibold text-gray-800">{{ $ot->motocicleta->marca }} {{ $ot->motocicleta->modelo }}</p>
                <p class="text-sm text-gray-500">{{ $ot->motocicleta->placa }}</p>
            </div>
            <div>
                <p class="text-xs text-gray-500 uppercase tracking-wide">Ingreso</p>
                <p class="font-semibold text-gray-800">{{ \Carbon\Carbon::parse($ot->fecha_ingreso)->format('d/m/Y') }}</p>
            </div>
            @if($ot->fecha_estimada_entrega)
            <div>
                <p class="text-xs text-gray-500 uppercase tracking-wide">Entrega estimada</p>
                <p class="font-semibold text-gray-800">{{ \Carbon\Carbon::parse($ot->fecha_estimada_entrega)->format('d/m/Y') }}</p>
            </div>
            @endif
            @if($ot->tecnico)
            <div>
                <p class="text-xs text-gray-500 uppercase tracking-wide">Tecnico asignado</p>
                <p class="font-semibold text-gray-800">{{ $ot->tecnico->nombre }}</p>
            </div>
            @endif
        </div>

        <div class="px-6 py-5 border-b">
            <p class="text-xs text-gray-500 uppercase tracking-wide mb-1">Problema reportado</p>
            <p class="text-gray-700">{{ $ot->problema_reportado }}</p>
        </div>

        @if($ot->diagnostico && $ot->diagnostico->estado === 'aprobado')
        <div class="px-6 py-4 border-b bg-green-50">
            <p class="text-xs text-green-700 font-medium mb-1">Diagnostico aprobado</p>
            <p class="text-gray-700 text-sm">{{ $ot->diagnostico->descripcion_fallas }}</p>
        </div>
        @elseif($ot->diagnostico && $ot->diagnostico->estado === 'esperando_aprobacion')
        <div class="px-6 py-4 border-b bg-yellow-50">
            <p class="text-xs text-yellow-700 font-medium mb-1">Diagnostico pendiente de aprobacion</p>
            <p class="text-gray-600 text-sm">El tecnico ha terminado el diagnostico. Nos pondremos en contacto con usted.</p>
        </div>
        @endif

        @if($ot->avances->count() > 0)
        <div class="px-6 py-5">
            <p class="text-xs text-gray-500 uppercase tracking-wide font-medium mb-3">Ultimos avances</p>
            <div class="space-y-3">
                @foreach($ot->avances->take(3) as $avance)
                <div class="flex gap-3">
                    <div class="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                    <div>
                        <p class="text-sm text-gray-700">{{ $avance->descripcion }}</p>
                        <p class="text-xs text-gray-400">{{ \Carbon\Carbon::parse($avance->fecha_hora)->format('d/m/Y H:i') }}</p>
                    </div>
                </div>
                @endforeach
            </div>
        </div>
        @endif
    </div>
    <p class="text-center text-gray-400 text-xs mt-4">Preguntas? Llamenos o visitenos en el taller.</p>
</div>
@endsection