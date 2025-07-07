<?php

namespace App\Http\Controllers\Api;

use App\Models\FavoriteSong;
use App\Models\User;
use App\Models\Song;
use App\Services\FavoriteSongService;
use App\Http\Requests\FavoriteSongRequest;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class FavoriteSongController extends Controller
{
    public function __construct(private readonly FavoriteSongService $favoriteSongService)
    {
    }

    public function index()
    {
        try {
            return response()->json([
                'success' => true,
                'data' => $this->favoriteSongService->getAllData()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function show(FavoriteSong $favoriteSong)
    {
        try {
            return response()->json([
                'success' => true,
                'data' => $favoriteSong->load(['user', 'song'])
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function store(FavoriteSongRequest $request)
    {
        try {
            $favoriteSong = $this->favoriteSongService->createData($request->validated());
            return response()->json([
                'success' => true,
                'data' => $favoriteSong,
                'message' => 'Song added to favorites successfully'
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy(FavoriteSong $favoriteSong)
    {
        try {
            $this->favoriteSongService->deleteData($favoriteSong->id);
            return response()->json([
                'success' => true,
                'message' => 'Song removed from favorites successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    // Métodos adicionales específicos
    public function getUserFavorites(User $user)
    {
        try {
            return response()->json([
                'success' => true,
                'data' => $this->favoriteSongService->getUserFavoriteSongs($user->id)
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function getSongFavorites(Song $song)
    {
        try {
            return response()->json([
                'success' => true,
                'data' => $this->favoriteSongService->getSongFavorites($song->id)
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function toggle(Request $request)
    {
        try {
            $request->validate([
                'user_id' => 'required|string|exists:users,id',
                'song_id' => 'required|string|exists:songs,id'
            ]);

            $result = $this->favoriteSongService->toggleFavorite(
                $request->user_id,
                $request->song_id
            );

            return response()->json([
                'success' => true,
                'data' => $result
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function checkFavorite(Request $request)
    {
        try {
            $request->validate([
                'user_id' => 'required|string|exists:users,id',
                'song_id' => 'required|string|exists:songs,id'
            ]);

            $isFavorite = $this->favoriteSongService->isFavorite(
                $request->user_id,
                $request->song_id
            );

            return response()->json([
                'success' => true,
                'is_favorite' => $isFavorite
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
