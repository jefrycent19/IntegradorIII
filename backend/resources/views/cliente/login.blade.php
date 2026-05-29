@extends('layouts.cliente')
@section('title', 'Ingresar')
@section('content')
<div class="max-w-md mx-auto px-4 py-16">
    <div class="bg-white rounded-xl shadow p-8">
        <div class="text-center mb-6">
            <div class="text-4xl mb-2">🏍️</div>
            <h1 class="text-2xl font-bold text-gray-800">Acceso a Mi Cuenta</h1>
            <p class="text-gray-500 text-sm mt-1">Ingrese con su correo y cedula registrados en el taller.</p>
        </div>
        <form method="POST" action="{{ route('cliente.login.post') }}" class="space-y-4">
            @csrf
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Correo electronico</label>
                <input type="email" name="email" value="{{ old('email') }}" required autofocus
                    class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                @error('email') <p class="text-red-500 text-xs mt-1">{{ $message }}</p> @enderror
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Cedula (sin guiones)</label>
                <input type="text" name="cedula" value="{{ old('cedula') }}" required placeholder="Ej: 501234567"
                    class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                @error('cedula') <p class="text-red-500 text-xs mt-1">{{ $message }}</p> @enderror
            </div>
            <button type="submit"
                class="w-full bg-blue-700 text-white font-semibold py-2.5 rounded-lg hover:bg-blue-600 transition">
                Ingresar
            </button>
        </form>
        <p class="text-center text-xs text-gray-400 mt-6">
            Si no tiene cuenta registrada, visítenos en el taller o solicite una cita.
        </p>
    </div>
</div>
@endsection