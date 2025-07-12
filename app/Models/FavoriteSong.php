<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class FavoriteSong extends Model
{
    use SoftDeletes;

    protected $fillable = ['user_id', 'song_id'];

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
