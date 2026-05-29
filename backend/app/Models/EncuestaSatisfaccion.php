<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EncuestaSatisfaccion extends Model
{
    protected $table = 'encuestas_satisfaccion';

    protected $fillable = [
        'orden_trabajo_id', 'cliente_id', 'puntuacion', 'comentario', 'fecha',
    ];

    protected $casts = ['fecha' => 'datetime'];

    public function ordenTrabajo(): BelongsTo
    {
        return $this->belongsTo(OrdenTrabajo::class);
    }

    public function cliente(): BelongsTo
    {
        return $this->belongsTo(Cliente::class);
    }
}
