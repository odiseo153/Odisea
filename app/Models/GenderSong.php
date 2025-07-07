<?php

namespace App\Models;


class GenderSong extends BaseModel
{
    protected $fillable = ['gender_id', 'song_id'];

    public function gender()
    {
        return $this->belongsTo(Gender::class);
    }

    public function song()
    {
        return $this->belongsTo(Song::class);
    }
}
