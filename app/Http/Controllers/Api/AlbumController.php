<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Album;
use App\Models\Song;
use App\Services\AlbumService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

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
    public function index(): JsonResponse
    {
        $albums = Album::with(['artist', 'songs', 'owner'])->get();
        return response()->json([
            'success' => true,
            'albums' => $albums
        ]);
    }

    /**
     * Store a newly created album.
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'artist_id' => 'required|exists:artists,id',
            'year' => 'nullable|integer|min:1900|max:' . date('Y'),
            'cover_url' => 'nullable|url',
            'cover_image' => 'nullable|image|mimes:jpeg,png,jpg|max:5120', // 5MB max
            'owner_id' => 'required|exists:users,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $data = $request->only(['name', 'artist_id', 'year', 'cover_url', 'owner_id']);

            // Handle file upload
            if ($request->hasFile('cover_image')) {
                $image = $request->file('cover_image');
                $path = $image->store('albums', 'public');
                $data['cover_url'] = Storage::url($path);
            }
            \Log::info($data);
            $album = Album::create($data);
            $album->load(['artist', 'songs', 'owner']);

            return response()->json([
                'success' => true,
                'album' => $album,
                'message' => 'Album created successfully'
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create album',
                'message_exception' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified album.
     */
    public function show(Album $album): JsonResponse
    {
        $album->load(['artist', 'songs', 'owner']);
        return response()->json([
            'success' => true,
            'album' => $album
        ]);
    }

    /**
     * Update the specified album.
     */
    public function update(Request $request, Album $album): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'artist_id' => 'sometimes|required|exists:artists,id',
            'year' => 'nullable|integer|min:1900|max:' . date('Y'),
            'cover_url' => 'nullable|url',
            'cover_image' => 'nullable|image|mimes:jpeg,png,jpg|max:5120',
            'owner_id' => 'sometimes|required|exists:users,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $data = $request->only(['name', 'artist_id', 'year', 'cover_url']);

            // Handle file upload
            if ($request->hasFile('cover_image')) {
                // Delete old image if exists
                if ($album->cover_url && strpos($album->cover_url, '/storage/') !== false) {
                    $oldPath = str_replace('/storage/', '', $album->cover_url);
                    Storage::disk('public')->delete($oldPath);
                }

                $image = $request->file('cover_image');
                $path = $image->store('albums', 'public');
                $data['cover_url'] = Storage::url($path);
            }

            $album->update($data);
            $album->load(['artist', 'songs', 'owner']);

            return response()->json([
                'success' => true,
                'album' => $album,
                'message' => 'Album updated successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update album'
            ], 500);
        }
    }

    /**
     * Remove the specified album.
     */
    public function destroy(Album $album): JsonResponse
    {
        try {
            // Delete cover image if exists
            if ($album->cover_url && strpos($album->cover_url, '/storage/') !== false) {
                $oldPath = str_replace('/storage/', '', $album->cover_url);
                Storage::disk('public')->delete($oldPath);
            }

            $album->delete();

            return response()->json([
                'success' => true,
                'message' => 'Album deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete album'
            ], 500);
        }
    }

    /**
     * Add a song to an album.
     */
    public function addSong(Request $request, Album $album): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'song_id' => 'required|exists:songs,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $song = Song::findOrFail($request->song_id);
            $song->update(['album_id' => $album->id]);

            return response()->json([
                'success' => true,
                'message' => 'Song added to album successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to add song to album'
            ], 500);
        }
    }

    /**
     * Remove a song from an album.
     */
    public function removeSong(Album $album, Song $song): JsonResponse
    {
        try {
            $song->update(['album_id' => null]);

            return response()->json([
                'success' => true,
                'message' => 'Song removed from album successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to remove song from album'
            ], 500);
        }
    }

    /**
     * Search albums.
     */
    public function search(Request $request): JsonResponse
    {
        $query = $request->input('search', '');

        $albums = Album::with(['artist', 'songs', 'owner'])
            ->where('name', 'like', '%' . $query . '%')
            ->orWhereHas('artist', function ($q) use ($query) {
                $q->where('name', 'like', '%' . $query . '%');
            })
            ->get();

        return response()->json([
            'success' => true,
            'results' => $albums
        ]);
    }
}
