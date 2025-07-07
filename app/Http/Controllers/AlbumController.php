<?php

namespace App\Http\Controllers;

use App\Models\Album;
use App\Services\AlbumService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AlbumController extends Controller
{
    protected $albumService;

    public function __construct(AlbumService $albumService)
    {
        $this->albumService = $albumService;
    }

    /**
     * Display a listing of albums.
     */
    public function index(Request $request): Response
    {
        $perPage = $request->input('per_page', 10);
        $albums = $this->albumService->getPaginated($perPage);

        return Inertia::render('album/albums', [
            'albums' => $albums,
            'filters' => $request->input('filter', []),
            'sort' => $request->input('sort', '-created_at')
        ]);
    }

    /**
     * Display the specified album.
     */
    public function show(Album $album): Response
    {
        return Inertia::render('album/albumById', [
            'album' => $album->load(['songs', 'artist'])
        ]);
    }
}
