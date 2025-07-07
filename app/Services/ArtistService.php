<?php

namespace App\Services;

use App\Repositories\ArtistRepository;

class ArtistService extends BaseService
{
    protected $repository;

    public function __construct(ArtistRepository $repository)
    {
        $this->repository = $repository;
    }

    public function getPaginated(int $perPage = 10, array $filters = [], array $sorts = [])
    {
        return $this->repository->getPaginated($perPage, $filters, $sorts);
    }

    public function getArtistById(string $id)
    {
        return $this->repository->findOrFail($id);
    }

    public function getMostPlayed(int $count = 6)
    {
        return $this->repository->getMostPlayed($count);
    }
}
