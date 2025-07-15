<?php

namespace App\Models;

use Illuminate\Support\Carbon;

/**
 * Modelo PlaylistSong: gestiona relaciones entre playlists y canciones.
 *
 * @property string $id UUID único de la relación
 * @property string $playlist_id UUID de la playlist
 * @property string $song_id UUID de la canción
 * @property Carbon $created_at Fecha de creación
 * @property Carbon $updated_at Fecha de última actualización
 * @property ?Carbon $deleted_at Fecha de eliminación suave (opcional)
 * @property-read Playlist $playlist Playlist asociada
 * @property-read Song $song Canción asociada
 */
class PlaylistSong extends BaseModel
{
    /**
     * Los atributos que se pueden asignar masivamente.
     * Usando guarded vacío para permitir todos los campos.
     */
    protected $guarded = [];

    public function playlist()
    {
        return $this->belongsTo(Playlist::class);
    }

    public function song()
    {
        return $this->belongsTo(Song::class);
    }
}
