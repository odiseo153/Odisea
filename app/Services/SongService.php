<?php

namespace App\Services;

use App\Models\Download;
use App\Models\Song;
use App\Models\User;
use App\Models\Album;
use App\Models\Artist;
use App\Models\Platform;
use App\Repositories\SongRepository;


class SongService extends BaseService
{
    protected $repository;
    public function __construct(SongRepository $repository)
    {
        parent::__construct($repository);
    }

    public function getSongsPaginated(int $perPage = 10)
    {
        return $this->repository->getPaginated($perPage);
    }

    public function getSongsWithRelations()
    {
        return $this->repository->getWithRelations() ;
    }

    public function searchSongsByQuery(string $search)
    {
        return $this->repository->searchByQuery($search);
    }

    public function getSongsByPlatform(Platform $platform)
    {
        return $this->repository->getByPlatform($platform);
    }

    public function getSongsByArtist(Artist $artist)
    {
        return $this->repository->getByArtist($artist);
    }

    public function getSongsByAlbum(Album $album)
    {
        return $this->repository->getByAlbum($album);
    }

    public function getSongsByUser(User $user)
    {
        return $this->repository->getByUser($user);
    }

    public function createSong(array $data, $user)
    {
        \Log::info('Creating song with data:', $data);
        \Log::info('User:', ['id' => $user->id, 'name' => $user->name]);

        $song = new Song();
        $song->fill([
            'title' => $data['title'],
            'artist_id' => $data['artist_id'],
            'album_id' => $data['album_id'] ?? null,
            'duration' => $data['duration'] ?? null,
            'platform_id' => $data['platform_id'],
            'cover_url' => $data['cover_url'] ?? null,
            'added_by' => $user->id, // Fix: use $user->id instead of $data['added_by']
        ]);

        $song = $this->repository->create($song);
        \Log::info('Song created:', ['id' => $song->id, 'title' => $song->title]);

        // Create download record with the audio file
        $download = Download::create([
            'song_id' => $song->id,
            'user_id' => $user->id,
            'file_path' => $data['file_path'], // This will be processed by the Download model
        ]);

        \Log::info('Download created:', [
            'id' => $download->id, 
            'file_path' => $download->file_path,
            'song_id' => $song->id
        ]);

        // Return the song with its download relationship
        return $song->load('download');
    }

    public function updateSong(Song $song, array $data)
    {
        return $this->repository->update($song, $data);
    }

    public function deleteSong(Song $song)
    {
        return $this->repository->delete($song);
    }
}
