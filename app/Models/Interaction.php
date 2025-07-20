<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * Modelo Interaction: gestiona interacciones polimórficas con entidades musicales.
 *
 * @property string $id UUID único de la interacción
 * @property string $user_id UUID del usuario que realizó la interacción
 * @property bool $liked Indica si la entidad fue marcada como "me gusta"
 * @property int $play_count Número de veces que se reprodujo la entidad
 * @property string $interactable_type Tipo de entidad (Song, Album, Playlist, etc.)
 * @property string $interactable_id UUID de la entidad con la que se interactúa
 * @property Carbon $created_at Fecha de creación
 * @property Carbon $updated_at Fecha de última actualización
 * @property ?Carbon $deleted_at Fecha de eliminación suave (opcional)
 * @property-read User $user Usuario que realizó la interacción
 * @property-read Model $interactable Entidad con la que se interactúa (polimórfica)
 */
class Interaction extends BaseModel
{

    protected $casts = [
        'liked' => 'boolean',
        'play_count' => 'integer',
    ];

    /**
     * Los atributos protegidos contra asignación masiva.
     * Solo protegemos el ID para mantener la integridad.
     */
    protected $guarded = ['id'];

    protected $hidden = ['id', 'user_id', 'created_at', 'updated_at', 'last_played_at'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function interactable(): BelongsTo
    {
        return $this->morphTo();
    }
}
