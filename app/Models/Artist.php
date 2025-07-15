<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Carbon;

/**
 * Modelo Artist: gestiona artistas musicales y sus metadatos.
 *
 * @property string $id UUID único del artista
 * @property string $name Nombre del artista
 * @property ?string $image_url URL de la imagen del artista (opcional)
 * @property ?string $bio Biografía del artista (opcional)
 * @property Carbon $created_at Fecha de creación
 * @property Carbon $updated_at Fecha de última actualización
 * @property ?Carbon $deleted_at Fecha de eliminación suave (opcional)
 * @property-read Collection|Album[] $albums Álbumes del artista
 * @property-read Collection|Song[] $songs Canciones del artista
 * @property-read Collection|Interaction[] $interactions Interacciones del artista
 */
class Artist extends BaseModel
{
    /**
     * Los atributos que se pueden asignar masivamente.
     * Usando guarded vacío para permitir todos los campos.
     */
    protected $guarded = [];

    public function albums()
    {
        return $this->hasMany(Album::class);
    }

    public function songs()
    {
        return $this->hasMany(Song::class);
    }

    public function interactions()
    {
        return $this->morphMany(Interaction::class, 'interactable');
    }
}
