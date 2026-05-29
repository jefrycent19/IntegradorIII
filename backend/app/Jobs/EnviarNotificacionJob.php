<?php

namespace App\Jobs;

use App\Models\Notificacion;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;

class EnviarNotificacionJob implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;         // Reintentos si falla
    public int $timeout = 30;      // Max 30 segundos por envío

    public function __construct(
        public readonly int    $notificacionId,
        public readonly string $canal,
        public readonly string $mensaje,
        public readonly string $telefono,
        public readonly string $email,
    ) {}

    public function handle(): void
    {
        $notificacion = Notificacion::find($this->notificacionId);
        if (! $notificacion) return;

        try {
            // Aquí va la integración real con el canal (email, SMS, WhatsApp)
            // Por ahora lo simulamos con un log
            match ($this->canal) {
                'email'    => Log::info("EMAIL enviado a {$this->email}: {$this->mensaje}"),
                'sms'      => Log::info("SMS enviado a {$this->telefono}: {$this->mensaje}"),
                'whatsapp' => Log::info("WhatsApp enviado a {$this->telefono}: {$this->mensaje}"),
                default    => Log::info("Notificacion interna: {$this->mensaje}"),
            };

            $notificacion->update(['estado' => 'enviada', 'fecha_envio' => now()]);

        } catch (\Throwable $e) {
            $notificacion->update(['estado' => 'fallida']);
            Log::error("Error notificacion #{$this->notificacionId}: " . $e->getMessage());
            throw $e; // Permite los reintentos
        }
    }
}
