<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OtTiempoEtapa extends Model
{
    protected $table = 'ot_tiempos_etapa';

    protected $fillable = [
        'orden_trabajo_id', 'etapa', 'inicio', 'fin', 'tiempo_limite_horas', 'semaforo',
    ];

    protected $casts = [
        'inicio' => 'datetime',
        'fin'    => 'datetime',
    ];

    public function ordenTrabajo(): BelongsTo
    {
        return $this->belongsTo(OrdenTrabajo::class);
    }
}
