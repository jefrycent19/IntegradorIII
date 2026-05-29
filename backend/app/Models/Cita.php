<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Cita extends Model
{
    protected $fillable = [
        'cliente_id', 'motocicleta_id', 'recepcionista_id', 'fecha_hora',
        'duracion_estimada_min', 'tipo_servicio', 'descripcion_problema', 'estado', 'notas',
    ];

    protected $casts = ['fecha_hora' => 'datetime'];

    public function cliente(): BelongsTo
    {
        return $this->belongsTo(Cliente::class);
    }

    public function motocicleta(): BelongsTo
    {
        return $this->belongsTo(Motocicleta::class);
    }

    public function recepcionista(): BelongsTo
    {
        return $this->belongsTo(User::class, 'recepcionista_id');
    }

    public function ordenTrabajo(): HasOne
    {
        return $this->hasOne(OrdenTrabajo::class, 'cita_id');
    }
}
