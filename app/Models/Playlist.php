<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Carbon;

/**
 * Modelo Playlist: gestiona listas de reproducción y sus metadatos.
 *
 * @property string $id UUID único de la playlist
 * @property string $name Nombre de la playlist
 * @property string $user_id UUID del usuario creador
 * @property bool $is_public Indica si la playlist es pública
 * @property ?string $cover_image URL de la imagen de portada (opcional)
 * @property Carbon $created_at Fecha de creación
 * @property Carbon $updated_at Fecha de última actualización
 * @property ?Carbon $deleted_at Fecha de eliminación suave (opcional)
 * @property-read User $creator Usuario creador de la playlist
 * @property-read Collection|Song[] $songs Canciones de la playlist
 * @property-read Collection|Interaction[] $interactions Interacciones de la playlist
 * @property-read int $play_count Número de reproducciones
 */
class Playlist extends BaseModel
{
    /**
     * Los atributos que se pueden asignar masivamente.
     * Usando guarded vacío para permitir todos los campos.
     */
    protected $guarded = [];

    protected $with = ['creator', 'songs'];
    protected $appends = ['play_count'];

    public function creator()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function songs()
    {
        return $this->belongsToMany(Song::class,'playlist_songs');
    }

    public function interactions()
    {
        return $this->morphMany(Interaction::class, 'interactable');
    }

    public function getPlayCountAttribute()
    {
        return $this->interactions()->sum('play_count');
    }
}

