<?php

namespace App\Http\Controllers\Api;

use App\Models\Song;
use App\Models\User;
use Illuminate\Http\Request;
use App\Services\SongService;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;
use App\Http\Requests\Music\SongRequest;
use Illuminate\Support\Facades\DB;

class SongController extends Controller
{
    public function __construct(private readonly SongService $songService)
    {
    }

    public function index()
    {
        try {
            return response()->json([
                'success' => true,
                'data' => $this->songService->getSongsPaginated()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function show(Song $song)
    {
        try {
            return response()->json([
                'success' => true,
                'data' => $song->load(['platform', 'artist', 'album', 'addedBy'])
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function favorite(Song $song,User $user)
    {
        try {
            $user->favoriteSongs()->toggle($song);
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


    public function store(SongRequest $request,User $user)
    {
        try {
            $song = $this->songService->createSong($request->toArray(), $user);
            return response()->json([
                'success' => true,
                'data' => $song,
                'message' => 'Song created successfully'
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function interacion(Song $song,User $user)
    {
        try {
            $song->interactions()->updateOrCreate([
                'user_id' => $user->id,
            ],
            [
                'play_count' => DB::raw('play_count + 1')
            ]);

            return response()->noContent();

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }


    public function update(SongRequest $request, Song $song)
    {
        \Log::info($request);

        try {
            $this->songService->updateSong($song, $request->validated());
            return response()->json([
                'success' => true,
                'data' => $song->fresh(),
                'message' => 'Song updated successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy(Song $song)
    {
        Log::info($song);
        try {
            $this->songService->deleteSong($song);
            return response()->json([
                'success' => true,
                'message' => 'Song deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    // Métodos adicionales específicos
    public function search(Request $request)
    {
        try {
            $search = $request->query('search');
            $songs = $this->songService->searchSongsByQuery($search);
            return response()->json([
                'success' => true,
                'results' => $songs
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
