<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Artist;
use App\Models\Album;
use App\Models\Song;
use App\Models\Playlist;
use App\Models\Interaction;
use App\Models\Gender;
use App\Models\Platform;
use App\Models\Download;
use App\Models\FavoriteSong;
use App\Models\PlaylistSong;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create test user
        $testUser = User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);

        // Create additional users
        $users = User::factory(5)->create();
        $allUsers = $users->push($testUser);

        // Create platforms
        $platforms = collect([
            Platform::factory()->create(['name' => 'Spotify', 'url' => 'https://spotify.com']),
            Platform::factory()->create(['name' => 'Apple Music', 'url' => 'https://music.apple.com']),
            Platform::factory()->create(['name' => 'YouTube Music', 'url' => 'https://music.youtube.com']),
        ]);

        // Create artists for our specific songs
        $artists = collect([
            Artist::factory()->create(['name' => 'Kendrick Lamar', 'bio' => 'American rapper and songwriter']),
            Artist::factory()->create(['name' => 'Twenty One Pilots', 'bio' => 'American musical duo']),
            Artist::factory()->create(['name' => 'Imagine Dragons', 'bio' => 'American pop rock band']),
            Artist::factory()->create(['name' => 'Arcane', 'bio' => 'League of Legends soundtrack']),
            Artist::factory()->create(['name' => 'Mother Mother', 'bio' => 'Canadian indie rock band']),
            Artist::factory()->create(['name' => 'Cafuné', 'bio' => 'American indie pop duo']),
        ]);

        // Create albums for our specific songs
        $albums = collect([
            Album::factory()->create([
                'name' => 'GNX',
                'artist_id' => $artists[0]->id,
                'owner_id' => $testUser->id,
                'year' => 2024
            ]),
            Album::factory()->create([
                'name' => 'Scaled and Icy',
                'artist_id' => $artists[1]->id,
                'owner_id' => $testUser->id,
                'year' => 2021
            ]),
            Album::factory()->create([
                'name' => 'Mercury - Act 1',
                'artist_id' => $artists[2]->id,
                'owner_id' => $testUser->id,
                'year' => 2021
            ]),
            Album::factory()->create([
                'name' => 'Arcane (League of Legends)',
                'artist_id' => $artists[3]->id,
                'owner_id' => $testUser->id,
                'year' => 2021
            ]),
            Album::factory()->create([
                'name' => 'Dance and Cry',
                'artist_id' => $artists[4]->id,
                'owner_id' => $testUser->id,
                'year' => 2018
            ]),
            Album::factory()->create([
                'name' => 'Running',
                'artist_id' => $artists[5]->id,
                'owner_id' => $testUser->id,
                'year' => 2020
            ]),
        ]);

        // Create songs based on actual MP3 files
        $songsData = [
            [
                'title' => 'Not Like Us',
                'duration' => 274, // approximately 4:34
                'file_path' => '/storage/downloads/not_like_us.mp3',
                'artist_id' => $artists[0]->id,
                'album_id' => $albums[0]->id,
            ],
            [
                'title' => 'Ride',
                'duration' => 215, // approximately 3:35
                'file_path' => '/storage/downloads/ride.mp3',
                'artist_id' => $artists[1]->id,
                'album_id' => $albums[1]->id,
            ],
            [
                'title' => 'Come to Play',
                'duration' => 195, // approximately 3:15
                'file_path' => '/storage/downloads/come_to_play.mp3',
                'artist_id' => $artists[2]->id,
                'album_id' => $albums[2]->id,
            ],
            [
                'title' => 'Enemy',
                'duration' => 173, // approximately 2:53
                'file_path' => '/storage/downloads/enemy.mp3',
                'artist_id' => $artists[3]->id,
                'album_id' => $albums[3]->id,
            ],
            [
                'title' => 'Verbatim',
                'duration' => 199, // approximately 3:19
                'file_path' => '/storage/downloads/Mother Mother - Verbatim.mp3',
                'artist_id' => $artists[4]->id,
                'album_id' => $albums[4]->id,
            ],
            [
                'title' => 'Tek It',
                'duration' => 235, // approximately 3:55
                'file_path' => '/storage/downloads/Tek_it.mp3',
                'artist_id' => $artists[5]->id,
                'album_id' => $albums[5]->id,
            ],
        ];

        $songs = collect();
        foreach ($songsData as $songData) {
            $song = Song::create([
                'title' => $songData['title'],
                'duration' => $songData['duration'],
                'artist_id' => $songData['artist_id'],
                'album_id' => $songData['album_id'],
                'platform_id' => $platforms->random()->id,
                'added_by' => $testUser->id,
                'cover_url' => 'https://picsum.photos/400/400?' . rand(1000, 9999),
            ]);

            // Create download record for each song
            Download::create([
                'user_id' => $testUser->id,
                'song_id' => $song->id,
                'file_path' => $songData['file_path'],
            ]);

            $songs->push($song);
        }

        // Create playlists and add songs to them
        $playlists = collect([
            Playlist::factory()->create([
                'name' => 'My Favorites',
                'user_id' => $testUser->id,
                'is_public' => true,
            ]),
            Playlist::factory()->create([
                'name' => 'Chill Vibes',
                'user_id' => $testUser->id,
                'is_public' => true,
            ]),
            Playlist::factory()->create([
                'name' => 'Workout Mix',
                'user_id' => $testUser->id,
                'is_public' => false,
            ]),
        ]);

        // Add songs to playlists
        foreach ($playlists as $playlist) {
            $playlistSongs = $songs->random(rand(3, 5));
            foreach ($playlistSongs as $song) {
                PlaylistSong::create([
                    'playlist_id' => $playlist->id,
                    'song_id' => $song->id,
                ]);
            }
        }

        // Add songs to favorites for all users
        foreach ($allUsers as $user) {
            $favoriteSongs = $songs->random(rand(2, 4));
            foreach ($favoriteSongs as $song) {
                FavoriteSong::create([
                    'user_id' => $user->id,
                    'song_id' => $song->id,
                ]);
            }
        }

        // Create additional playlists for other users
        foreach ($users as $user) {
            $userPlaylists = Playlist::factory(rand(1, 3))->create([
                'user_id' => $user->id,
                'is_public' => fake()->boolean(70),
            ]);

            foreach ($userPlaylists as $playlist) {
                $playlistSongs = $songs->random(rand(2, 4));
                foreach ($playlistSongs as $song) {
                    PlaylistSong::create([
                        'playlist_id' => $playlist->id,
                        'song_id' => $song->id,
                    ]);
                }
            }
        }

        // Create interactions for songs
        foreach ($songs as $song) {
            Interaction::factory(rand(5, 20))->create([
                'interactable_type' => Song::class,
                'interactable_id' => $song->id,
                'user_id' => $allUsers->random()->id,
            ]);
        }

        // Create genders and associate with songs
        $genders = collect([
            Gender::factory()->create(['name' => 'Hip Hop']),
            Gender::factory()->create(['name' => 'Alternative Rock']),
            Gender::factory()->create(['name' => 'Pop Rock']),
            Gender::factory()->create(['name' => 'Electronic']),
            Gender::factory()->create(['name' => 'Indie Pop']),
        ]);

        foreach ($songs as $song) {
            $song->genders()->attach($genders->random(rand(1, 2)));
        }

        // Create some additional random songs for variety
        $additionalSongs = Song::factory(10)->create([
            'added_by' => $testUser->id,
            'platform_id' => $platforms->random()->id,
        ]);

        foreach ($additionalSongs as $song) {
            // Create interactions
            Interaction::factory(rand(1, 10))->create([
                'interactable_type' => Song::class,
                'interactable_id' => $song->id,
                'user_id' => $allUsers->random()->id,
            ]);

            // Associate with genders
            $song->genders()->attach($genders->random(rand(1, 2)));
        }

        echo "Database seeded successfully!\n";
        echo "Created:\n";
        echo "- " . $allUsers->count() . " users\n";
        echo "- " . $artists->count() . " artists\n";
        echo "- " . $albums->count() . " albums\n";
        echo "- " . ($songs->count() + $additionalSongs->count()) . " songs\n";
        echo "- " . $playlists->count() . " playlists (+ additional user playlists)\n";
        echo "- " . $platforms->count() . " platforms\n";
        echo "- " . $genders->count() . " genders\n";
        echo "- Download records for real MP3 files\n";
        echo "- Favorite songs for all users\n";
        echo "- Playlist songs associations\n";
        echo "- Interactions for all songs\n";
    }
}
