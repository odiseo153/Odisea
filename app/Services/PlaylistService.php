<?php

namespace App\Services;

use App\Models\Song;
use App\Models\Playlist;
use App\Repositories\PlaylistRepository;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class PlaylistService extends BaseService
{
    protected $repository;

    public function __construct(PlaylistRepository $repository)
    {
        parent::__construct($repository);
        $this->playlistRepository = $repository;
    }

    public function get_playlist_with_restrictions()
    {
        return $this->repository->get_playlist_with_restrictions();
    }

    public function getPaginated(int $perPage = 10, array $filters = [], array $sorts = [])
    {
        return $this->repository->getPaginated($perPage, $filters, $sorts);
    }

    public function getPlaylistById(string $id)
    {
        return $this->repository->findOrFail($id);
    }

    public function createPlaylist(array $data)
    {
        $playlist = new Playlist();
        $playlist->fill($data);

        return $this->repository->create($playlist);
    }

    public function updatePlaylist(string $id, array $data)
    {
        $playlist = $this->repository->findOrFail($id);
        return $this->repository->update($playlist, $data);
    }

    public function deletePlaylist(string $id)
    {
        $playlist = $this->repository->findOrFail($id);
        return $this->repository->delete($playlist);
    }

    public function addSongToPlaylist(string $playlistId, string $songId)
    {
        $playlist = $this->repository->findOrFail($playlistId);
        return $this->repository->addSong($playlist, $songId);
    }

   
}
