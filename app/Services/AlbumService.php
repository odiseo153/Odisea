<?php

namespace App\Services;

use App\Models\Album;
use App\Models\Artist;
use App\Repositories\AlbumRepository;

class AlbumService extends BaseService
{
    protected $repository;

    public function __construct(AlbumRepository $repository)
    {
        $this->repository = $repository;
    }

    public function getPaginated(int $perPage = 10, array $filters = [], array $sorts = [])
    {
        return $this->repository->getPaginated($perPage, $filters, $sorts);
    }

    public function getAlbumById(string $id)
    {
        return $this->repository->findOrFail($id);
    }

    public function getAlbumsByArtist(Artist $artist)
    {
        return $this->repository->getByArtist($artist);
    }

    public function createAlbum(Album $data)
    {
        return $this->repository->create($data);
    }

    public function updateAlbum(Album $album, array $data)
    {
        return $this->repository->update($album, $data);
    }

    public function deleteAlbum(Album $album)
    {
        return $this->repository->delete($album);
    }

    public function searchAlbums(string $query)
    {
        return $this->repository->search($query);
    }
}
