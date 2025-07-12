<?php

namespace App\Models;

use App\Traits\ModelHelperTrait;

class Song extends BaseModel
{
    use ModelHelperTrait;

    protected $fillable = ['platform_id', 'artist_id', 'album_id', 'title', 'duration', 'cover_url', 'added_by'];
    // Removed heavy eager loading to improve performance
     protected $with = ['artist','download'];
    // Removed appends to avoid N+1 query problems
    // protected $appends = ['other_songs','play_count'];

    // Use this method when you need minimal Song data
    public function scopeMinimal($query)
    {
        return $query->select('id', 'title', 'duration', 'artist_id', 'album_id', 'cover_url');
    }

    // Use this method when you need full Song data with relationships
    public function scopeWithRelations($query)
    {
        return $query->with(['platform', 'artist', 'album', 'download']);
    }

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
        return $this->belongsToMany(Gender::class, 'gender_songs');
    }

    public function addedBy()
    {
        return $this->belongsTo(User::class, 'added_by');
    }

    public function favoriteUsers()
    {
       return $this->belongsToMany(User::class, 'favorite_songs');
    }

    // Optimized methods - call these explicitly when needed, not as accessors
    public function getOtherSongs()
    {
        return Song::where('artist_id', $this->artist_id)
            ->where('id', '!=', $this->id)
            ->limit(10) // Limit to prevent excessive data loading
            ->get();
    }

    public function getPlayCount()
    {
        return $this->interactions()->sum('play_count') ?? 0;
    }

    // Keep accessors but make them lazy-loaded and cached
    public function getOtherSongsAttribute()
    {
        return $this->getOtherSongs();
    }

    public function getPlayCountAttribute()
    {
        return $this->getPlayCount();
    }
}
