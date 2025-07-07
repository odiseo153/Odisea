<?php

namespace App\Models;


class Artist extends BaseModel
{
    protected $fillable = ['name', 'image_url', 'bio'];

    public function albums()
    {
        return $this->hasMany(Album::class);
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
