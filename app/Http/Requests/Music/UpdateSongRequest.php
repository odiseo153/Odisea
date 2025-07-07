<?php

namespace App\Http\Requests\Music;

use App\Http\Requests\BaseRequest;

class UpdateSongRequest extends BaseRequest
{
    public function rules(): array
    {
        return [
            'title' => 'required|string',
            'artist_id' => 'nullable|string|exists:artists,id',
            'platform_id' => 'required|string|exists:platforms,id',
            'album_id' => 'nullable|string|exists:albums,id',
            'duration' => 'required|integer',
            'genders' => 'nullable|array',
            'genders.*' => 'nullable|string|exists:genders,id',
        ];
    }
}