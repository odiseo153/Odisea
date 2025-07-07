<?php

namespace App\Services;

use App\Repositories\FavoriteSongRepository;

class FavoriteSongService extends BaseService
{
    public function __construct(FavoriteSongRepository $repository)
    {
        parent::__construct($repository);
    }

    public function getFavoriteSongsWithRelations()
    {
        return $this->repository->getWithRelations();
    }

    public function getUserFavoriteSongs(string $userId)
    {
        return $this->repository->getByUser($userId);
    }

    public function getSongFavorites(string $songId)
    {
        return $this->repository->getBySong($songId);
    }

    public function isFavorite(string $userId, string $songId): bool
    {
        return $this->repository->findByUserAndSong($userId, $songId) !== null;
    }

    public function toggleFavorite(string $userId, string $songId): array
    {
        $result = $this->repository->toggleFavorite($userId, $songId);
        
        return [
            'is_favorite' => $result,
            'message' => $result ? 'Song added to favorites' : 'Song removed from favorites'
        ];
    }

    public function addToFavorites(string $userId, string $songId)
    {
        // Verificar si ya está en favoritos
        if ($this->isFavorite($userId, $songId)) {
            throw new \Exception('Song is already in favorites');
        }

        return $this->repository->create([
            'user_id' => $userId,
            'song_id' => $songId
        ]);
    }

    public function removeFromFavorites(string $userId, string $songId)
    {
        $favorite = $this->repository->findByUserAndSong($userId, $songId);
        
        if (!$favorite) {
            throw new \Exception('Song is not in favorites');
        }

        return $favorite->delete();
    }
} 