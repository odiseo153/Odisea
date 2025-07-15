<?php

namespace App\Models;

use Illuminate\Support\Carbon;

/**
 * Modelo FavoritePlaylist: gestiona relaciones entre usuarios y playlists favoritas.
 *
 * @property string $id UUID único de la relación
 * @property string $user_id UUID del usuario
 * @property string $playlist_id UUID de la playlist favorita
 * @property Carbon $created_at Fecha de creación
 * @property Carbon $updated_at Fecha de última actualización
 * @property ?Carbon $deleted_at Fecha de eliminación suave (opcional)
 * @property-read User $user Usuario que marcó la playlist como favorita
 * @property-read Playlist $playlist Playlist marcada como favorita
 */
class FavoritePlaylist extends BaseModel
{
    /**
     * Los atributos que se pueden asignar masivamente.
     * Usando guarded vacío para permitir todos los campos.
     */
    protected $guarded = [];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function playlist()
    {
        return $this->belongsTo(Playlist::class);
    }
}
