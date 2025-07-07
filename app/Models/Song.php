<?php

namespace App\Models;

use App\Traits\ModelHelperTrait;

class Song extends BaseModel
{
    use ModelHelperTrait;

    protected $fillable = ['platform_id', 'artist_id', 'album_id', 'title', 'duration', 'cover_url', 'added_by'];
    protected $with = ['platform','artist','album','download'];
    protected $appends = ['other_songs','play_count'];

    public function platform()
    {
        return $this->belongsTo(Platform::class);
    }

    public function interactions()
    {
        return $this->morphMany(Interaction::class, 'interactable');
    }

    public function artist()
    {
        return $this->belongsTo(Artist::class);
    }

    public function album()
    {
        return $this->belongsTo(Album::class);
    }

    public function download()
    {
        return $this->hasOne(Download::class);
    }

    public function genders()
    {
        return $this->belongsToMany(Gender::class);
    }

    public function addedBy()
    {
        return $this->belongsTo(User::class, 'added_by');
    }

    public function favoriteUsers()
    {
       return $this->belongsToMany(User::class, 'favorite_songs');
    }

    public function getOtherSongsAttribute()
    {
        return Song::where('artist_id', $this->artist_id)->where('id', '!=', $this->id)->get();
    }

    public function getPlayCountAttribute()
    {
        return $this->interactions()->sum('play_count');
    }
}
