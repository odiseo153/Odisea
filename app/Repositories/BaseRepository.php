<?php

namespace App\Repositories;

use App\Repositories\Repository;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use Spatie\QueryBuilder\QueryBuilder;

abstract class BaseRepository extends Repository
{
    protected $model;

    public function __construct(Model $model)
    {
        $this->model = $model;
    }

    public function all(): Collection
    {
        return $this->model->all();
    }

    public function paginate(int $perPage = 15): LengthAwarePaginator
    {
        return $this->model->paginate($perPage);
    }

    public function getPaginated(
        int $perPage = 10,
        array $filters = [],
        array $sorts = [],
        string $defaultSort = 'created_at',
        array $with = []
    ) {
        $query = QueryBuilder::for($this->model->query())
            ->allowedFilters($filters)
            ->allowedSorts($sorts)
            ->allowedFields($this->model->getFillable())
            ->allowedIncludes($with)
            ->defaultSort($defaultSort);

        return $query->paginate($perPage);
    }

    public function find(string $id): ?Model
    {
        return $this->model->find($id);
    }

    public function findOrFail(string $id): Model
    {
        return $this->model->findOrFail($id);
    }

    public function create(Model $model): Model
    {
        $model->save();
        return $model;
    }

    public function update(Model $model, array $data)
    {
        $model->update($data);
        return $model;
    }

    public function delete(Model $model): bool
    {
        return $model->delete();
    }

    public function search(string $column, string $term): Collection
    {
        return $this->model->where($column, 'LIKE', "%{$term}%")->get();
    }

    public function with(array $relations): self
    {
        $this->model = $this->model->with($relations);
        return $this;
    }
}
