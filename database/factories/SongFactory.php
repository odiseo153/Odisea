<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\Album;
use App\Models\Artist;
use App\Models\Platform;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Song>
 */
class SongFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'title' => $this->faker->sentence,
            'duration' => $this->faker->randomFloat(2, 1, 10),
            'cover_url' => 'https://picsum.photos/400/400?' . $this->faker->randomNumber(),
            'album_id' => Album::factory(),
            'added_by' => User::factory(),
            'platform_id' => Platform::factory(),
            'artist_id' => Artist::factory(),
        ];
    }
}
