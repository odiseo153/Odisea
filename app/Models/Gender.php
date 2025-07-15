<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Carbon;

/**
 * Modelo Gender: gestiona géneros musicales y sus metadatos.
 *
 * @property string $id UUID único del género
 * @property string $name Nombre del género musical
 * @property Carbon $created_at Fecha de creación
 * @property Carbon $updated_at Fecha de última actualización
 * @property ?Carbon $deleted_at Fecha de eliminación suave (opcional)
 * @property-read Collection|Song[] $songs Canciones del género
 * @property-read Collection|Interaction[] $interactions Interacciones del género
 * @property-read int $interactions_count Número de interacciones
 */
class Gender extends BaseModel
{
    /**
     * Los atributos que se pueden asignar masivamente.
     * Usando guarded vacío para permitir todos los campos.
     */
    protected $guarded = [];

    protected $appends = ['interactions_count'];

    public function songs()
    {
        return $this->belongsToMany(Song::class, 'gender_songs');
    }

    public function interactions()
    {
        return Interaction::whereHasMorph('interactable', [Song::class], function ($query) {
            $query->whereIn('id', $this->songs->pluck('id'));
        })->get();
    }

    public function getInteractionsCountAttribute()
    {
        return $this->interactions()->count();
    }
}
