<?php

namespace App\Models;

use Illuminate\Support\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

/**
 * Modelo GenderSong: gestiona relaciones entre géneros musicales y canciones.
 *
 * @property int $id ID único de la relación
 * @property string $gender_id UUID del género musical
 * @property string $song_id UUID de la canción
 * @property Carbon $created_at Fecha de creación
 * @property Carbon $updated_at Fecha de última actualización
 * @property ?Carbon $deleted_at Fecha de eliminación suave (opcional)
 * @property-read Gender $gender Género musical asociado
 * @property-read Song $song Canción asociada
 */
class GenderSong extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * Los atributos que se pueden asignar masivamente.
     * Usando guarded vacío para permitir todos los campos.
     */
    protected $guarded = [];

    public function gender()
    {
        return $this->belongsTo(Gender::class);
    }

    public function song()
    {
        return $this->belongsTo(Song::class);
    }
}
