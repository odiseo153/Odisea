<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\Request;
use App\Models\{Song,Album,Artist,Platform,Gender};

class GetFavoriteUserDataController extends Controller
{
    /**
     * Display the dashboard.
     */
    public function __invoke(Request $request): Response
    {
        $user = $request->user();

       // Get favorite playlists using the new FavoritePlaylist model
       $favoritePlaylists = \App\Models\Playlist::whereHas('favorites', function ($query) use ($user) {
           $query->where('user_id', $user->id);
       })->with(['creator', 'songs'])->get();

       $data=[
        "Songs" => $user->favoriteSongs()->get(),
        "Playlists" => $favoritePlaylists,
        "Albums"=>Album::select('id', 'name', 'artist_id', 'cover_url')
            ->withCount('interactions')
            ->orderByDesc('interactions_count')
            ->take(5)
            ->get(),
        "Artists"=>Artist::select('id', 'name', 'image_url')
            ->withCount('interactions')
            ->orderByDesc('interactions_count')
            ->take(5)
            ->get()
       ];

       return Inertia::render('favorites/page', ['data' => $data]);
    }
}
