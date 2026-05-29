<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OtAvance extends Model
{
    protected $table = 'ot_avances';

    protected $fillable = ['orden_trabajo_id', 'tecnico_id', 'descripcion', 'fecha_hora'];

    protected $casts = ['fecha_hora' => 'datetime'];

    public function ordenTrabajo(): BelongsTo
    {
        return $this->belongsTo(OrdenTrabajo::class);
    }

    public function tecnico(): BelongsTo
    {
        return $this->belongsTo(User::class, 'tecnico_id');
    }
}
