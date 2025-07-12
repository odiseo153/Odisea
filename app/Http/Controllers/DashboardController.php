<?php

namespace App\Http\Controllers;

use App\Models\{Song,Album,Artist,Platform,Gender};
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Display the dashboard.
     */
    public function index(): Response
    {
       $data=[
        "most_played_song" => Song::select('id', 'title', 'artist_id', 'album_id')
            ->withCount('interactions')
            ->orderByDesc('interactions_count')
            ->first(),
        "most_played_songs" => Song::select('id', 'title', 'artist_id', 'album_id')
            ->withCount('interactions')
            ->orderByDesc('interactions_count')
            ->take(5)
            ->get(),
        "best_albums"=>Album::select('id', 'name', 'artist_id', 'cover_url')
            ->withCount('interactions')
            ->orderByDesc('interactions_count')
            ->take(5)
            ->get(),
        "best_artists"=>Artist::select('id', 'name', 'image_url')
            ->withCount('interactions')
            ->orderByDesc('interactions_count')
            ->take(5)
            ->get(),
        "best_platforms"=>Platform::select('id', 'name', 'logo_url')
            ->withCount('interactions')
            ->orderByDesc('interactions_count')
            ->take(5)
            ->get(),
        "best_genres"=>Gender::select('id', 'name')
            ->take(5)
            ->get(),

       ];

        return Inertia::render('dashboard', ['data' => $data]);
    }
}
