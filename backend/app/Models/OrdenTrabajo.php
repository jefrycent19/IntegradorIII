<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class OrdenTrabajo extends Model
{
    protected $table = 'ordenes_trabajo';

    protected $fillable = [
        'numero_ot', 'cita_id', 'cliente_id', 'motocicleta_id', 'recepcionista_id',
        'tecnico_id', 'jefe_taller_id', 'estado', 'prioridad', 'fecha_ingreso',
        'fecha_estimada_entrega', 'fecha_entrega_real', 'kilometraje_ingreso',
        'nivel_combustible', 'estado_fisico', 'accesorios_entregados',
        'problema_reportado', 'observaciones_generales',
    ];

    protected $casts = [
        'fecha_ingreso'          => 'datetime',
        'fecha_estimada_entrega' => 'datetime',
        'fecha_entrega_real'     => 'datetime',
    ];

    public function cliente(): BelongsTo
    {
        return $this->belongsTo(Cliente::class);
    }

    public function motocicleta(): BelongsTo
    {
        return $this->belongsTo(Motocicleta::class);
    }

    public function cita(): BelongsTo
    {
        return $this->belongsTo(Cita::class);
    }

    public function recepcionista(): BelongsTo
    {
        return $this->belongsTo(User::class, 'recepcionista_id');
    }

    public function tecnico(): BelongsTo
    {
        return $this->belongsTo(User::class, 'tecnico_id');
    }

    public function jefeTaller(): BelongsTo
    {
        return $this->belongsTo(User::class, 'jefe_taller_id');
    }

    public function diagnostico(): HasOne
    {
        return $this->hasOne(Diagnostico::class);
    }

    public function checklist(): HasOne
    {
        return $this->hasOne(ChecklistEntrega::class);
    }

    public function factura(): HasOne
    {
        return $this->hasOne(Factura::class);
    }

    public function garantia(): HasOne
    {
        return $this->hasOne(Garantia::class);
    }

    public function avances(): HasMany
    {
        return $this->hasMany(OtAvance::class);
    }

    public function tiemposEtapa(): HasMany
    {
        return $this->hasMany(OtTiempoEtapa::class);
    }

    public function repuestos(): HasMany
    {
        return $this->hasMany(OtRepuesto::class);
    }

    public function evidencias(): HasMany
    {
        return $this->hasMany(Evidencia::class);
    }

    public function notificaciones(): HasMany
    {
        return $this->hasMany(Notificacion::class);
    }

    public function encuesta(): HasOne
    {
        return $this->hasOne(EncuestaSatisfaccion::class);
    }
}
