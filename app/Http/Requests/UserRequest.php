<?php

namespace App\Http\Requests;

class UserRequest extends BaseRequest
{
    public function rules(): array
    {
        $userId = $this->route('user');
        $isUpdate = $this->isMethod('PUT') || $this->isMethod('PATCH');
        
        return [
            'name' => 'required|string|max:255',
            'email' => $isUpdate ? 'sometimes|email|max:255|unique:users,email,' . $userId : 'required|email|max:255|unique:users,email,' . $userId,
            'password' => $isUpdate ? 'nullable|string|min:8' : 'required|string|min:8',
            'avatar' => 'nullable|url|max:500',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'The name is required.',
            'name.string' => 'The name must be a string.',
            'name.max' => 'The name must not exceed 255 characters.',
            'email.required' => 'The email is required.',
            'email.email' => 'The email must be a valid email address.',
            'email.max' => 'The email must not exceed 255 characters.',
            'email.unique' => 'A user with this email already exists.',
            'password.required' => 'The password is required.',
            'password.string' => 'The password must be a string.',
            'password.min' => 'The password must be at least 8 characters.',
            'avatar.url' => 'The avatar must be a valid URL.',
            'avatar.max' => 'The avatar URL must not exceed 500 characters.',
        ];
    }
} 