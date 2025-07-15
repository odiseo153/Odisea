<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Carbon;

/**
 * Modelo Platform: gestiona plataformas musicales y sus metadatos.
 *
 * @property string $id UUID único de la plataforma
 * @property string $name Nombre de la plataforma
 * @property ?string $logo_url URL del logo de la plataforma (opcional)
 * @property string $url URL de la plataforma
 * @property Carbon $created_at Fecha de creación
 * @property Carbon $updated_at Fecha de última actualización
 * @property ?Carbon $deleted_at Fecha de eliminación suave (opcional)
 * @property-read Collection|Song[] $songs Canciones de la plataforma
 * @property-read Collection|Interaction[] $interactions Interacciones de la plataforma
 */
class Platform extends BaseModel
{
    /**
     * Los atributos que se pueden asignar masivamente.
     * Usando guarded vacío para permitir todos los campos.
     */
    protected $guarded = [];

    public function songs()
    {
        return $this->hasMany(Song::class);
    }

    public function interactions()
    {
         return $this->hasManyThrough(Interaction::class, Song::class,'platform_id','interactable_id','id');
    }
}
