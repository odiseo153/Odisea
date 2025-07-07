<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\SongController;
use App\Http\Controllers\AlbumController;
use App\Http\Controllers\MusicController;
use App\Http\Controllers\ArtistController;
use App\Http\Controllers\PlaylistController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\PlaylistByIdController;

// Ruta para usuarios no autenticados - redirige a login
Route::get('/', function () {
    return redirect()->route('login');
})->middleware('guest');

// Rutas protegidas por autenticación y verificación de email
Route::middleware(['auth', 'verified'])->group(function () {
    // Dashboard
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Artists routes
    Route::controller(ArtistController::class)->group(function () {
        Route::get('artists', 'index')->name('artists.index');
        Route::get('artists/{artist}', 'show')->name('artists.show');
    });

    // Albums routes
    Route::controller(AlbumController::class)->group(function () {
        Route::get('albums', 'index')->name('albums.index');
        Route::get('album/{album}', 'show')->name('albums.show');
    });

    // Songs routes
    Route::controller(MusicController::class)->group(function () {
        Route::get('music', 'index')->name('music.index');
        Route::get('music/{song}', 'show')->name('music.show');
    });

    // Playlists routes
    Route::controller(PlaylistController::class)->group(function () {
        Route::get('playlists', 'index')->name('playlists.index');
        Route::get('playlist/{playlist}', 'show')->name('playlists.show');
    });

    Route::get('playlists/{playlist}', PlaylistByIdController::class)->name('playlists.show');

    // WebSocket Test Route
    Route::get('websocket-test', function () {
        return inertia('websocket-test');
    })->name('websocket.test');

});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
