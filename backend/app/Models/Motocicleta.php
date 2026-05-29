<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Motocicleta extends Model
{
    protected $fillable = [
        'cliente_id', 'marca', 'modelo', 'anio', 'placa', 'color',
        'numero_chasis', 'numero_motor', 'kilometraje_actual', 'foto_url', 'notas', 'activo',
    ];

    protected $casts = ['activo' => 'boolean'];

    public function cliente(): BelongsTo
    {
        return $this->belongsTo(Cliente::class);
    }

    public function citas(): HasMany
    {
        return $this->hasMany(Cita::class);
    }

    public function ordenesTrabajo(): HasMany
    {
        return $this->hasMany(OrdenTrabajo::class);
    }
}
