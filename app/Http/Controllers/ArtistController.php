<?php

namespace App\Http\Controllers;

use App\Models\Artist;
use App\Services\ArtistService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ArtistController extends Controller
{
    protected $artistService;

    public function __construct(ArtistService $artistService)
    {
        $this->artistService = $artistService;
    }

    /**
     * Display a listing of artists.
     */
    public function index(Request $request): Response
    {
        $perPage = $request->input('per_page', 10);
        $artists = $this->artistService->getPaginated($perPage);

        return Inertia::render('artist/artist', [
            'artists' => $artists,
            'filters' => $request->input('filter', []),
            'sort' => $request->input('sort', '-created_at')
        ]);
    }

    /**
     * Display the specified artist.
     */
    public function show(Artist $artist): Response
    {
        return Inertia::render('artist/artistById', [
            'artist' => $artist->load(['albums', 'songs', 'interactions'])
        ]);
    }
}
