<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OtRepuesto extends Model
{
    protected $table = 'ot_repuestos';

    protected $fillable = [
        'orden_trabajo_id', 'repuesto_id', 'cantidad', 'precio_unitario', 'estado', 'notas',
    ];

    public function ordenTrabajo(): BelongsTo
    {
        return $this->belongsTo(OrdenTrabajo::class);
    }

    public function repuesto(): BelongsTo
    {
        return $this->belongsTo(Repuesto::class);
    }
}
