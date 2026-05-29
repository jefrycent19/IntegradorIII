<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Repuesto extends Model
{
    protected $fillable = [
        'codigo', 'nombre', 'descripcion', 'categoria', 'precio_costo', 'precio_venta',
        'stock_actual', 'stock_minimo', 'unidad', 'proveedor', 'activo',
    ];

    protected $casts = ['activo' => 'boolean'];

    public function otRepuestos(): HasMany
    {
        return $this->hasMany(OtRepuesto::class);
    }

    public function movimientos(): HasMany
    {
        return $this->hasMany(MovimientoInventario::class);
    }

    public function stockBajo(): bool
    {
        return $this->stock_actual <= $this->stock_minimo;
    }
}
