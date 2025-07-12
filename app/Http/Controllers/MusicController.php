<?php

namespace App\Http\Controllers;

use App\Models\Song;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\Request;
use App\Services\SongService;

class MusicController extends Controller
{
protected $songService;

    public function __construct(SongService $songService)
    {
        $this->songService = $songService;
    }

    public function index(Request $request): Response
    {
        $perPage = $request->input('per_page', 10);
        $songs = $this->songService->getSongsPaginated($perPage);

        return Inertia::render('song/songs', [
            'songs' => $songs,
            'filters' => $request->input('filter', []),
            'sort' => $request->input('sort', '-created_at')
        ]);
    }

    /**
     * Display the specified artist.
     */
    public function show(Request $request, Song $song): Response
    {
        // Optimized: Use the method from the model with limit
        $song->other_songs = $song->getOtherSongs();
        $song->is_favorite = $request->user()->favoriteSongs()->where('song_id', $song->id)->exists();

        return Inertia::render('song/songById', [
            'song' => $song
        ]);
    }
}
