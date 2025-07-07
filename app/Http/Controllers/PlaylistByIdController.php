<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Playlist;
use App\Http\Controllers\Controller;

class PlaylistByIdController extends Controller
{
    public function __invoke(Playlist $Playlist)
    {
        return Inertia::render('playlist/playlistById',
        ['playlistData' => $Playlist]);
    }

}
