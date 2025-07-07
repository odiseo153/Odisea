<?php

namespace App\Models;

class FavoriteSong extends BaseModel
{
    protected $fillable = ['user_id', 'song_id'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function song()
    {
        return $this->belongsTo(Song::class);
    }
}
