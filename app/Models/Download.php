<?php

namespace App\Models;

use App\Traits\ModelHelperTrait;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Carbon;

/**
 * Modelo Download: gestiona descargas de canciones y sus metadatos.
 *
 * @property string $id UUID único de la descarga
 * @property string $user_id UUID del usuario que realizó la descarga
 * @property string $song_id UUID de la canción descargada
 * @property string $file_path Ruta del archivo descargado
 * @property Carbon $created_at Fecha de creación
 * @property Carbon $updated_at Fecha de última actualización
 * @property ?Carbon $deleted_at Fecha de eliminación suave (opcional)
 * @property-read User $user Usuario que realizó la descarga
 * @property-read Song $song Canción descargada
 */
class Download extends BaseModel
{
    use ModelHelperTrait;

    /**
     * Los atributos que se pueden asignar masivamente.
     * Usando guarded vacío para permitir todos los campos.
     */
    protected $guarded = [];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function song()
    {
        return $this->belongsTo(Song::class);
    }

    public function setFilePathAttribute($value)
    {
        // Si el valor es base64, lo procesamos, si no, lo asignamos tal cual
        if ($this->isBase64($value)) {
            $this->attributes['file_path'] = $this->handleBase64File($value, 'downloads');
        } else {
            $this->attributes['file_path'] = $value;
        }
    }

    protected function isBase64($value)
    {
        // Detecta si el string parece ser base64 (data URI o solo base64)
        if (is_string($value)) {
            if (preg_match('/^data:\w+\/\w+;base64,/', $value)) {
                return true;
            }
            // Check if it's a valid base64 string (not a file path or URL)
            $decoded = base64_decode($value, true);
            if ($decoded !== false && base64_encode($decoded) === $value) {
                return true;
            }
        }
        return false;
    }
}
