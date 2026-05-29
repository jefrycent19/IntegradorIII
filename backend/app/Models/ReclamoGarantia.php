<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ReclamoGarantia extends Model
{
    protected $table = 'reclamos_garantia';

    protected $fillable = [
        'garantia_id', 'fecha_reclamo', 'descripcion_problema',
        'estado', 'resolucion', 'fecha_resolucion',
    ];

    protected $casts = [
        'fecha_reclamo'    => 'datetime',
        'fecha_resolucion' => 'datetime',
    ];

    public function garantia(): BelongsTo
    {
        return $this->belongsTo(Garantia::class);
    }
}
