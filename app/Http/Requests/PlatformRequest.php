<?php

namespace App\Http\Requests;

class PlatformRequest extends BaseRequest
{
    public function rules(): array
    {
        $platformId = $this->route('platform');
        
        return [
            'name' => 'required|string|max:255',
            'logo_url' => 'nullable|url|max:500',
            'url' => 'required|url|max:500|unique:platforms,url,' . $platformId,
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'The platform name is required.',
            'name.string' => 'The platform name must be a string.',
            'name.max' => 'The platform name must not exceed 255 characters.',
            'logo_url.url' => 'The logo URL must be a valid URL.',
            'logo_url.max' => 'The logo URL must not exceed 500 characters.',
            'url.required' => 'The platform URL is required.',
            'url.url' => 'The platform URL must be a valid URL.',
            'url.max' => 'The platform URL must not exceed 500 characters.',
            'url.unique' => 'A platform with this URL already exists.',
        ];
    }
} 