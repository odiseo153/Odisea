<?php

namespace App\Models;

use App\Traits\ModelHelperTrait;
use Illuminate\Support\Facades\Storage;

class Download extends BaseModel
{
    use ModelHelperTrait;
    protected $fillable = ['user_id', 'song_id', 'file_path'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function song()
    {
        return $this->belongsTo(Song::class);
    }

    public function setFilePathAttribute($value)
    {
        if (filter_var($value, FILTER_VALIDATE_URL)) {
            $this->attributes['file_path'] = $value;
        } else {
            $this->attributes['file_path'] = $this->handleBase64File($value, 'downloads');
        }
    }


}
