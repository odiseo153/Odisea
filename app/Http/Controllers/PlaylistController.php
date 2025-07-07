<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Playlist;
use Illuminate\Http\Request;
use App\Services\PlaylistService;
use App\Http\Controllers\Controller;

class PlaylistController extends Controller
{
    protected $playlistService;

    public function __construct(PlaylistService $playlistService)
    {
        $this->playlistService = $playlistService;
    }

    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 10);
        $playlists = $this->playlistService->getPaginated($perPage);

        return Inertia::render('playlist/playlists', [
            'playlists' => $playlists,
            'filters' => $request->input('filter', []),
            'sort' => $request->input('sort', '-created_at')
        ]);
    }

    public function show(Playlist $playlist)
    {
        return Inertia::render('playlist/playlistById', [
            'playlistData' => $playlist->load(['songs', 'creator'])
        ]);
    }
}
