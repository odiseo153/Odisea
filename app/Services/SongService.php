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
        \Log::info($user);
        $song=new Song();
        $data['added_by'] = $user->id;
        $song->fill($data);

        $song = $this->repository->create($song);
        $download = Download::create([
            'song_id' => $song->id,
            'user_id' => $user->id,
            'file_path' => $data['file_path'],
        ]);

        return $download;
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
