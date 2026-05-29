<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Factura extends Model
{
    protected $fillable = [
        'numero_factura', 'orden_trabajo_id', 'cliente_id', 'fecha',
        'subtotal', 'impuesto', 'descuento', 'total', 'metodo_pago', 'estado', 'notas',
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

    public function items(): HasMany
    {
        return $this->hasMany(FacturaItem::class);
    }

    public function garantia(): HasOne
    {
        return $this->hasOne(Garantia::class);
    }
}
