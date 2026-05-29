<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FacturaItem extends Model
{
    protected $table = 'factura_items';

    protected $fillable = [
        'factura_id', 'tipo', 'descripcion', 'cantidad', 'precio_unitario', 'subtotal',
    ];

    public function factura(): BelongsTo
    {
        return $this->belongsTo(Factura::class);
    }
}
