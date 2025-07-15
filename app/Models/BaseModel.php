<?php

namespace App\Models;

use Illuminate\Support\Str;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Carbon;

/**
 * Clase base BaseModel: proporciona funcionalidad común a todos los modelos.
 *
 * @property string $id UUID único del modelo
 * @property Carbon $created_at Fecha de creación
 * @property Carbon $updated_at Fecha de última actualización
 * @property ?Carbon $deleted_at Fecha de eliminación suave (opcional)
 * @property-read string $created_at_formatted Fecha de creación formateada
 */
abstract class BaseModel extends Model
{
    use SoftDeletes, HasFactory, HasUuids;

    protected $keyType = 'string';
    public $incrementing = false; // UUIDs no son auto-incrementales

    /**
     * Los atributos que se pueden asignar masivamente.
     * Usando guarded vacío para permitir todos los campos.
     */
    protected $guarded = [];

    protected $hidden = ['deleted_at',  'updated_at']; // Ocultar relaciones intermedias por defecto

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // 🔍 Scopes comunes
    public function scopeRecent(Builder $query, int $limit = 10): Builder
    {
        return $query->latest()->limit($limit);
    }

    public function getWith(): array
    {
        return $this->with ?? [];
    }

    public function scopeSearch(Builder $query, string $column, string $term): Builder
    {
        return $query->where($column, 'LIKE', "%{$term}%");
    }

    // 🔁 Método para actualizar o crear fácilmente
    public static function updateOrCreateBy(array $attributes, array $values = [])
    {
        return static::updateOrCreate($attributes, $values);
    }

    // 🔁 Método para encontrar por ID o lanzar excepción
    public static function findOrFailOrAbort($id, $code = 404)
    {
        return static::findOr($id, fn () => abort($code));
    }

    // 🔒 Evitar modificación de timestamps si no hay cambios
    public function saveQuietlyIfDirty(array $attributes = [])
    {
        if ($this->isDirty()) {
            return $this->saveQuietly();
        }
        return false;
    }

    // 🧪 Accesor personalizado (ejemplo)
    public function getCreatedAtFormattedAttribute(): string
    {
        return $this->created_at?->format('Y-m-d H:i:s') ?? '';
    }

    // 🧪 Helper para slug, si es necesario
    public static function slugify(string $value): string
    {
        return Str::slug($value);
    }
}
