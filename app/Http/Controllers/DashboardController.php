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
        "most_played_song" => Song::withCount('interactions')->orderByDesc('interactions_count')->first(),
        "most_played_songs" => Song::withCount('interactions')->orderByDesc('interactions_count')->take(5)->get(),
        "best_albums"=>Album::withCount('interactions')->orderByDesc('interactions_count')->take(5)->get(),
        "best_artists"=>Artist::withCount('interactions')->orderByDesc('interactions_count')->take(5)->get(),
        "best_platforms"=>Platform::withCount('interactions')->orderByDesc('interactions_count')->take(5)->get(),
        "best_genres"=>Gender::take(5)->get()->sortByDesc('interactions_count'),

       ];

        return Inertia::render('dashboard', ['data' => $data]);
    }
}
