<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Diagnostico extends Model
{
    protected $fillable = [
        'orden_trabajo_id', 'tecnico_id', 'descripcion_fallas', 'mano_obra_estimada',
        'tiempo_estimado_horas', 'prioridad_sugerida', 'estado', 'observaciones',
        'fecha_diagnostico', 'fecha_aprobacion', 'aprobado_por_id',
    ];

    protected $casts = [
        'fecha_diagnostico' => 'datetime',
        'fecha_aprobacion'  => 'datetime',
    ];

    public function ordenTrabajo(): BelongsTo
    {
        return $this->belongsTo(OrdenTrabajo::class);
    }

    public function tecnico(): BelongsTo
    {
        return $this->belongsTo(User::class, 'tecnico_id');
    }

    public function aprobadoPor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'aprobado_por_id');
    }
}
