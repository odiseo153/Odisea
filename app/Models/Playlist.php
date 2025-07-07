<?php

namespace App\Models;

class Playlist extends BaseModel
{
    protected $fillable = ['name', 'user_id', 'is_public','cover_image'];
    protected $with = ['creator', 'songs'];
    protected $appends = ['play_count'];

    public function creator()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function songs()
    {
        return $this->belongsToMany(Song::class,'playlist_songs');
    }

    public function interactions()
    {
        return $this->morphMany(Interaction::class, 'interactable');
    }

    public function getPlayCountAttribute()
    {
        return $this->interactions()->sum('play_count');
    }
}

