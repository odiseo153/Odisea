<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Carbon;

/**
 * Modelo User: gestiona usuarios del sistema y sus autenticaciones.
 *
 * @property string $id UUID único del usuario
 * @property string $name Nombre del usuario
 * @property string $email Email único del usuario
 * @property ?Carbon $email_verified_at Fecha de verificación del email (opcional)
 * @property ?string $avatar URL del avatar del usuario (opcional)
 * @property string $password Contraseña hasheada
 * @property bool $is_admin para saber si es admin
 * @property ?string $remember_token Token de "recordar sesión" (opcional)
 * @property Carbon $created_at Fecha de creación
 * @property Carbon $updated_at Fecha de última actualización
 * @property-read Collection|Playlist[] $playlists Playlists creadas por el usuario
 * @property-read Collection|Song[] $favoriteSongs Canciones marcadas como favoritas
 * @property-read Collection|FavoritePlaylist[] $favoritePlaylists Playlists favoritas del usuario
 * @property-read Collection|Download[] $downloads Descargas realizadas por el usuario
 * @property-read Collection|Song[] $songs Canciones agregadas por el usuario
 * @property-read Collection|Album[] $albums Álbumes de propiedad del usuario
 * @property-read Collection|Interaction[] $interactions Interacciones del usuario
 */
class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasApiTokens, HasUuids;

    protected $keyType = 'string';
    public $incrementing = false; // UUIDs are not auto-incrementing

    /**
     * Los atributos que se pueden asignar masivamente.
     * Usando guarded vacío para permitir todos los campos.
     */
    protected $guarded = [];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function playlists()
    {
        return $this->hasMany(Playlist::class);
    }

    public function favoriteSongs()
    {
        return $this->belongsToMany(Song::class, 'favorite_songs');
    }

    public function favoritePlaylists()
    {
        return $this->hasMany(FavoritePlaylist::class);
    }

    public function downloads()
    {
        return $this->hasMany(Download::class);
    }

    public function songs()
    {
        return $this->hasMany(Song::class,'added_by');
    }

    public function albums()
    {
        return $this->hasMany(Album::class,'owner_id');
    }

    public function interactions()
    {
        return $this->hasMany(Interaction::class);
    }
}
