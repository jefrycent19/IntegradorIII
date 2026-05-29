<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>@yield('title', 'Taller Motos') — Taller Motos</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style> body { font-family: 'Inter', sans-serif; } </style>
</head>
<body class="bg-gray-50 min-h-screen flex flex-col">

    {{-- Navbar --}}
    <nav class="bg-blue-700 text-white shadow-lg">
        <div class="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
            <a href="{{ route('cliente.inicio') }}" class="flex items-center gap-2 font-bold text-xl">
                🏍️ Taller Motos
            </a>
            <div class="flex items-center gap-4 text-sm">
                <a href="{{ route('cliente.consultar') }}" class="hover:text-blue-200 transition">Consultar OT</a>
                <a href="{{ route('cliente.cita.form') }}" class="hover:text-blue-200 transition">Solicitar Cita</a>
                @if(session('cliente_id'))
                    <a href="{{ route('cliente.dashboard') }}" class="hover:text-blue-200 transition">Mi Cuenta</a>
                    <form method="POST" action="{{ route('cliente.logout') }}" class="inline">
                        @csrf
                        <button class="bg-blue-600 hover:bg-blue-500 px-3 py-1 rounded transition">Salir</button>
                    </form>
                @else
                    <a href="{{ route('cliente.login') }}" class="bg-blue-600 hover:bg-blue-500 px-3 py-1 rounded transition">Ingresar</a>
                @endif
            </div>
        </div>
    </nav>

    {{-- Flash messages --}}
    @if(session('success'))
        <div class="max-w-5xl mx-auto w-full px-4 mt-4">
            <div class="bg-green-100 border border-green-400 text-green-800 px-4 py-3 rounded">
                {{ session('success') }}
            </div>
        </div>
    @endif
    @if(session('error'))
        <div class="max-w-5xl mx-auto w-full px-4 mt-4">
            <div class="bg-red-100 border border-red-400 text-red-800 px-4 py-3 rounded">
                {{ session('error') }}
            </div>
        </div>
    @endif

    {{-- Contenido --}}
    <main class="flex-1">
        @yield('content')
    </main>

    {{-- Footer --}}
    <footer class="bg-gray-800 text-gray-400 text-center text-sm py-4 mt-8">
        &copy; {{ date('Y') }} Taller Motos — Sistema de Gestión
    </footer>
</body>
</html>
