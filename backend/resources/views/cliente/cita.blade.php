@extends('layouts.cliente')
@section('title', 'Solicitar Cita')
@section('content')
<div class="max-w-lg mx-auto px-4 py-12">
    <div class="bg-white rounded-xl shadow p-8">
        <h1 class="text-2xl font-bold text-gray-800 mb-2">Solicitar una cita</h1>
        <p class="text-gray-500 text-sm mb-6">Complete el formulario y nos pondremos en contacto para confirmar.</p>

        <form method="POST" action="{{ route('cliente.cita.guardar') }}" class="space-y-4">
            @csrf
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                    <input type="text" name="nombre" value="{{ old('nombre') }}" required
                        class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
                    @error('nombre') <p class="text-red-500 text-xs mt-1">{{ $message }}</p> @enderror
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Apellido *</label>
                    <input type="text" name="apellido" value="{{ old('apellido') }}" required
                        class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
                </div>
            </div>

            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Telefono *</label>
                <input type="tel" name="telefono" value="{{ old('telefono') }}" required
                    placeholder="8888-0000"
                    class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
                @error('telefono') <p class="text-red-500 text-xs mt-1">{{ $message }}</p> @enderror
            </div>

            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Correo electronico</label>
                <input type="email" name="email" value="{{ old('email') }}"
                    class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
            </div>

            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Marca de la moto *</label>
                    <input type="text" name="marca_moto" value="{{ old('marca_moto') }}" required
                        placeholder="Ej: Honda"
                        class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Placa *</label>
                    <input type="text" name="placa_moto" value="{{ old('placa_moto') }}" required
                        placeholder="ABC-123"
                        class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
                </div>
            </div>

            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Tipo de servicio *</label>
                <select name="tipo_servicio" required
                    class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
                    <option value="">Seleccionar...</option>
                    <option value="preventivo" {{ old('tipo_servicio') == 'preventivo' ? 'selected' : '' }}>Mantenimiento preventivo</option>
                    <option value="reparacion" {{ old('tipo_servicio') == 'reparacion' ? 'selected' : '' }}>Reparacion</option>
                    <option value="diagnostico" {{ old('tipo_servicio') == 'diagnostico' ? 'selected' : '' }}>Diagnostico</option>
                    <option value="garantia" {{ old('tipo_servicio') == 'garantia' ? 'selected' : '' }}>Garantia</option>
                    <option value="emergencia" {{ old('tipo_servicio') == 'emergencia' ? 'selected' : '' }}>Emergencia</option>
                </select>
                @error('tipo_servicio') <p class="text-red-500 text-xs mt-1">{{ $message }}</p> @enderror
            </div>

            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Fecha preferida *</label>
                <input type="date" name="fecha_preferida" value="{{ old('fecha_preferida') }}" required
                    min="{{ date('Y-m-d', strtotime('+1 day')) }}"
                    class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
                @error('fecha_preferida') <p class="text-red-500 text-xs mt-1">{{ $message }}</p> @enderror
            </div>

            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Descripcion del problema *</label>
                <textarea name="descripcion" rows="3" required
                    placeholder="Describa el problema o servicio que necesita..."
                    class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">{{ old('descripcion') }}</textarea>
                @error('descripcion') <p class="text-red-500 text-xs mt-1">{{ $message }}</p> @enderror
            </div>

            <button type="submit"
                class="w-full bg-blue-700 text-white font-semibold py-3 rounded-lg hover:bg-blue-600 transition">
                Solicitar cita
            </button>
        </form>
    </div>
</div>
@endsection