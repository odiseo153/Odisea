<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Carbon;

/**
 * Modelo Album: gestiona álbumes musicales y sus metadatos.
 *
 * @property string $id UUID único del álbum
 * @property string $name Nombre del álbum
 * @property string $artist_id UUID del artista propietario
 * @property string $owner_id UUID del usuario propietario
 * @property ?string $cover_url URL de la portada del álbum (opcional)
 * @property int $year Año de lanzamiento
 * @property Carbon $created_at Fecha de creación
 * @property Carbon $updated_at Fecha de última actualización
 * @property ?Carbon $deleted_at Fecha de eliminación suave (opcional)
 * @property-read Artist $artist Artista del álbum
 * @property-read User $owner Usuario propietario del álbum
 * @property-read Collection|Song[] $songs Canciones del álbum
 * @property-read Collection|Interaction[] $interactions Interacciones del álbum
 */
class Album extends BaseModel
{
    /**
     * Los atributos que se pueden asignar masivamente.
     * Usando guarded vacío para permitir todos los campos.
     */
    protected $guarded = [];

    public function artist()
    {
        return $this->belongsTo(Artist::class);
    }

    public function owner()
    {
        return $this->belongsTo(User::class,'owner_id');
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
