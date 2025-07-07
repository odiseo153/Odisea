<?php

namespace App\Models;


class Gender extends BaseModel
{

    protected $fillable = ['name'];

    protected $appends = ['interactions_count'];
    public function songs()
    {
        return $this->belongsToMany(Song::class, 'gender_songs');
    }
    public function interactions()
    {
        return Interaction::whereHasMorph('interactable', [Song::class], function ($query) {
            $query->whereIn('id', $this->songs->pluck('id'));
        })->get();
    }

    public function getInteractionsCountAttribute()
    {
        return $this->interactions()->count();
    }
}
