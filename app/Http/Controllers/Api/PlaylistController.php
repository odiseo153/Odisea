<?php

namespace App\Http\Controllers\Api;

use App\Models\Song;
use Inertia\Inertia;
use App\Models\Playlist;
use App\Services\PlaylistService;
use App\Http\Controllers\Controller;
use App\Http\Requests\PlaylistRequest;

class PlaylistController extends Controller
{
    private PlaylistService $PlaylistService;
    public function __construct(PlaylistService $PlaylistService)
    {
        $this->PlaylistService = $PlaylistService;
    }

    public function index()
    {
        return response()->json([
            'success' => true,
            'playlists' => $this->PlaylistService->getAllData()->map(function ($playlist) {
                return [
                    'id' => $playlist->id,
                    'name' => $playlist->name,
                    'cover_image' => $playlist->cover_image,
                ];
            })
        ]);
    }

    public function addSong(Playlist $playlist, Song $song)
    {
        $this->PlaylistService->addSongToPlaylist($playlist, $song);
        return response()->json([
            'success' => true
        ]);
    }

    public function show(Playlist $Playlist)
    {
        try {
            return response()->json([
                'success' => true,
                'data' => $Playlist->load(['songs'])
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function store(PlaylistRequest $request)
    {
        try {
            $playlist = $this->PlaylistService->createPlaylist($request->validated());
            return response()->json([
                'success' => true,
                'playlist' => $playlist,
                'message' => 'Playlist created successfully'
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function update(PlaylistRequest $request, Playlist $playlist)
    {
        try {
            $updatedPlaylist = $this->PlaylistService->updatePlaylist($playlist->id, $request->validated());
            return response()->json([
                'success' => true,
                'playlist' => $updatedPlaylist,
                'message' => 'Playlist updated successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy(Playlist $Playlist)
    {
        try {
            $this->PlaylistService->deleteData($Playlist->id);
            return response()->json([
                'success' => true,
                'message' => 'Playlist deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }




}
