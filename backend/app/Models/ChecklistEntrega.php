<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ChecklistEntrega extends Model
{
    protected $table = 'checklist_entrega';

    protected $fillable = [
        'orden_trabajo_id', 'prueba_realizada', 'lavado', 'calidad_revisada',
        'facturacion_lista', 'cliente_notificado', 'notas', 'revisado_por_id', 'fecha',
    ];

    protected $casts = [
        'prueba_realizada'   => 'boolean',
        'lavado'             => 'boolean',
        'calidad_revisada'   => 'boolean',
        'facturacion_lista'  => 'boolean',
        'cliente_notificado' => 'boolean',
        'fecha'              => 'datetime',
    ];

    public function ordenTrabajo(): BelongsTo
    {
        return $this->belongsTo(OrdenTrabajo::class);
    }

    public function revisadoPor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'revisado_por_id');
    }
}
