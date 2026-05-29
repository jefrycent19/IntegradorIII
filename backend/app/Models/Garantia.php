<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Garantia extends Model
{
    protected $fillable = [
        'orden_trabajo_id', 'factura_id', 'descripcion', 'fecha_inicio', 'fecha_fin',
        'cubre_repuestos', 'cubre_mano_obra', 'estado', 'notas',
    ];

    protected $casts = [
        'fecha_inicio'    => 'date',
        'fecha_fin'       => 'date',
        'cubre_repuestos' => 'boolean',
        'cubre_mano_obra' => 'boolean',
    ];

    public function ordenTrabajo(): BelongsTo
    {
        return $this->belongsTo(OrdenTrabajo::class);
    }

    public function factura(): BelongsTo
    {
        return $this->belongsTo(Factura::class);
    }

    public function reclamos(): HasMany
    {
        return $this->hasMany(ReclamoGarantia::class);
    }
}
