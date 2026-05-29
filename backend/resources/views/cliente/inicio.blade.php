@extends('layouts.cliente')
@section('title', 'Inicio')

@section('content')
{{-- Hero --}}
<section class="bg-blue-700 text-white py-20 px-4 text-center">
    <h1 class="text-4xl font-bold mb-4">Bienvenido al Taller Motos</h1>
    <p class="text-blue-200 text-lg mb-8 max-w-xl mx-auto">
        Consulte el estado de su motocicleta, solicite una cita o revise su historial de servicios.
    </p>
    <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <a href="{{ route('cliente.consultar') }}"
           class="bg-white text-blue-700 font-semibold px-8 py-3 rounded-lg hover:bg-blue-50 transition">
            🔍 Consultar estado de mi moto
        </a>
        <a href="{{ route('cliente.cita.form') }}"
           class="bg-blue-600 border border-white text-white font-semibold px-8 py-3 rounded-lg hover:bg-blue-500 transition">
            📅 Solicitar una cita
        </a>
    </div>
</section>

{{-- Servicios --}}
<section class="max-w-5xl mx-auto px-4 py-16">
    <h2 class="text-2xl font-bold text-gray-800 text-center mb-10">¿Qué puede hacer aquí?</h2>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        @foreach([
            ['🔍', 'Consultar su OT', 'Ingrese el número de OT o la placa de su moto para ver el avance en tiempo real.', route('cliente.consultar')],
            ['📅', 'Solicitar cita', 'Agende su próximo servicio de mantenimiento o reparación de forma fácil y rápida.', route('cliente.cita.form')],
            ['📋', 'Historial', 'Acceda al historial completo de servicios de sus motocicletas.', route('cliente.login')],
        ] as [$icon, $titulo, $desc, $link])
        <a href="{{ $link }}" class="block bg-white rounded-xl shadow hover:shadow-md transition p-6 text-center">
            <div class="text-4xl mb-3">{{ $icon }}</div>
            <h3 class="font-semibold text-gray-800 text-lg mb-2">{{ $titulo }}</h3>
            <p class="text-gray-500 text-sm">{{ $desc }}</p>
        </a>
        @endforeach
    </div>
</section>

{{-- Info --}}
<section class="bg-blue-50 py-12 px-4">
    <div class="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
        @foreach([
            ['⏱️', 'Control de tiempos', 'Sepa exactamente en qué etapa está su moto y cuándo estará lista.'],
            ['🔔', 'Notificaciones', 'Reciba avisos automáticos cuando su moto avance de etapa.'],
            ['🛡️', 'Garantías', 'Consulte el estado de la garantía de su servicio.'],
        ] as [$icon, $titulo, $desc])
        <div>
            <div class="text-3xl mb-2">{{ $icon }}</div>
            <h4 class="font-semibold text-gray-800 mb-1">{{ $titulo }}</h4>
            <p class="text-gray-500 text-sm">{{ $desc }}</p>
        </div>
        @endforeach
    </div>
</section>
@endsection
