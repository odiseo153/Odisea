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
            'avatar' => 'https://i.pinimg.com/736x/bb/92/18/bb921809c898ccf383dfe4240c5e0c63.jpg',
            'email' => 'test@example.com',
            'is_admin' => true
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
                'cover_url' => 'https://i.scdn.co/image/ab67616d0000b2731ea0c62b2339cbf493a999ad',
                'album_id' => $albums[0]->id,
            ],
            [
                'title' => 'Ride',
                'duration' => 215, // approximately 3:35
                'file_path' => '/storage/downloads/ride.mp3',
                'artist_id' => $artists[1]->id,
                'cover_url' => 'https://i1.sndcdn.com/artworks-cfKd70yOUZZ1-0-t500x500.jpg',
                'album_id' => $albums[1]->id,
            ],
            [
                'title' => 'Come to Play',
                'duration' => 195, // approximately 3:15
                'file_path' => '/storage/downloads/come_to_play.mp3',
                'artist_id' => $artists[2]->id,
                'cover_url' => 'https://i.scdn.co/image/ab67616d0000b273c804a75ef762b8b0837da1a9',
                'album_id' => $albums[2]->id,
            ],
            [
                'title' => 'Enemy',
                'duration' => 173, // approximately 2:53
                'file_path' => '/storage/downloads/enemy.mp3',
                'artist_id' => $artists[3]->id,
                'cover_url' => 'https://i.scdn.co/image/ab67616d0000b273c804a75ef762b8b0837da1a9',
                'album_id' => $albums[3]->id,
            ],
            [
                'title' => 'Verbatim',
                'duration' => 199, // approximately 3:19
                'file_path' => '/storage/downloads/Mother Mother - Verbatim.mp3',
                'artist_id' => $artists[4]->id,
                'cover_url' => 'https://i1.sndcdn.com/artworks-Pvrtpj26G27x-0-t500x500.jpg',
                'album_id' => $albums[4]->id,
            ],
            [
                'title' => 'Tek It',
                'duration' => 235, // approximately 3:55
                'file_path' => '/storage/downloads/Tek_it.mp3',
                'artist_id' => $artists[5]->id,
                'cover_url' => 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSxmixVnlhJq6BYozdx6F3QjQjzuP0HLAoAOw&s',
                'album_id' => $albums[5]->id,
            ],
        ];

        $songs = collect();
        foreach ($songsData as $index => $songData) {
            
            $song = Song::create([
                'title' => $songData['title'],
                'duration' => $songData['duration'],
                'artist_id' => $songData['artist_id'],
                'album_id' => $songData['album_id'],
                'platform_id' => $platforms->random()->id,
                'added_by' => $testUser->id,
                'cover_url' => $songData['cover_url']
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
        echo "Playlists created successfully!\n";

        echo "Adding songs to playlists...\n";
        // Add songs to playlists
        foreach ($playlists as $playlistIndex => $playlist) {
            $playlistSongs = $songs->random(rand(3, 5));
            foreach ($playlistSongs as $songIndex => $song) {
                PlaylistSong::create([
                    'playlist_id' => $playlist->id,
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

        

        echo "Database seeded successfully!\n";
        echo "Created:\n";
        echo "- " . $allUsers->count() . " users\n";
        echo "- " . $artists->count() . " artists\n";
        echo "- " . $albums->count() . " albums\n";
        echo "- " . ($songs->count()) . " songs\n";
        echo "- " . $playlists->count() . " playlists (+ additional user playlists)\n";
        echo "- " . $platforms->count() . " platforms\n";
        echo "- " . $genders->count() . " genders\n";
        echo "- Download records for real MP3 files\n";
        echo "- Favorite songs for all users\n";
        echo "- Playlist songs associations\n";
        echo "- Interactions for all songs\n";
    }
}
