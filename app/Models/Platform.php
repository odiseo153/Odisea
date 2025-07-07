<?php

namespace App\Models;

class Platform extends BaseModel
{
    protected $fillable = ['name', 'logo_url', 'url'];

    public function songs()
    {
        return $this->hasMany(Song::class);
    }

    public function interactions()
    {
         return $this->hasManyThrough(Interaction::class, Song::class,'platform_id','interactable_id','id');
    }
}
