<?php

namespace App\Http\Requests;

use Illuminate\Validation\Rule;

class PlaylistRequest extends BaseRequest
{
    public function rules(): array
    {
        $playlistId = $this->route('playlist') ? $this->route('playlist')->id : null;

        return [
            'name' => [
                'sometimes',
                'string',
                'max:255',
                Rule::unique('playlists', 'name')->ignore($playlistId)
            ],
            'is_public' => 'boolean',
            'user_id' => 'sometimes|exists:users,id',
            'cover_image' => 'sometimes|image|mimes:jpeg,jpg,png|max:5120', // 5MB max
            'cover_image_url' => 'sometimes|nullable|url|max:2048',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'The playlist name is required.',
            'name.string' => 'The playlist name must be a string.',
            'name.max' => 'The playlist name must not exceed 255 characters.',
            'name.unique' => 'A playlist with this name already exists.',
            'is_public.boolean' => 'The public status must be true or false.',
            'cover_image.image' => 'The cover image must be a valid image file.',
            'cover_image.mimes' => 'The cover image must be a JPEG, JPG, or PNG file.',
            'cover_image.max' => 'The cover image must not exceed 5MB.',
            'cover_image_url.url' => 'The cover image URL must be a valid URL.',
            'cover_image_url.max' => 'The cover image URL must not exceed 2048 characters.',
        ];
    }
}
