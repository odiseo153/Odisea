<?php

namespace App\Models;

use Illuminate\Support\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

/**
 * Modelo FavoritePlaylist: gestiona relaciones entre usuarios y playlists favoritas.
 *
 * @property string $user_id UUID del usuario
 * @property string $playlist_id UUID de la playlist favorita
 * @property Carbon $created_at Fecha de creación
 * @property Carbon $updated_at Fecha de última actualización
 * @property ?Carbon $deleted_at Fecha de eliminación suave (opcional)
 * @property-read User $user Usuario que marcó la playlist como favorita
 * @property-read Playlist $playlist Playlist marcada como favorita
 */
class FavoritePlaylist extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The primary key for the model.
     */
    protected $primaryKey = ['user_id', 'playlist_id'];

    /**
     * Indicates if the IDs are auto-incrementing.
     */
    public $incrementing = false;

    /**
     * The "type" of the auto-incrementing ID.
     */
    protected $keyType = 'string';

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
