<?php

namespace App\Repositories;

use App\Models\User;

class UserRepository extends BaseRepository
{
    public function __construct(User $model)
    {
        parent::__construct($model);
    }

    public function getWithRelations()
    {
        return $this->model->with(['playlists', 'favoriteSongs', 'favoritePlaylists', 'downloads', 'songs', 'artists', 'albums'])->get();
    }

    public function findByEmail(string $email)
    {
        return $this->model->where('email', $email)->first();
    }

    public function searchByName(string $name)
    {
        return $this->model->where('name', 'LIKE', "%{$name}%")->get();
    }

    public function getUserPlaylists(string $userId)
    {
        return $this->findOrFail($userId)->playlists;
    }

    public function getUserFavoriteSongs(string $userId)
    {
        return $this->findOrFail($userId)->favoriteSongs;
    }

    public function getUserSongs(string $userId)
    {
        return $this->findOrFail($userId)->songs;
    }
} 