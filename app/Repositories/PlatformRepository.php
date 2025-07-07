<?php

namespace App\Repositories;

use App\Models\Platform;

class PlatformRepository extends BaseRepository
{
    public function __construct(Platform $model)
    {
        parent::__construct($model);
    }

    public function getWithSongs()
    {
        return $this->model->with('songs')->get();
    }

    public function searchByName(string $name)
    {
        return $this->model->where('name', 'LIKE', "%{$name}%")->get();
    }

    public function findByUrl(string $url)
    {
        return $this->model->where('url', $url)->first();
    }
} 