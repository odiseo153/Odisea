<?php

namespace App\Repositories;

use App\Models\Song;
use App\Models\User;
use App\Models\Album;
use App\Models\Artist;
use App\Models\Platform;
use App\Models\Playlist;
use Spatie\QueryBuilder\AllowedSort;
use Spatie\QueryBuilder\QueryBuilder;
use Spatie\QueryBuilder\AllowedFilter;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Contracts\Pagination\Paginator;

/** @extends BaseRepository<Song> */
class SongRepository extends BaseRepository
{
    private const DEFAULT_QUEUE_LIMIT = 500;

    public function __construct(Song $model)
    {
        parent::__construct($model);
    }


    public function getPaginated(int $perPage = 10, array $filters = [], array $sorts = [], string $defaultSort = 'created_at', array $with = ['platform','artist','album','download']   )
    {
        $filters=[
            AllowedFilter::partial('title'),
            AllowedFilter::callback('artist_name',function($query,$value){
                $query->whereHas('artist',function($query) use ($value){
                    $query->where('name','ilike','%'.$value.'%');
                });
            })
        ];

        $sorts = [
            AllowedSort::field('title'),
            AllowedSort::field('created_at'),
            AllowedSort::field('id'),
        ];

        // Use static fillable array instead of querying first record
        $fillableFields = ['platform_id', 'artist_id', 'album_id', 'title', 'duration', 'cover_url', 'added_by'];

        return QueryBuilder::for(Song::query())
        ->allowedFilters($filters)
        ->allowedSorts($sorts)
        ->allowedFields($fillableFields)
        ->allowedIncludes($with)
        ->with(['download'])
        ->defaultSort($defaultSort)
        ->paginate($perPage);
    }

    public function getWithRelations()
    {
        return $this->model->with(['platform', 'artist', 'album', 'addedBy'])->get();
    }



    public function searchByQuery(string $search)
    {
        return $this->model->with(['artist', 'album', 'platform'])
            ->where('title', 'LIKE', "%{$search}%")
            ->orWhereHas('artist', function($query) use ($search) {
                $query->where('name', 'LIKE', "%{$search}%");
            })
            ->orWhereHas('album', function($query) use ($search) {
                $query->where('name', 'LIKE', "%{$search}%");
            })
            ->orWhereHas('platform', function($query) use ($search) {
                $query->where('name', 'LIKE', "%{$search}%");
            })
            ->get();
    }

    public function getByPlatform(Platform $platform)
    {
        return $this->model->where('platform_id', $platform->id)->get();
    }

    public function getByUser(User $user)
    {
        return $this->model->where('added_by', $user->id)->get();
    }

    public function findOneByPath(string $path): ?Song
    {
        return Song::query()->where('path', $path)->first();
    }

     /** @return Collection|array<array-key, Song> */
     public function createSong(Song $song):bool
     {
         return $song->save();
     }

     public function deleteSong(Song $song):bool
     {
         return $song->delete();
     }

     /** @return Collection|array<array-key, Song> */
     public function updateSong(Song $song, array $data):bool
     {
         return $song->update($data);
     }

    /** @return Collection|array<array-key, Song> */
    public function getAllStoredOnCloud(): Collection
    {
        return Song::query()->storedOnCloud()->get();
    }

    /** @return Collection|array<array-key, Song> */
    public function getRecentlyAdded(int $count = 10): Collection
    {
        return Song::query()
            ->accessible()
            ->withMeta()
            ->latest()
            ->limit($count)
            ->get();
    }

    /** @return Collection|array<array-key, Song> */
    public function getMostPlayed(int $count = 7): Collection
    {
        return Song::query()
            ->accessible()
            ->withMeta(requiresInteractions: true)
            ->where('interactions.play_count', '>', 0)
            ->orderByDesc('interactions.play_count')
            ->limit($count)
            ->get();
    }

    /** @return Collection|array<array-key, Song> */
    public function getRecentlyPlayed(int $count = 7): Collection
    {
        return Song::query()
            ->accessible()
            ->withMeta(requiresInteractions: true)
            ->where('interactions.play_count', '>', 0)
            ->addSelect('interactions.last_played_at')
            ->orderByDesc('interactions.last_played_at')
            ->limit($count)
            ->get();
    }


    public function getByGenre(
        string $genre,
        array $sortColumns,
        string $sortDirection,
        ?User $scopedUser = null,
        int $perPage = 50
    ): Paginator {
        return Song::query()
            ->accessible()
            ->withMeta()
            ->where('genre', $genre)
            ->sort($sortColumns, $sortDirection)
            ->simplePaginate($perPage);
    }

    /** @return Collection|array<array-key, Song> */
    public function getForQueue(
        array $sortColumns,
        string $sortDirection,
        int $limit = self::DEFAULT_QUEUE_LIMIT,
        ?User $scopedUser = null,
    ): Collection {
        return Song::query()
            ->accessible()
            ->withMeta()
            ->sort($sortColumns, $sortDirection)
            ->limit($limit)
            ->get();
    }

    /** @return Collection|array<array-key, Song> */
    public function getFavorites(?User $scopedUser = null): Collection
    {
        return Song::query()
            ->accessible()
            ->withMeta()
            ->where('interactions.liked', true)
            ->get();
    }

    /** @return Collection|array<array-key, Song> */
    public function getByAlbum(Album $album): Collection
    {
        return Song::query()
            ->whereBelongsTo($album)
            ->orderBy('songs.title')
            ->get();
    }

    /** @return Collection|array<array-key, Song> */
    public function getByArtist(Artist $artist): Collection
    {
        return Song::query()
            ->where('songs.artist_id', $artist->id)
            ->orderBy('songs.title')
            ->get();
    }

    /** @return Collection|array<array-key, Song> */
    public function getByStandardPlaylist(Playlist $playlist): Collection
    {
        return Song::query()
            ->leftJoin('playlist_songs', 'songs.id', '=', 'playlist_songs.song_id')
            ->leftJoin('playlists', 'playlists.id', '=', 'playlist_songs.playlist_id')
            ->where('playlists.id', $playlist->id)
            ->get();
    }

    /** @return Collection|array<array-key, Song> */
    public function getRandom(int $limit): Collection
    {
        return Song::query()
            ->accessible()
            ->withMeta()
            ->inRandomOrder()
            ->limit($limit)
            ->get();
    }

    /** @return Collection|array<array-key, Song> */
    public function getMany(array $ids, bool $preserveOrder = false): Collection
    {
        $songs = Song::query()
            ->accessible()
            ->withMeta()
            ->whereIn('songs.id', $ids)
            ->get();

        return $preserveOrder ? $songs->orderByArray($ids) : $songs; // @phpstan-ignore-line
    }



    /** @param string $id */
    public function getOne($id): Song
    {
        return Song::query()
            ->accessible()
            ->withMeta()
            ->findOrFail($id);
    }

    /** @param string $id */
    public function findOne($id): ?Song
    {
            return Song::query()
            ->accessible()
            ->withMeta()
            ->find($id);
    }

    public function countSongs(?User $scopedUser = null): int
    {
        return Song::where('owner_id', $scopedUser->id)->count();
    }


}
