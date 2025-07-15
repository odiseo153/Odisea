<?php

namespace App\Models;

use App\Traits\ModelHelperTrait;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Carbon;

/**
 * Modelo Song: gestiona canciones y sus metadatos.
 *
 * @property string $id UUID único de la canción
 * @property ?string $platform_id UUID de la plataforma (opcional)
 * @property ?string $artist_id UUID del artista (opcional)
 * @property ?string $album_id UUID del álbum (opcional)
 * @property string $added_by UUID del usuario que agregó la canción
 * @property string $title Título de la canción
 * @property int $duration Duración en segundos
 * @property ?string $cover_url URL de la portada (opcional)
 * @property Carbon $created_at Fecha de creación
 * @property Carbon $updated_at Fecha de última actualización
 * @property ?Carbon $deleted_at Fecha de eliminación suave (opcional)
 * @property-read ?Platform $platform Plataforma de origen
 * @property-read ?Artist $artist Artista de la canción
 * @property-read ?Album $album Álbum de la canción
 * @property-read User $addedBy Usuario que agregó la canción
 * @property-read ?Download $download Descarga asociada
 * @property-read Collection|Gender[] $genders Géneros de la canción
 * @property-read Collection|User[] $favoriteUsers Usuarios que marcaron como favorita
 * @property-read Collection|Interaction[] $interactions Interacciones de la canción
 * @property-read Collection|Song[] $other_songs Otras canciones del mismo artista
 * @property-read int $play_count Número de reproducciones
 */
class Song extends BaseModel
{
    use ModelHelperTrait;

    /**
     * Los atributos que se pueden asignar masivamente.
     * Usando guarded vacío para permitir todos los campos.
     */
    protected $guarded = [];

    // Removed heavy eager loading to improve performance
     protected $with = ['artist','download'];
    // Removed appends to avoid N+1 query problems
    // protected $appends = ['other_songs','play_count'];

    // Use this method when you need minimal Song data
    public function scopeMinimal($query)
    {
        return $query->select('id', 'title', 'duration', 'artist_id', 'album_id', 'cover_url');
    }

    // Use this method when you need full Song data with relationships
    public function scopeWithRelations($query)
    {
        return $query->with(['platform', 'artist', 'album', 'download']);
    }

    public function platform()
    {
        return $this->belongsTo(Platform::class);
    }

    public function interactions()
    {
        return $this->morphMany(Interaction::class, 'interactable');
    }

    public function artist()
    {
        return $this->belongsTo(Artist::class);
    }

    public function album()
    {
        return $this->belongsTo(Album::class);
    }

    public function download()
    {
        return $this->hasOne(Download::class);
    }

    public function genders()
    {
        return $this->belongsToMany(Gender::class, 'gender_songs');
    }

    public function addedBy()
    {
        return $this->belongsTo(User::class, 'added_by');
    }

    public function favoriteUsers()
    {
       return $this->belongsToMany(User::class, 'favorite_songs');
    }

    // Optimized methods - call these explicitly when needed, not as accessors
    public function getOtherSongs()
    {
        return Song::where('artist_id', $this->artist_id)
            ->where('id', '!=', $this->id)
            ->limit(10) // Limit to prevent excessive data loading
            ->get();
    }

    public function getPlayCount()
    {
        return $this->interactions()->sum('play_count') ?? 0;
    }

    // Keep accessors but make them lazy-loaded and cached
    public function getOtherSongsAttribute()
    {
        return $this->getOtherSongs();
    }

    public function getPlayCountAttribute()
    {
        return $this->getPlayCount();
    }
}
