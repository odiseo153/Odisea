<?php

namespace App\Repositories;

use App\Models\User;
use App\Models\Album;
use App\Models\Artist;
use App\Repositories\BaseRepository;
use Spatie\QueryBuilder\AllowedSort;
use Spatie\QueryBuilder\QueryBuilder;
use Spatie\QueryBuilder\AllowedFilter;
use Illuminate\Database\Query\JoinClause;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Contracts\Pagination\Paginator;

/**
 * @extends BaseRepository<Album>
 */
class AlbumRepository extends BaseRepository
{
    public function __construct(Album $model)
    {
        parent::__construct($model);
    }

    /** @return Collection|array<array-key, Album> */
    public function getRecentlyAdded(int $count = 6, ?User $user = null): Collection
    {
        return Album::query()
            ->where('owner_id', $user->id)
            ->groupBy('albums.id')
            ->distinct()
            ->latest('albums.created_at')
            ->limit($count)
            ->get('albums.*');
    }

    /** @return Collection|array<array-key, Album> */
    public function getMostPlayed(int $count = 6, ?User $user = null): Collection
    {
        $user ??= $this->auth->user();

        return Album::query()
            ->isStandard()
            ->accessibleBy($user)
            ->join('interactions', static function (JoinClause $join) use ($user): void {
                $join->on('songs.id', 'interactions.song_id')->where('interactions.user_id', $user->id);
            })
            ->groupBy('albums.id', 'play_count')
            ->distinct()
            ->orderByDesc('play_count')
            ->limit($count)
            ->get(['albums.*', 'play_count']);
    }

    /** @return Collection|array<array-key, Album> */
    public function getMany(array $ids, bool $preserveOrder = false, ?User $user = null): Collection
    {
        $albums = Album::query()
            ->isStandard()
            ->accessibleBy($user ?? auth()->user())
            ->whereIn('albums.id', $ids)
            ->groupBy('albums.id')
            ->distinct()
            ->get('albums.*');

        return $preserveOrder ? $albums->orderByArray($ids) : $albums;
    }

    /** @return Collection|array<array-key, Album> */
    public function getByArtist(Artist $artist, ?User $user = null): Collection
    {
        return Album::query()
            ->accessibleBy($user ?? $this->auth->user())
            ->where('albums.artist_id', $artist->id)
            ->orWhereIn('albums.id', $artist->songs()->pluck('album_id'))
            ->orderBy('albums.name')
            ->groupBy('albums.id')
            ->distinct()
            ->get('albums.*');
    }

    public function getForListing(string $sortColumn, string $sortDirection, ?User $user = null): Paginator
    {
        return Album::query()
            ->accessibleBy($user ?? $this->auth->user())
            ->isStandard()
            ->sort($sortColumn, $sortDirection)
            ->groupBy('albums.id', 'artists.name')
            ->distinct()
            ->select('albums.*', 'artists.name as artist_name')
            ->simplePaginate(21);
    }

    public function getPaginated(
        int $perPage = 10,
        array $filters = [],
        array $sorts = [],
        string $defaultSort = 'name',
        array $with = ['artist', 'songs']
    ) {
        $filters = [
            AllowedFilter::partial('name'),
            AllowedFilter::callback('artist_name', function($query, $value) {
                $query->whereHas('artist', function($query) use ($value) {
                    $query->where('name', 'ilike', "%{$value}%");
                });
            }),
            AllowedFilter::callback('song_title', function($query, $value) {
                $query->whereHas('songs', function($query) use ($value) {
                    $query->where('title', 'ilike', "%{$value}%");
                });
            }),
            AllowedFilter::exact('artist_id')
        ];

        $sorts = [
            AllowedSort::field('name'),
            AllowedSort::field('created_at'),
            AllowedSort::field('id'),
            AllowedSort::callback('songs_count', function($query, $direction) {
                $query->withCount('songs')->orderBy('songs_count', $direction);
            }),
            AllowedSort::callback('artist_name', function($query, $direction) {
                $query->join('artists', 'albums.artist_id', '=', 'artists.id')
                    ->orderBy('artists.name', $direction);
            })
        ];

     return parent::getPaginated($perPage, $filters, $sorts, $defaultSort, $with);
    }
}
