<?php

namespace App\Models;


class FavoritePlaylist extends BaseModel
{
    protected $fillable = ['user_id', 'playlist_id'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function playlist()
    {
        return $this->belongsTo(Playlist::class);
    }
}
