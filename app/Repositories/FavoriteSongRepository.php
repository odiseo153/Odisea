<?php

namespace App\Repositories;

use App\Models\FavoriteSong;

class FavoriteSongRepository extends BaseRepository
{
    public function __construct(FavoriteSong $model)
    {
        parent::__construct($model);
    }

    public function getWithRelations()
    {
        return $this->model->with(['user', 'song'])->get();
    }

    public function getByUser(string $userId)
    {
        return $this->model->where('user_id', $userId)->with(['song'])->get();
    }

    public function getBySong(string $songId)
    {
        return $this->model->where('song_id', $songId)->with(['user'])->get();
    }

    public function findByUserAndSong(string $userId, string $songId)
    {
        return $this->model->where('user_id', $userId)
                          ->where('song_id', $songId)
                          ->first();
    }

    public function toggleFavorite(string $userId, string $songId)
    {
        $favorite = $this->findByUserAndSong($userId, $songId);
        
        if ($favorite) {
            $favorite->delete();
            return false; // Removed from favorites
        } else {
            $this->create([
                'user_id' => $userId,
                'song_id' => $songId
            ]);
            return true; // Added to favorites
        }
    }
} 