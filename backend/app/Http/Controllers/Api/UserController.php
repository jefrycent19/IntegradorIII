<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $users = User::with('rol')
            ->when($request->rol, fn($q, $r) => $q->whereHas('rol', fn($q) => $q->where('nombre', $r)))
            ->when($request->activo !== null, fn($q) => $q->where('activo', $request->boolean('activo')))
            ->orderBy('nombre')
            ->get();

        return response()->json($users);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'rol_id'   => 'required|exists:roles,id',
            'nombre'   => 'required|string|max:100',
            'apellido' => 'required|string|max:100',
            'email'    => 'required|email|unique:users',
            'password' => 'required|string|min:8',
            'telefono' => 'nullable|string|max:20',
        ]);

        $data['password'] = Hash::make($data['password']);
        $user = User::create($data);

        return response()->json($user->load('rol'), 201);
    }

    public function update(Request $request, User $user): JsonResponse
    {
        $data = $request->validate([
            'rol_id'   => 'sometimes|exists:roles,id',
            'nombre'   => 'sometimes|string|max:100',
            'apellido' => 'sometimes|string|max:100',
            'email'    => 'sometimes|email|unique:users,email,' . $user->id,
            'password' => 'nullable|string|min:8',
            'telefono' => 'nullable|string|max:20',
            'activo'   => 'sometimes|boolean',
        ]);

        if (isset($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        } else {
            unset($data['password']);
        }

        $user->update($data);

        return response()->json($user->load('rol'));
    }

    public function destroy(User $user): JsonResponse
    {
        $user->update(['activo' => false]);

        return response()->json(['message' => 'Usuario desactivado correctamente.']);
    }
}