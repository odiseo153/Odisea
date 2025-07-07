<?php

namespace App\Repositories;

use App\Builders\ArtistBuilder;
use App\Facades\License;
use App\Models\Artist;
use App\Models\User;
use Illuminate\Contracts\Pagination\Paginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Query\JoinClause;
use Spatie\QueryBuilder\AllowedFilter;
use Spatie\QueryBuilder\AllowedSort;

/** @extends BaseRepository<Artist> */
class ArtistRepository extends BaseRepository
{
    public function __construct(Artist $model)
    {
        parent::__construct($model);
    }

    /** @return Collection|array<array-key, Artist> */
    public function getMostPlayed(int $count = 6, ?User $user = null): Collection
    {
        $user ??= auth()->user();

        return Artist::query()
            ->isStandard()
            ->join('interactions', static function (JoinClause $join) use ($user): void {
                $join->on('interactions.song_id', '=', 'songs.id')->where('interactions.user_id', $user->id);
            })
            ->groupBy([
                'artists.id',
                'play_count',
                'artists.name',
                'artists.image',
                'artists.created_at',
                'artists.updated_at',
            ])
            ->distinct()
            ->orderByDesc('play_count')
            ->limit($count)
            ->get(['artists.*', 'play_count']);
    }

    /** @return Collection|array<array-key, Artist> */
    public function getMany(array $ids, bool $preserveOrder = false, ?User $user = null): Collection
    {
        $artists = Artist::query()
            ->isStandard()
            ->accessibleBy($user ?? auth()->user())
            ->whereIn('artists.id', $ids)
            ->groupBy('artists.id')
            ->distinct()
            ->get('artists.*');

        return $preserveOrder ? $artists->orderByArray($ids) : $artists;
    }

    public function getForListing(string $sortColumn, string $sortDirection, ?User $user = null): Paginator
    {
        return Artist::query()
            ->isStandard()
            ->accessibleBy($user ?? auth()->user())
            ->sort($sortColumn, $sortDirection)
            ->groupBy('artists.id')
            ->distinct()
            ->orderBy('artists.name')
            ->select('artists.*')
            ->simplePaginate(21);
    }

    public function getPaginated(
        int $perPage = 10,
        array $filters = [],
        array $sorts = [],
        string $defaultSort = 'name',
        array $with = ['albums', 'songs']
    ) {
        $filters = [
            AllowedFilter::partial('name'),
            AllowedFilter::callback('album_name', function($query, $value) {
                $query->whereHas('albums', function($query) use ($value) {
                    $query->where('name', 'ilike', "%{$value}%");
                });
            }),
            AllowedFilter::callback('song_title', function($query, $value) {
                $query->whereHas('songs', function($query) use ($value) {
                    $query->where('title', 'ilike', "%{$value}%");
                });
            })
        ];

        $sorts = [
            AllowedSort::field('name'),
            AllowedSort::field('created_at'),
            AllowedSort::field('id'),
            AllowedSort::callback('songs_count', function($query, $direction) {
                $query->withCount('songs')->orderBy('songs_count', $direction);
            }),
            AllowedSort::callback('albums_count', function($query, $direction) {
                $query->withCount('albums')->orderBy('albums_count', $direction);
            })
        ];

        return parent::getPaginated($perPage, $filters, $sorts, $defaultSort, $with);
    }
}
