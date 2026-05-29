<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Tecnico extends Model
{
    protected $fillable = ['user_id', 'especialidades', 'horas_diarias_disponibles', 'activo'];

    protected $casts = [
        'especialidades'           => 'array',
        'horas_diarias_disponibles'=> 'decimal:1',
        'activo'                   => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
