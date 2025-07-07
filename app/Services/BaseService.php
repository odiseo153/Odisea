<?php

namespace App\Services;

use App\Repositories\BaseRepository;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

abstract class BaseService
{
    protected $repository;

    public function __construct(BaseRepository $repository)
    {
        $this->repository = $repository;
    }

    public function getAllData(): Collection
    {
        return $this->repository->all();
    }

    public function getPaginatedData(int $perPage = 15): LengthAwarePaginator
    {
        return $this->repository->paginate($perPage);
    }

    public function findById(string $id): ?Model
    {
        return $this->repository->find($id);
    }

    public function createData(Model $model): Model
    {

        return $this->repository->create($model);
    }

    public function updateData(Model $model, array $data)
    {
        return $this->repository->update($model,$data);
    }

    public function deleteData(Model $model): bool
    {
        return $this->repository->delete($model);
    }

    public function searchData(string $column, string $term): Collection
    {
        return $this->repository->search($column, $term);
    }
}