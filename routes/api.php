<?php

use App\Models\Song;
use App\Models\Artist;
use App\Models\Playlist;
use App\Models\Interaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AudioController;
use App\Http\Controllers\Api\SongController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\AlbumController;
use App\Http\Controllers\WebSocketController;
use App\Http\Controllers\Api\ArtistController;
use App\Http\Controllers\Api\PlatformController;
use App\Http\Controllers\Api\PlaylistController;
use App\Http\Controllers\Api\FavoriteSongController;

// Auth routes
Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');


    // Platform routes
    Route::prefix('platforms')->group(function () {
        Route::apiResource('/', PlatformController::class);
        Route::get('/search', [PlatformController::class, 'search']);
    Route::get('/with-songs', [PlatformController::class, 'withSongs']);
});

// Interaction routes
Route::post('interactions', function (Request $request) {
    $modelType = $request->input('model_type');
    $modelId = $request->input('model_id');
    $userId = $request->input('user_id');

    $modelClass = match($modelType) {
        'song' => Song::class,
        'playlist' => Playlist::class,
        'artist' => Artist::class,
        default => throw new \InvalidArgumentException('Invalid model type')
    };

    $model = $modelClass::findOrFail($modelId);

    // Check if the user exists, otherwise throw ModelNotFoundException
    $userModel = \App\Models\User::find($userId);
    if (!$userModel) {
        abort(404, "No query results for model [App\\Models\\User] {$userId}");
    }

    $interaction = $model->interactions()->updateOrCreate(
        ['user_id' => $userId],
        ['play_count' => DB::raw('play_count + 1')]
    );


    return response()->noContent();
});


Route::controller(AudioController::class)->middleware('cors')->group(function () {
    Route::get('audio/stream/{song}', 'stream')->name('audio.stream');
    Route::get('audio/stream-basic/{song}', 'streamBasic')->name('audio.stream.basic');
    Route::get('audio/info/{songId}', 'getAudioInfo')->name('audio.info');
    Route::get('audio/download-url/{songId}', 'getDownloadUrl')->name('audio.download.url');
    Route::options('audio/stream/{songId}', 'options')->name('audio.options');
});

// Song routes
Route::prefix('songs')->group(function () {
    Route::apiResource('/', SongController::class);
    Route::get('/search', [SongController::class, 'search']);
    Route::post('/{song}/favorite/{user}', [SongController::class, 'favorite']);
    Route::post('/{user}', [SongController::class, 'store']);
    Route::put('/{song}', [SongController::class, 'update']);
    Route::delete('/{song}', [SongController::class, 'destroy']);
});

// Playlist routes
Route::prefix('playlists')->group(function () {
    Route::apiResource('/', PlaylistController::class);
    Route::put('/{playlist}', [PlaylistController::class, 'update']);
    Route::post('/{playlist}/songs/{song}', [PlaylistController::class, 'addSong']);
    Route::put('/{playlist}', [PlaylistController::class, 'update']);
});

// Artist routes
Route::prefix('artists')->group(function () {
    Route::get('/', [ArtistController::class, 'index']);
    Route::get('/{artist}', [ArtistController::class, 'show']);
});

// Album routes
Route::prefix('albums')->group(function () {
    Route::apiResource('/', AlbumController::class);
    Route::get('/search', [AlbumController::class, 'search']);
    Route::post('/{album}/songs', [AlbumController::class, 'addSong']);
    Route::delete('/{album}/songs/{song}', [AlbumController::class, 'removeSong']);
});

// User routes
Route::prefix('users')->group(function () {
    Route::apiResource('/', UserController::class);
    Route::get('/search', [UserController::class, 'search']);
    Route::get('/{user}/playlists', [UserController::class, 'playlists']);
    Route::get('/{user}/favorite-songs', [UserController::class, 'favoriteSongs']);
});

// FavoriteSong routes
Route::prefix('favorite-songs')->group(function () {
    Route::apiResource('/', FavoriteSongController::class)->except(['update']);
    Route::get('/check', [FavoriteSongController::class, 'checkFavorite']);
    Route::post('/toggle', [FavoriteSongController::class, 'toggle']);
    Route::get('/users/{user}/favorites', [FavoriteSongController::class, 'getUserFavorites']);
    Route::get('/songs/{song}/favorites', [FavoriteSongController::class, 'getSongFavorites']);
});

// WebSocket routes
Route::prefix('websocket')->group(function () {
    Route::post('/emit-test', [WebSocketController::class, 'emitTestEvent']);
    Route::get('/connection-info', [WebSocketController::class, 'getConnectionInfo']);
    Route::post('/broadcast', [WebSocketController::class, 'broadcastMessage']);
});


