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
        // Handle cover image
        $data = $this->handleCoverImage($data);

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

    private function handleCoverImage(array $data, ?Playlist $playlist = null): array
    {
        // Handle file upload
        if (isset($data['cover_image']) && $data['cover_image'] instanceof UploadedFile) {
            // Delete old image if updating
            if ($playlist && $playlist->cover_image && !filter_var($playlist->cover_image, FILTER_VALIDATE_URL)) {
                Storage::disk('public')->delete($playlist->cover_image);
            }

            $file = $data['cover_image'];
            $fileName = time() . '_' . $file->getClientOriginalName();
            $path = $file->storeAs('playlist_covers', $fileName, 'public');

            $data['cover_image'] = Storage::url($path);

        }
        // Handle URL
        elseif (isset($data['cover_image_url']) && !empty($data['cover_image_url'])) {
            // Delete old uploaded image if it exists and we're switching to URL
            if ($playlist && $playlist->cover_image && !filter_var($playlist->cover_image, FILTER_VALIDATE_URL)) {
                Storage::disk('public')->delete($playlist->cover_image);
            }

            $data['cover_image'] = $data['cover_image_url'];
            unset($data['cover_image_url']);
        }
        // Remove cover_image_url if it exists but is empty
        elseif (isset($data['cover_image_url'])) {
            unset($data['cover_image_url']);
        }

        return $data;
    }
}
