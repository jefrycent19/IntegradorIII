<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Auth\Notifications\ResetPassword as ResetPasswordNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        if (! Auth::attempt(['email' => $request->email, 'password' => $request->password])) {
            throw ValidationException::withMessages([
                'email' => ['Las credenciales no son correctas.'],
            ]);
        }

        $user = Auth::user();

        if (! $user->activo) {
            Auth::logout();
            return response()->json(['message' => 'Tu cuenta está desactivada.'], 403);
        }

        $token = $user->createToken('api-token', ['*'], now()->addDays(7))->plainTextToken;

        return response()->json([
            'token' => $token,
            'user'  => [
                'id'       => $user->id,
                'nombre'   => $user->nombre,
                'apellido' => $user->apellido,
                'email'    => $user->email,
                'rol'      => $user->rol->nombre,
            ],
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user()->load('rol');

        return response()->json([
            'id'       => $user->id,
            'nombre'   => $user->nombre,
            'apellido' => $user->apellido,
            'email'    => $user->email,
            'telefono' => $user->telefono,
            'activo'   => $user->activo,
            'rol'      => $user->rol->nombre,
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Sesión cerrada correctamente.']);
    }

    public function forgotPassword(Request $request): JsonResponse
    {
        $request->validate(['email' => 'required|email']);

        ResetPasswordNotification::createUrlUsing(function ($user, $token) {
            $frontend = config('app.frontend_url', 'http://localhost:5173');
            return $frontend . '/reset-password?token=' . $token . '&email=' . urlencode($user->email);
        });

        Password::sendResetLink($request->only('email'));

        return response()->json(['message' => 'Si el correo está registrado, recibirás las instrucciones de recuperación.']);
    }

    public function resetPassword(Request $request): JsonResponse
    {
        $request->validate([
            'token'                 => 'required',
            'email'                 => 'required|email',
            'password'              => 'required|string|min:8|confirmed',
        ]);

        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function ($user, $password) {
                $user->forceFill([
                    'password'       => Hash::make($password),
                    'remember_token' => Str::random(60),
                ])->save();
                $user->tokens()->delete();
                event(new PasswordReset($user));
            }
        );

        if ($status === Password::PASSWORD_RESET) {
            return response()->json(['message' => 'Contraseña restablecida correctamente.']);
        }

        return response()->json(['message' => 'El enlace es inválido o ya expiró.'], 422);
    }
}
