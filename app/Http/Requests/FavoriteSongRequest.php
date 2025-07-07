<?php

namespace App\Http\Requests;

class FavoriteSongRequest extends BaseRequest
{
    public function rules(): array
    {
        return [
            'user_id' => 'required|string|exists:users,id',
            'song_id' => 'required|string|exists:songs,id',
        ];
    }

    public function messages(): array
    {
        return [
            'user_id.required' => 'The user is required.',
            'user_id.exists' => 'The selected user does not exist.',
            'song_id.required' => 'The song is required.',
            'song_id.exists' => 'The selected song does not exist.',
        ];
    }
} 