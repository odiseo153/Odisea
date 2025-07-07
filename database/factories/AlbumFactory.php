<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\Artist;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Album>
 */
class AlbumFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => $this->faker->sentence,
            'artist_id' => Artist::factory(),
            'owner_id' => User::factory(),
            'cover_url' => 'https://picsum.photos/400/400?' . $this->faker->randomNumber(),
            'year' => $this->faker->year,
        ];
    }
}
