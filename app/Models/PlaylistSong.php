<?php

namespace App\Models;

class PlaylistSong extends BaseModel
{
    protected $fillable = ['playlist_id', 'song_id'];

    public function playlist()
    {
        return $this->belongsTo(Playlist::class);
    }

    public function song()
    {
        return $this->belongsTo(Song::class);
    }
}
