<?php

namespace App\Models;

class Album extends BaseModel
{
    protected $fillable = ['name', 'artist_id', 'cover_url', 'year', 'owner_id'];

    public function artist()
    {
        return $this->belongsTo(Artist::class);
    }

    public function owner()
    {
        return $this->belongsTo(User::class,'owner_id');
    }

    public function songs()
    {
        return $this->hasMany(Song::class);
    }

    public function interactions()
    {
        return $this->morphMany(Interaction::class, 'interactable');
    }
}
