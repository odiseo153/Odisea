<?php

namespace App\Repositories;

use App\Models\Song;
use App\Models\Playlist;
use Illuminate\Http\Request;
use Spatie\QueryBuilder\AllowedSort;
use Spatie\QueryBuilder\QueryBuilder;
use Spatie\QueryBuilder\AllowedFilter;
use Illuminate\Database\Eloquent\Builder;

class PlaylistRepository extends BaseRepository
{
    public function __construct(Playlist $model)
    {
        parent::__construct($model);
    }

    public function searchByName(string $name)
    {
        return $this->model->where('name', 'LIKE', "%{$name}%")->get();
    }

    public function get_playlist_with_restrictions()
    {
        return $this->model
        ->where('is_public', true)
        ->orWhere('user_id', auth()->user()->id)
        ->with(['songs','creator'])
        ->get();
    }

    public function findByUrl(string $url)
    {
        return $this->model->where('url', $url)->first();
    }

    public function addSong(Playlist $playlist, Song $song)
    {
        return $playlist->songs()->toggle($song->id);
    }

    public function getPaginated(
        int $perPage = 10,
        array $filters = [],
        array $sorts = [],
        string $defaultSort = 'created_at',
        array $with = ['songs', 'creator']
    ) {
        $filters = [
            AllowedFilter::partial('name'),
            AllowedFilter::exact('is_public'),
            AllowedFilter::exact('user_id'),
            AllowedFilter::callback('creator_name', function($query, $value) {
                $query->whereHas('creator', function($query) use ($value) {
                    $query->where('name', 'ilike', "%{$value}%");
                });
            })
        ];

        $sorts = [
            AllowedSort::field('name'),
            AllowedSort::field('created_at'),
            AllowedSort::field('id'),
            AllowedSort::field('is_public')
        ];


        return parent::getPaginated($perPage, $filters, $sorts, $defaultSort, $with);
    }
}
