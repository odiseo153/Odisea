<?php

namespace App\Http\Controllers\Api;

use App\Models\Song;
use App\Models\User;
use Inertia\Inertia;
use App\Models\Playlist;
use Illuminate\Http\Request;
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
        $user = auth()->user();
        
        return response()->json([
            'success' => true,
            'playlists' => $this->PlaylistService->getAllData()->map(function ($playlist) use ($user) {
                return [
                    'id' => $playlist->id,
                    'name' => $playlist->name,
                    'cover_image' => $playlist->cover_image,
                    'creator' => $playlist->creator,
                    'songs' => $playlist->songs,
                    'is_public' => $playlist->is_public,
                    'is_favorited' => $user ? $playlist->isFavoritedBy($user->id) : false,
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

    /**
     * Toggle favorite status for a playlist
     */
    public function toggleFavorite(Request $request,Playlist $playlist)
    {
        try {
            $user = $request->user();
            $user->favoritePlaylists()->toggle($playlist);
            return response()->json([
                'success' => true,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Check if playlist is favorited by current user
     */
    public function checkFavorite(Playlist $playlist)
    {
        try {
            $user = auth()->user();
            $isFavorited = $playlist->isFavoritedBy($user->id);

            return response()->json([
                'success' => true,
                'is_favorited' => $isFavorited
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get user's favorite playlists
     */
    public function getUserFavorites()
    {
        try {
            $user = auth()->user();
            $favoritePlaylists = Playlist::whereHas('favorites', function ($query) use ($user) {
                $query->where('user_id', $user->id);
            })->with(['creator', 'songs'])->get();

            return response()->json([
                'success' => true,
                'playlists' => $favoritePlaylists
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }




}
