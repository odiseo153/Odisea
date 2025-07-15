<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Carbon;

/**
 * Modelo FavoriteSong: gestiona relaciones entre usuarios y canciones favoritas.
 *
 * @property string $user_id UUID del usuario
 * @property string $song_id UUID de la canción favorita
 * @property Carbon $created_at Fecha de creación
 * @property Carbon $updated_at Fecha de última actualización
 * @property ?Carbon $deleted_at Fecha de eliminación suave (opcional)
 * @property-read User $user Usuario que marcó la canción como favorita
 * @property-read Song $song Canción marcada como favorita
 */
class FavoriteSong extends Model
{
    use SoftDeletes;

    /**
     * Los atributos que se pueden asignar masivamente.
     * Usando guarded vacío para permitir todos los campos.
     */
    protected $guarded = [];

    // No tiene un campo id único, usa clave primaria compuesta
    public $incrementing = false;
    protected $primaryKey = ['user_id', 'song_id'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function song()
    {
        return $this->belongsTo(Song::class);
    }
}
