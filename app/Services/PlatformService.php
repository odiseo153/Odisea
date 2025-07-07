<?php

namespace App\Services;

use App\Models\Platform;
use App\Repositories\PlatformRepository;

class PlatformService extends BaseService
{
    protected $repository;

    public function __construct(PlatformRepository $repository)
    {
        $this->repository = $repository;
    }

    public function getPlatformsWithSongs()
    {
        return $this->repository->getWithSongs();
    }

    public function searchPlatformsByName(string $name)
    {
        return $this->repository->searchByName($name);
    }

    public function findPlatformByUrl(string $url)
    {
        return $this->repository->findByUrl($url);
    }

    public function createPlatform(array $data)
    {
        // Validar que no exista una plataforma con la misma URL
        if ($this->findPlatformByUrl($data['url'])) {
            throw new \Exception('Platform with this URL already exists');
        }

        $platform = new Platform();
        $platform->fill($data);

        return $this->repository->create($platform);
    }

    public function updatePlatform(Platform $platform, array $data)
    {
        // Validar que la URL no esté siendo usada por otra plataforma
        if (isset($data['url'])) {
            $existingPlatform = $this->findPlatformByUrl($data['url']);
            if ($existingPlatform && $existingPlatform->id !== $platform->id) {
                throw new \Exception('Platform with this URL already exists');
            }
        }

        return $this->repository->update($platform, $data);
    }
}