@extends('layouts.cliente')
@section('title', 'Consultar estado')
@section('content')
<div class="max-w-lg mx-auto px-4 py-12">
    <div class="bg-white rounded-xl shadow p-8">
        <h1 class="text-2xl font-bold text-gray-800 mb-2">Consultar estado de mi moto</h1>
        <p class="text-gray-500 text-sm mb-6">Ingrese el numero de OT o la placa de su motocicleta.</p>
        <form method="POST" action="{{ route('cliente.consultar.buscar') }}" class="space-y-4">
            @csrf
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Numero de OT o Placa</label>
                <input type="text" name="busqueda" value="{{ old('busqueda') }}"
                    placeholder="Ej: OT-2026-00001 o ABC-123"
                    class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required>
                @error('busqueda')
                    <p class="text-red-500 text-xs mt-1">{{ $message }}</p>
                @enderror
            </div>
            <button type="submit"
                class="w-full bg-blue-700 text-white font-semibold py-2.5 rounded-lg hover:bg-blue-600 transition">
                Buscar
            </button>
        </form>
    </div>
</div>
@endsection