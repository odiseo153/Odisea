<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Artist;
use App\Models\Album;
use App\Models\Song;
use App\Models\Playlist;
use App\Models\Interaction;
use App\Models\Gender;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $user = User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);
        $user->songs()->saveMany(Song::factory(5)->make());
        $user->interactions()->saveMany(Interaction::factory(5)->make());
        $user->albums()->saveMany(Album::factory(5)->make());
        $user->playlists()->saveMany(Playlist::factory(5)->make());
        $user->favoriteSongs()->attach(Song::factory(5)->create());
        $user->favoritePlaylists()->saveMany(Playlist::factory(5)->create());

        User::factory(5)
        ->has(Song::factory(5)->has(Interaction::factory(random_int(1, 15))))
        ->has(Album::factory(5)->has(Song::factory(5)->has(Interaction::factory(random_int(1, 15)))))
        ->has(Playlist::factory(5)->has(Song::factory(5)->has(Interaction::factory(random_int(1, 15)))))
        ->create();

        Gender::factory(5)->has(Song::factory(5))->create();
        Interaction::factory(20)->create();
    }
}
