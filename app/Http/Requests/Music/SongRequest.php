<?php

namespace App\Http\Requests\Music;

use App\Http\Requests\BaseRequest;

class SongRequest extends BaseRequest
{
    public function rules(): array
    {
        $method = $this->method();
        if($method == 'PUT'){
            return [
                'platform_id' => 'sometimes|string|exists:platforms,id',
                'artist_id' => 'sometimes|string|exists:artists,id',
                'album_id' => 'nullable|string|exists:albums,id',
                'title' => 'sometimes|string|max:255',
                'duration' => 'nullable|integer|min:1',
                'cover_url' => 'nullable|url|max:500',
                'file_path' => 'nullable|string',
            ];
        }
        return [
            'platform_id' => 'required|string|exists:platforms,id',
            'artist_id' => 'required|string|exists:artists,id',
            'title' => 'required|string|max:255',
            'duration' => 'nullable|integer|min:1',
            'cover_url' => 'nullable|url|max:500',
            'file_path' => 'required|string',
        ];
    }

    public function messages(): array
    {
        return [
            'platform_id.required' => 'The platform is required.',
            'platform_id.exists' => 'The selected platform does not exist.',
            'artist_id.required' => 'The artist is required.',
            'artist_id.exists' => 'The selected artist does not exist.',
            'album_id.exists' => 'The selected album does not exist.',
            'title.required' => 'The song title is required.',
            'title.string' => 'The song title must be a string.',
            'title.max' => 'The song title must not exceed 255 characters.',
            'duration.integer' => 'The duration must be a number.',
            'duration.min' => 'The duration must be at least 1 second.',
            'cover_url.url' => 'The cover URL must be a valid URL.',
            'cover_url.max' => 'The cover URL must not exceed 500 characters.',
            'added_by.required' => 'The user who added the song is required.',
            'added_by.exists' => 'The selected user does not exist.',
            'file_path.required' => 'The song file is required.',
            'file_path.string' => 'The song file must be a string.',
        ];
    }
}